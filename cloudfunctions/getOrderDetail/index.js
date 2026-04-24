const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

/**
 * 获取订单详情
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { orderId } = event

  console.log('getOrderDetail:', { orderId, openid: wxContext.OPENID })

  if (!orderId) {
    return { success: false, error: '订单ID不能为空' }
  }

  try {
    // 查询订单
    const orderRes = await db.collection('orders').doc(orderId).get()
    if (!orderRes.data) {
      return { success: false, error: '订单不存在' }
    }

    const order = orderRes.data

    // 验证用户权限（用户只能查看自己的订单）
    if (event.userId && order.user_id !== event.userId) {
      if (wxContext.OPENID) {
        const userRes = await db.collection('users')
          .where({ openid: wxContext.OPENID })
          .limit(1)
          .get()
        if (!userRes.data?.length || userRes.data[0]._id !== order.user_id) {
          return { success: false, error: '无权访问该订单' }
        }
      } else {
        return { success: false, error: '无权访问该订单' }
      }
    }

    // 获取关联数据（并行查询优化）
    let template = null
    let material = null
    let size = null
    let workflowProduct = null
    let fixedFieldMappings = []

    // 并行查询所有关联数据
    const queryPromises = []
    
    // 查询工作流产品
    if (order.workflow_product_id) {
      queryPromises.push(
        db.collection('workflow_products').doc(order.workflow_product_id).get().then(wpRes => {
          if (wpRes.data) {
            workflowProduct = {
              name: wpRes.data.name || '',
              outputFields: (wpRes.data.output_fields || []).map(f => ({
                fieldName: f.field_name || f.fieldName || '',
                fieldKey: f.field_key || f.fieldKey || '',
                fieldType: f.field_type || f.fieldType || 'image',
                downloadable: f.downloadable ?? true,
                copyable: f.copyable ?? false
              })),
              inputFields: (wpRes.data.input_fields || []).map(f => ({
                fieldName: f.field_name || f.fieldName || '',
                fieldKey: f.field_key || f.fieldKey || ''
              }))
            }
            console.log('工作流产品 input_fields 配置:', JSON.stringify(workflowProduct.inputFields))
            fixedFieldMappings = wpRes.data.fixed_field_mappings || []
          }
        })
      )
    }
    
    // 查询模板
    if (order.template_id) {
      queryPromises.push(
        db.collection('templates').doc(order.template_id).get().then(templateRes => {
          if (templateRes.data) {
            template = {
              name: templateRes.data.templateName || templateRes.data.name || '',
              cover: templateRes.data.thumbnail || templateRes.data.cover || '',
              prompt: templateRes.data.prompt || ''
            }
          }
        })
      )
    }
    
    // 等待所有查询完成
    await Promise.all(queryPromises)
    
    // 后续查询（优先使用订单中的 material_id 和 size_id）
    const sizePromise = order.size_id
      ? db.collection('generate_sizes').doc(order.size_id).get()
      : template?.size_id 
        ? db.collection('generate_sizes').doc(template.size_id).get()
        : Promise.resolve({ data: null })
    
    const materialPromise = order.material_id
      ? db.collection('materials').doc(order.material_id).get()
      : order.template_id 
        ? db.collection('materials').where({ template_id: order.template_id }).limit(1).get()
        : Promise.resolve({ data: null })
    
    // 并行获取尺寸和素材
    const [sizeRes, materialsRes] = await Promise.all([sizePromise, materialPromise])
    
    if (sizeRes.data) {
      size = {
        name: sizeRes.data.name || '',
        sizeValue: sizeRes.data.size_value || '',
        exampleImage: sizeRes.data.example_image || ''
      }
    }
    
    if (materialsRes.data?.length > 0) {
      const mat = materialsRes.data[0]
      material = {
        name: mat.title || mat.name || '',
        url: mat.url || mat.thumbnail_url || ''
      }
    }

    // 格式化输出结果（优先使用 output_data，兼容 output_result）
    let outputResult = order.output_data || order.output_result || {}
    if (typeof outputResult === 'string') {
      try {
        outputResult = JSON.parse(outputResult)
      } catch (e) {
        outputResult = { raw: outputResult }
      }
    }

    // 获取输出字段配置（优先使用订单中保存的配置，兼容从 workflowProduct 读取）
    // 统一字段名格式：支持 field_name 和 fieldName 两种格式
    const rawOutputFields = order.output_fields || workflowProduct?.outputFields || []
    const outputFields = rawOutputFields.map(f => ({
      fieldName: f.field_name || f.fieldName || f.fieldKey || '',
      field_key: f.field_key || f.fieldKey || '',
      field_type: f.field_type || f.fieldType || 'image',
      downloadable: f.downloadable ?? (f.field_type === 'image' || f.fieldType === 'image' || f.field_type === 'video' || f.fieldType === 'video'),
      copyable: f.copyable ?? (f.field_type === 'text' || f.fieldType === 'text'),
      ...f
    }))
    
    console.log('output_fields 配置:', JSON.stringify(outputFields))
    console.log('output_data 原始数据:', JSON.stringify(outputResult))
    
    // 根据输出配置格式化展示数据
    const formattedOutputs = formatOutputs(outputResult, outputFields)
    
    console.log('格式化输出结果:', JSON.stringify(formattedOutputs))

    // 构建 inputParamsArray（固定字段 + 配置的用户输入字段）
    const inputFieldsConfig = workflowProduct?.inputFields || []
    const inputParamsArray = buildInputParamsArray(order, template, material, size, fixedFieldMappings, inputFieldsConfig)

    // 构建设计详情
    const detail = {
      // 基本信息
      orderId: order._id,
      orderNo: generateOrderNo(order),
      functionName: order.function_name || '',
      serviceType: order.service_type || '',
      status: order.status || 'pending',
      statusText: getStatusText(order.status),
      cozeStatus: order.coze_status || '',
      
      // 时间信息（格式化）
      createdAt: formatTime(order.created_at),
      startedAt: formatTime(order.started_at),
      completedAt: formatTime(order.completed_at),
      // 原始时间戳（用于计算用时）
      createdAtRaw: order.created_at,
      startedAtRaw: order.started_at,
      completedAtRaw: order.completed_at,
      // 累计用时
      duration: calcDuration(order.created_at, order.completed_at),
      
      // 费用信息
      costAmount: (order.cost_amount || 0) / 100,
      costType: order.cost_type === 'balance' ? '余额支付' : '微信支付',
      wxOutTradeNo: order.wx_out_trade_no || '', // 微信支付单号
      
      // 素材信息
      template: template,
      material: material,
      size: size,
      workflowProduct: workflowProduct,
      
      // 用户输入参数
      inputParams: order.input_params || {},
      inputParamsArray: inputParamsArray,
      
      // 输出结果
      outputType: order.output_type || 'image',
      outputResult: outputResult,
      formattedOutputs: formattedOutputs,
      
      // 错误信息
      errorMsg: order.error_msg || ''
    }

    return {
      success: true,
      data: detail
    }

  } catch (err) {
    console.error('getOrderDetail 错误:', err)
    return { success: false, error: err.message }
  }
}

function formatTime(date) {
  if (!date) return ''
  // 转换为北京时间 (UTC+8)
  const d = new Date(date)
  d.setHours(d.getHours() + 8)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

// 计算累计用时
function calcDuration(startTime, endTime) {
  if (!startTime || !endTime) return ''
  try {
    const start = new Date(startTime)
    const end = new Date(endTime)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return ''
    const diffMs = end.getTime() - start.getTime()
    if (diffMs <= 0) return ''
    const seconds = Math.floor(diffMs / 1000)
    if (seconds < 60) return `${seconds}秒`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes < 60) return `${minutes}分${remainingSeconds}秒`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}时${remainingMinutes}分`
  } catch (e) {
    return ''
  }
}

function generateOrderNo(order) {
  if (!order.created_at) return ''
  const d = new Date(order.created_at)
  const dateStr = d.getFullYear().toString().slice(-2) + 
    String(d.getMonth() + 1).padStart(2, '0') + 
    String(d.getDate()).padStart(2, '0')
  const idStr = order._id ? order._id.slice(-6).toUpperCase() : ''
  return `WD${dateStr}${idStr}`
}

function getStatusText(status) {
  const statusMap = {
    'pending': '等待处理',
    'processing': '生成中',
    'completed': '已完成',
    'failed': '生成失败'
  }
  return statusMap[status] || status || '未知'
}

function formatOutputs(outputResult, outputFields) {
  console.log('formatOutputs input:', { 
    outputResult: JSON.stringify(outputResult), 
    outputFields: JSON.stringify(outputFields) 
  })
  
  // 如果没有配置或配置为空，直接返回原始输出的所有字段
  const hasConfig = outputFields && Array.isArray(outputFields) && outputFields.length > 0
  
  if (!hasConfig) {
    console.log('无输出字段配置，使用默认格式')
    const result = []
    for (const key of Object.keys(outputResult)) {
      const value = outputResult[key]
      if (value !== undefined && value !== null && value !== '') {
        result.push({
          fieldName: key,
          fieldKey: key,
          fieldType: isImageUrl(value) ? 'image' : 'text',
          value: value,
          downloadable: isImageUrl(value),
          copyable: !isImageUrl(value)
        })
      }
    }
    console.log('formatOutputs result (no config):', JSON.stringify(result))
    return result
  }

  // 根据配置格式化输出
  const result = []
  for (const field of outputFields) {
    const fieldKey = field.fieldKey || field.field_key || ''
    const value = outputResult[fieldKey]
    if (value !== undefined && value !== null && value !== '') {
      // 优先使用后台配置的 field_type，其次根据值自动检测（图片 > 视频 > 文本）
      const configuredType = field.field_type || field.fieldType || ''
      const autoType = isVideoUrl(value) ? 'video' : (isImageUrl(value) ? 'image' : 'text')
      const finalType = configuredType || autoType
      
      // 优先使用后台配置的 downloadable/copyable，其次根据类型自动判断
      const finalDownloadable = field.downloadable !== undefined && field.downloadable !== null 
        ? field.downloadable 
        : (finalType === 'image' || finalType === 'video')
      const finalCopyable = field.copyable !== undefined && field.copyable !== null
        ? field.copyable
        : (finalType === 'text')
      
      result.push({
        ...field,
        fieldName: field.fieldName || field.field_name || fieldKey,
        fieldKey: fieldKey,
        fieldType: finalType,
        value: value,
        downloadable: finalDownloadable,
        copyable: finalCopyable
      })
    }
  }
  
  // 如果根据配置没有匹配到任何字段，兜底显示原始数据中的所有字段
  if (result.length === 0) {
    console.log('配置字段未匹配到任何数据，兜底显示原始数据')
    for (const key of Object.keys(outputResult)) {
      const value = outputResult[key]
      
      // 处理值为对象的情况（检查常见字段如 url, image, file 等）
      if (value !== undefined && value !== null && typeof value === 'object') {
        // 尝试从对象中提取图片 URL
        const possibleImageKeys = ['url', 'image', 'file', 'src', 'download_url', 'downloadUrl']
        for (const imgKey of possibleImageKeys) {
          if (value[imgKey] && isImageUrl(value[imgKey])) {
            result.push({
              fieldName: key,
              fieldKey: key,
              fieldType: 'image',
              value: value[imgKey],
              downloadable: true,
              copyable: false
            })
            break
          }
        }
        continue
      }
      
      // 处理普通字符串值
      if (value !== undefined && value !== null && value !== '') {
        const isVideo = isVideoUrl(value)
        const isImage = isImageUrl(value)
        result.push({
          fieldName: key,
          fieldKey: key,
          fieldType: isVideo ? 'video' : (isImage ? 'image' : 'text'),
          value: String(value),
          downloadable: isImage || isVideo,
          copyable: !isImage && !isVideo
        })
      }
    }
  }
  
  console.log('formatOutputs result:', JSON.stringify(result))
  return result
}

function isImageUrl(value) {
  if (!value || typeof value !== 'string') return false
  // 微信云存储图片
  if (value.startsWith('cloud://')) return true
  // 带文件扩展名的 URL
  if (/\.(jpg|jpeg|png|gif|webp|bmp)\?*/i.test(value)) return true
  // HTTP/HTTPS 图片 URL
  if (value.startsWith('http://') || value.startsWith('https://')) {
    const lower = value.toLowerCase()
    // 常见的图片关键词或扩展名
    if (lower.includes('image') || lower.includes('img') || 
        lower.includes('.jpg') || lower.includes('.jpeg') || 
        lower.includes('.png') || lower.includes('.gif') ||
        lower.includes('.webp') || lower.includes('.bmp') ||
        lower.includes('/pic/') || lower.includes('/image/') ||
        lower.includes('photo/') || lower.includes('/photo')) {
      return true
    }
    // 常见图片托管服务（Coze、阿里云、腾讯云等）
    const imageHosts = [
      's.coze.cn',      // Coze
      'img.',           // 常见图片 CDN
      'image.',         // 常见图片 CDN
      'cdn.',           // CDN
      'pic.',           // 图片服务
      'photo.',         // 照片服务
      'file.',          // 文件服务
      'assets.',        // 资源服务
      'res.',           // 资源服务
    ]
    for (const host of imageHosts) {
      if (lower.includes(host)) return true
    }
  }
  return false
}

