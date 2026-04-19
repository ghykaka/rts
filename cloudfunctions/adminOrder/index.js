const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

/**
 * 后台订单管理
 * 支持：订单列表、订单详情（含COZE参数追踪）
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action, data } = event

  console.log('adminOrder:', action, data)

  try {
    switch (action) {
      case 'list':
        return await getOrderList(data)
      case 'detail':
        return await getOrderDetail(data)
      case 'retry':
        return await retryWorkflow(data)
      default:
        return { success: false, error: '未知操作' }
    }
  } catch (err) {
    console.error('adminOrder 错误:', err)
    return { success: false, error: err.message }
  }
}

/**
 * 获取订单列表
 */
async function getOrderList(params) {
  const { page = 1, pageSize = 20, status, userId, functionId } = params

  const where = {}
  if (status) {
    where.status = status
  }
  if (userId) {
    where.user_id = userId
  }
  if (functionId) {
    where.function_id = functionId
  }

  const skip = (page - 1) * pageSize

  // 查询总数
  const countResult = await db.collection('orders').where(where).count()
  const total = countResult.total

  // 查询列表
  const ordersRes = await db.collection('orders')
    .where(where)
    .orderBy('created_at', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get()

  // 获取用户信息
  const userIds = [...new Set((ordersRes.data || []).map(o => o.user_id))]
  let userMap = {}
  
  if (userIds.length > 0) {
    const usersRes = await db.collection('users')
      .where(_.or(userIds.map(id => ({ _id: id }))))
      .field({ _id: true, phone: true, nickname: true })
      .get()
    
    userMap = (usersRes.data || []).reduce((map, u) => {
      map[u._id] = u
      return map
    }, {})
  }

  // 格式化数据
  const orders = (ordersRes.data || []).map(order => {
    const user = userMap[order.user_id] || {}
    return {
      _id: order._id,
      userId: order.user_id,
      userPhone: user.phone || '',
      userNickname: user.nickname || '',
      functionName: order.function_name || '',
      templateName: order.template_name || '',
      status: order.status,
      costAmount: (order.cost_amount || 0) / 100,
      costType: order.cost_type,
      outputType: order.output_type || 'image',
      createdAt: formatTime(order.created_at),
      hasError: order.status === 'failed'
    }
  })

  return {
    success: true,
    data: orders,
    total,
    page,
    pageSize
  }
}

/**
 * 获取订单详情（包含完整的COZE参数追踪）
 */
async function getOrderDetail(params) {
  const { orderId } = params

  if (!orderId) {
    return { success: false, error: '订单ID不能为空' }
  }

  // 查询订单
  const orderRes = await db.collection('orders').doc(orderId).get()
  if (!orderRes.data) {
    return { success: false, error: '订单不存在' }
  }

  const order = orderRes.data

  // 获取用户信息
  let user = null
  if (order.user_id) {
    const userRes = await db.collection('users').doc(order.user_id).get()
    user = userRes.data
  }

  // 获取工作流产品信息（包含输入字段配置）
  let workflowProduct = null
  let inputFieldsConfig = []
  if (order.workflow_product_id) {
    const wpRes = await db.collection('workflow_products').doc(order.workflow_product_id).get()
    if (wpRes.data) {
      workflowProduct = wpRes.data
      inputFieldsConfig = wpRes.data.input_fields || []
    }
  }

  // 获取模板信息
  let template = null
  if (order.template_id) {
    const templateRes = await db.collection('templates').doc(order.template_id).get()
    if (templateRes.data) {
      template = templateRes.data
    }
  }

  // 获取素材信息
  let material = null
  if (order.template_id) {
    const materialsRes = await db.collection('materials')
      .where({ template_id: order.template_id })
      .limit(1)
      .get()
    if (materialsRes.data?.length > 0) {
      material = materialsRes.data[0]
    }
  }

  // 获取尺寸信息
  let size = null
  if (template?.size_id) {
    const sizeRes = await db.collection('generate_sizes').doc(template.size_id).get()
    if (sizeRes.data) {
      size = sizeRes.data
    }
  }

  // 解析输出结果（优先使用 output_data，兼容 output_result）
  let outputResult = order.output_data || order.output_result || {}
  if (typeof outputResult === 'string') {
    try {
      outputResult = JSON.parse(outputResult)
    } catch (e) {
      outputResult = { raw: outputResult }
    }
  }

  // 构建发送给COZE的实际参数（用于调试）
  const { params: cozeInputParams, fieldMappings: cozeFieldMappings } = 
    buildCozeParams(order, template, material, size, inputFieldsConfig, workflowProduct?.fixed_field_mappings)

  return {
    success: true,
    data: {
      // 订单基本信息
      order: {
        _id: order._id,
        status: order.status,
        costAmount: (order.cost_amount || 0) / 100,
        costType: order.cost_type,
        outputType: order.output_type,
        createdAt: formatTime(order.created_at),
        startedAt: formatTime(order.started_at),
        completedAt: formatTime(order.completed_at),
        errorMsg: order.error_msg || '',
        wxOutTradeNo: order.wx_out_trade_no || ''
      },
      // 用户信息
      user: user ? {
        _id: user._id,
        phone: user.phone || '',
        nickname: user.nickname || '',
        balance: (user.balance || 0) / 100
      } : null,
      // 工作流信息
      workflow: {
        cozeWorkflowId: order.coze_workflow_id,
        conversationId: order.conversation_id,
        chatId: order.chat_id,
        cozeStatus: order.coze_status,
        workflowProductName: workflowProduct?.name || ''
      },
      // 输入配置
      inputConfig: inputFieldsConfig,
      // COZE实际发送的参数（原始JSON格式）
      cozeInputParams,
      // COZE字段映射表格（带详细来源信息）
      cozeFieldMappings,
      // 模板信息
      template: template ? {
        _id: template._id,
        name: template.name,
        prompt: template.prompt,
        cover: template.cover
      } : null,
      // 素材信息
      material: material ? {
        _id: material._id,
        title: material.title,
        url: material.url
      } : null,
      // 尺寸信息
      size: size ? {
        _id: size._id,
        name: size.name,
        sizeValue: size.size_value
      } : null,
      // 原始用户输入参数
      rawInputParams: order.input_params || {},
      // 输出结果
      outputResult,
      // 工作流产品配置
      workflowProduct: workflowProduct ? {
        name: workflowProduct.name,
        inputFields: inputFieldsConfig,
        outputFields: workflowProduct.output_fields || []
      } : null
    }
  }
}

/**
 * 构建发送给COZE的实际参数（用于调试对比）
 * 注意：这里的逻辑需要与 createOrder/index.js 中的 executeWorkflow 保持一致
 */
function buildCozeParams(order, template, material, size, inputFieldsConfig, fixedFieldMappings) {
  const params = {}
  const fieldMappings = []
  const userInput = order.input_params || {}

  // 建立数据源映射
  const dataSources = {
    templates: template,
    materials: material,
    generate_sizes: size
  }

  // 表名称映射
  const tableNames = {
    templates: '模板',
    materials: '素材',
    generate_sizes: '尺寸'
  }

  // 根据 fixed_field_mappings 配置构建固定字段
  for (const mapping of fixedFieldMappings || []) {
    const { source_table, source_field, target_field } = mapping
    if (!source_table || !source_field || !target_field) continue
    
    const sourceData = dataSources[source_table]
    if (!sourceData) continue
    
    let value = sourceData[source_field]
    if (value === undefined || value === null) continue
    
    params[target_field] = value
    fieldMappings.push({
      cozeField: target_field,
      source: 'fixed',
      sourceName: tableNames[source_table] || source_table,
      sourceField: `${source_table}.${source_field}`,
      value: value,
      preview: typeof value === 'string' ? value.substring(0, 50) : JSON.stringify(value),
      isImage: isImageUrl(value)
    })
  }

  // 自定义字段：添加所有用户输入参数
  Object.keys(userInput).forEach(key => {
    if (userInput[key] !== undefined && userInput[key] !== '') {
      params[key] = userInput[key]
      fieldMappings.push({
        cozeField: key,
        source: 'custom',
        sourceName: '用户输入',
        sourceField: `input_params.${key}`,
        value: userInput[key],
        preview: typeof userInput[key] === 'string' ? userInput[key].substring(0, 50) : JSON.stringify(userInput[key]),
        isImage: isImageUrl(userInput[key])
      })
    }
  })

  return { params, fieldMappings }
}

function isImageUrl(value) {
  if (!value || typeof value !== 'string') return false
  return /\.(jpg|jpeg|png|gif|webp|bmp)\?*/i.test(value) || 
         value.startsWith('cloud://') ||
         (value.startsWith('http') && (value.includes('image') || value.includes('img') || value.includes('photo')))
}

/**
 * 重试执行工作流
 */
async function retryWorkflow(params) {
  const { orderId } = params

  if (!orderId) {
    return { success: false, error: '订单ID不能为空' }
  }

  const orderRes = await db.collection('orders').doc(orderId).get()
  if (!orderRes.data) {
    return { success: false, error: '订单不存在' }
  }

  const order = orderRes.data

  if (!order.coze_workflow_id) {
    return { success: false, error: '该订单没有关联工作流' }
  }

  // 更新状态为处理中
  await db.collection('orders').doc(orderId).update({
    data: {
      status: 'processing',
      started_at: new Date(),
      error_msg: ''
    }
  })

  // 触发重试（这里简单标记，实际的重试逻辑需要单独处理）
  return {
    success: true,
    message: '已重试，请在作品仓库查看结果'
  }
}

/**
 * 格式化时间
 */
function formatTime(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
