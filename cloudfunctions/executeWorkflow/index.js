// cloudfunctions/executeWorkflow/index.js
const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// Coze API 配置
const COZE_API_BASE = 'https://api.coze.cn'
const ACCESS_TOKEN = 'pat_Roqj7UcU5clYdyjZ1XXGxu7mIsabPDNnVx8jckw7QtEbfak6Y8tVWaX4IWk8nytU'

exports.main = async (event, context) => {
  const { orderId, cozeWorkflowId, templateId, inputParams } = event

  console.log('=== executeWorkflow 开始 ===')
  console.log('orderId:', orderId)
  console.log('cozeWorkflowId:', cozeWorkflowId)

  try {
    // 1. 获取订单信息
    let orderData = null
    if (orderId) {
      const orderRes = await db.collection('orders').doc(orderId).get()
      orderData = orderRes.data
    }
    
    if (!orderData) {
      console.error('订单不存在:', orderId)
      return { success: false, error: '订单不存在' }
    }

    // 2. 获取工作流产品配置
    let workflowProduct = null
    let fixedFieldMappings = []
    let outputFieldsConfig = []
    let inputFieldsConfig = [] // 输入字段配置（img1, img2 等用户上传的图片）
    
    if (orderData.workflow_product_id) {
      const wpRes = await db.collection('workflow_products').doc(orderData.workflow_product_id).get()
      if (wpRes.data) {
        workflowProduct = wpRes.data
        fixedFieldMappings = wpRes.data.fixed_field_mappings || []
        // 读取 output_fields 配置（工作流输出字段，如 outimg1, outimg2 等）
        outputFieldsConfig = wpRes.data.output_fields || []
        // 读取 input_fields 配置（用户输入字段，如 img1, img2 等）
        inputFieldsConfig = wpRes.data.input_fields || []
        console.log('工作流产品:', workflowProduct.name)
        console.log('输入字段配置 (input_fields):', JSON.stringify(inputFieldsConfig))
        console.log('输出字段配置 (output_fields):', JSON.stringify(outputFieldsConfig))
      }
    }

    // 3. 获取模板信息
    let template = null
    const effectiveTemplateId = templateId || orderData.template_id
    if (effectiveTemplateId) {
      const templateRes = await db.collection('templates').doc(effectiveTemplateId).get()
      if (templateRes.data) {
        template = templateRes.data
        console.log('模板:', template.templateName || template.name)
      }
    }

    // 4. 获取尺寸信息
    let size = null
    const sizeIdToUse = orderData.size_id || template?.size_id
    if (sizeIdToUse) {
      const sizeRes = await db.collection('generate_sizes').doc(sizeIdToUse).get()
      if (sizeRes.data) {
        size = sizeRes.data
      }
    }

    // 5. 获取素材信息
    let material = null
    const materialIdToUse = orderData.material_id
    if (materialIdToUse) {
      const materialRes = await db.collection('materials').doc(materialIdToUse).get()
      if (materialRes.data) {
        material = materialRes.data
      }
    }

    // 6. 构建工作流参数
    const workflow_data = {}
    const dataSources = { templates: template, materials: material, generate_sizes: size }
    const imageFields = ['cover', 'url', 'example_image']

    console.log('=== 开始构建工作流参数 ===')
    console.log('fixedFieldMappings:', JSON.stringify(fixedFieldMappings))
    console.log('inputFieldsConfig:', JSON.stringify(inputFieldsConfig))
    console.log('outputFieldsConfig:', JSON.stringify(outputFieldsConfig))
    console.log('inputParams (原始):', JSON.stringify(inputParams))

    // 处理固定字段映射
    for (const mapping of fixedFieldMappings) {
      const { source_table, source_field, target_field } = mapping
      if (!source_table || !source_field || !target_field) continue
      
      const sourceData = dataSources[source_table]
      if (!sourceData) continue
      
      let value = sourceData[source_field]
      if (value === undefined || value === null) continue
      
      // cloud:// 转 https
      if (imageFields.includes(source_field) && typeof value === 'string' && value.startsWith('cloud://')) {
        try {
          const tempRes = await cloud.getTempFileURL({ fileList: [value] })
          if (tempRes.fileList?.[0]?.tempFileURL) {
            value = tempRes.fileList[0].tempFileURL
          }
        } catch (e) {
          console.error('获取文件URL失败:', e)
        }
      }
      
      workflow_data[target_field] = value
    }

    // 添加用户输入参数
    if (inputParams) {
      // 使用 inputFieldsConfig 作为输入字段白名单（不是 outputFieldsConfig）
      const allowedFields = new Set(fixedFieldMappings.map(m => m.target_field))
      for (const field of inputFieldsConfig) {
        const fieldKey = field.field_key || field.fieldKey
        if (fieldKey) allowedFields.add(fieldKey)
      }
      
      console.log('allowedFields (输入白名单):', Array.from(allowedFields))
      console.log('inputParams keys:', Object.keys(inputParams))
      
      // 如果 allowedFields 为空，允许所有字段通过（兼容未配置的旧数据）
      const allowAll = allowedFields.size === 0
      
      const imagePromises = []
      Object.keys(inputParams).forEach(key => {
        // 如果没有配置字段映射，允许所有字段通过
        if (!allowAll && !allowedFields.has(key)) {
          console.log(`跳过未配置的字段 ${key}`)
          return
        }
        
        const value = inputParams[key]
        console.log(`处理用户输入 ${key}:`, typeof value === 'string' ? value.substring(0, 80) : JSON.stringify(value)?.substring(0, 80))
        
        // 处理数组形式的图片（如多图上传）
        if (Array.isArray(value)) {
          const arrayPromises = value.map((item, idx) => {
            if (item && typeof item === 'string' && item.startsWith('cloud://')) {
              return cloud.getTempFileURL({ fileList: [item] }).then(res => {
                if (res.fileList?.[0]?.tempFileURL) {
                  console.log(`✅ ${key}[${idx}] 转换为:`, res.fileList[0].tempFileURL.substring(0, 80))
                  return res.fileList[0].tempFileURL
                }
                return item
              }).catch(err => {
                console.error(`❌ ${key}[${idx}] 转换出错:`, err.message)
                return item
              })
            }
            return Promise.resolve(item)
          })
          imagePromises.push(
            Promise.all(arrayPromises).then(results => ({ key, value: results }))
          )
        } else if (value && typeof value === 'string' && value.startsWith('cloud://')) {
          // 处理单张图片
          imagePromises.push(
            cloud.getTempFileURL({ fileList: [value] }).then(res => {
              if (res.fileList?.[0]?.tempFileURL) {
                console.log(`✅ ${key} 转换为:`, res.fileList[0].tempFileURL.substring(0, 80))
                return { key, value: res.fileList[0].tempFileURL }
              }
              console.log(`⚠️ ${key} 转换失败，保留原值`)
              return { key, value }
            }).catch(err => {
              console.error(`❌ ${key} 转换出错:`, err.message)
              return { key, value }
            })
          )
        } else {
          // 非 cloud:// 地址，直接设置（可能是 https:// 或普通文本）
          workflow_data[key] = value || ''
        }
      })
      
      if (imagePromises.length > 0) {
        console.log(`等待 ${imagePromises.length} 个图片URL转换...`)
        const results = await Promise.all(imagePromises)
        results.forEach(r => { 
          if (r) workflow_data[r.key] = r.value 
        })
        console.log('图片URL转换完成')
      }
    }

    console.log('开始调用 Coze API...')
    console.log('cozeWorkflowId:', cozeWorkflowId)
    console.log('工作流参数:', JSON.stringify(workflow_data))

    if (!cozeWorkflowId) {
      console.error('❌ cozeWorkflowId 为空！')
      await updateOrderStatus(orderId, 'failed', null, null, 'cozeWorkflowId 为空')
      return { success: false, error: 'cozeWorkflowId 为空' }
    }

    if (Object.keys(workflow_data).length === 0) {
      console.warn('⚠️ workflow_data 为空，工作流可能缺少参数')
    }

    // 7. 调用 Coze API
    const response = await axios.post(
      `${COZE_API_BASE}/v1/workflow/run`,
      { workflow_id: cozeWorkflowId, parameters: workflow_data },
      {
        headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
        timeout: 120000
      }
    )

    const result = response.data
    console.log('Coze 响应 code:', result.code)
    console.log('Coze 响应 msg:', result.msg)
    console.log('Coze 响应 data:', JSON.stringify(result.data)?.substring(0, 500))

    if (result.code !== 0) {
      await updateOrderStatus(orderId, 'failed', null, null, '执行工作流失败: ' + result.msg)
      return { success: false, error: result.msg }
    }

    // 8. 解析返回数据
    // Coze 返回格式: { code: 0, data: "{\"key\":\"value\"}", msg: "", ... }
    let cozeResultData = null
    
    if (result.data) {
      try {
        cozeResultData = typeof result.data === 'string' 
          ? JSON.parse(result.data) 
          : result.data
        console.log('解析 Coze 返回数据成功，字段:', Object.keys(cozeResultData))
      } catch (e) {
        console.error('JSON 解析失败:', e)
        cozeResultData = result.data
      }
    } else {
      console.log('Coze 返回 data 字段为空')
    }
    
    console.log('cozeResultData:', JSON.stringify(cozeResultData)?.substring(0, 200))

    // 9. 根据 output_fields 配置提取输出数据
    const outputData = {}
    let hasOutput = false
    
    if (outputFieldsConfig.length > 0 && cozeResultData) {
      for (const field of outputFieldsConfig) {
        const fieldKey = field.field_key || field.fieldKey || ''
        if (fieldKey && cozeResultData[fieldKey] !== undefined) {
          outputData[fieldKey] = cozeResultData[fieldKey]
          hasOutput = true
          console.log(`  输出 ${fieldKey}:`, String(cozeResultData[fieldKey]).substring(0, 80))
        }
      }
    }
    
    // 兼容旧格式
    if (!hasOutput && cozeResultData) {
      if (cozeResultData.output) {
        outputData.output = cozeResultData.output
        hasOutput = true
        console.log('  使用兼容格式 output:', String(cozeResultData.output).substring(0, 80))
      }
      if (cozeResultData.ai_PYQwenan || cozeResultData.generated_text) {
        outputData.ai_PYQwenan = cozeResultData.ai_PYQwenan || cozeResultData.generated_text
        hasOutput = true
      }
    }

    // 10. 更新订单状态
    // Coze 返回格式: { code, msg, data: { conversation_id, chat_id, id, ... } }
    const cozeData = typeof result.data === 'string' ? JSON.parse(result.data) : (result.data || {})
    
    const updateData = {
      conversation_id: cozeData.conversation_id || cozeData.id || result.conversation_id,
      chat_id: cozeData.chat_id || cozeData.id,
      status: hasOutput ? 'completed' : 'processing',
      output_result: outputData,  // 与 getUserOrders 保持一致
      output_fields: outputFieldsConfig
    }
    
    if (hasOutput) {
      updateData.completed_at = new Date()
    }
    
    await db.collection('orders').doc(orderId).update({ data: updateData })
    
    console.log('=== executeWorkflow 完成 ===')
    console.log('订单状态:', hasOutput ? 'completed' : 'processing')
    console.log('输出数据:', JSON.stringify(outputData))

    return { success: true, status: hasOutput ? 'completed' : 'processing', outputData }

  } catch (err) {
    console.error('executeWorkflow 异常:', err)
    await updateOrderStatus(orderId, 'failed', null, null, err.message)
    return { success: false, error: err.message }
  }
}

async function updateOrderStatus(orderId, status, conversationId, chatId, errorMsg) {
  try {
    const data = { status }
    if (conversationId) data.conversation_id = conversationId
    if (chatId) data.chat_id = chatId
    if (errorMsg) data.error_msg = errorMsg
    await db.collection('orders').doc(orderId).update({ data })
  } catch (e) {
    console.error('更新订单状态失败:', e)
  }
}