// 判断是否为视频 URL
function isVideoUrl(value) {
  if (!value || typeof value !== 'string') return false
  // 带视频扩展名的 URL
  if (/\.(mp4|avi|mov|wmv|flv|mkv|webm|3gp)\?*/i.test(value)) return true
  // HTTP/HTTPS 视频 URL
  if (value.startsWith('http://') || value.startsWith('https://')) {
    const lower = value.toLowerCase()
    // 常见的视频关键词或扩展名
    if (lower.includes('.mp4') || lower.includes('.avi') ||
        lower.includes('.mov') || lower.includes('.wmv') ||
        lower.includes('.flv') || lower.includes('.mkv') ||
        lower.includes('.webm') || lower.includes('.3gp') ||
        lower.includes('/video/') || lower.includes('/videos/') ||
        lower.includes('/movie/') || lower.includes('/clip/') ||
        lower.includes('video=') || lower.includes('vid=')) {
      return true
    }
  }
  return false
}

/**
 * 构建输入参数数组（只显示工作流配置的用户输入字段）
 */
function buildInputParamsArray(order, template, material, size, fixedFieldMappings, inputFieldsConfig) {
  const params = []
  const userInput = order.input_params || {}
  
  console.log('buildInputParamsArray 输入:', { 
    userInputKeys: Object.keys(userInput), 
    inputFieldsConfigLength: inputFieldsConfig?.length || 0,
    inputFieldsConfig: inputFieldsConfig
  })
  
  // 系统字段黑名单（这些字段不应该显示在用户输入中）
  const systemFields = new Set([
    'size_category', 'size_name', 'size_value', 'size_id', 'size',
    'template_id', 'template_name', 'template_cover', 'template',
    'material_id', 'material_name', 'material_url', 'material',
    'workflow_product_id', 'coze_workflow_id', 'function_id',
    'category', 'name', 'value', 'url', 'cover', 'image', 'id',
    'user_id', 'created_at', 'updated_at', 'status', 'order_id'
  ])
  
  // 获取配置的用户输入字段 key -> 显示名称 映射
  const inputFieldMap = new Map()
  const hasConfig = inputFieldsConfig && Array.isArray(inputFieldsConfig) && inputFieldsConfig.length > 0
  
  if (hasConfig) {
    for (const f of inputFieldsConfig) {
      const key = f.fieldKey || f.field_key
      const name = f.fieldName || f.field_name || key
      if (key) inputFieldMap.set(key, name)
    }
  }
  
  console.log('inputFieldMap 大小:', inputFieldMap.size, 'keys:', Array.from(inputFieldMap.keys()))
  
  // 处理用户输入字段
  if (userInput && typeof userInput === 'object') {
    for (const [key, value] of Object.entries(userInput)) {
      // 跳过系统字段
      if (systemFields.has(key.toLowerCase()) || systemFields.has(key)) {
        console.log(`跳过系统字段: ${key}`)
        continue
      }
      
      // 如果有配置，只显示配置中的字段
      if (hasConfig && inputFieldMap.size > 0 && !inputFieldMap.has(key)) {
        console.log(`跳过未配置的用户输入字段: ${key}`)
        continue
      }
      
      // 跳过值为对象、数组或空字符串的字段
      if (value === undefined || value === null) continue
      if (typeof value === 'object') continue // 跳过对象和数组
      if (value === '') continue
      
      const displayName = inputFieldMap.get(key) || key
      params.push({
        key: displayName,
        value: String(value),
        isImage: isImageUrl(value)
      })
    }
  }
  
  console.log('buildInputParamsArray 结果:', JSON.stringify(params))
  return params
}
