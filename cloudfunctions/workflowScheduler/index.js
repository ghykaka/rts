// cloudfunctions/workflowScheduler/index.js
// 定时触发器：检查待处理订单并执行工作流
const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// Coze API 配置
const COZE_API_BASE = 'https://api.coze.cn'
const ACCESS_TOKEN = 'pat_Roqj7UcU5clYdyjZ1XXGxu7mIsabPDNnVx8jckw7QtEbfak6Y8tVWaX4IWk8nytU'

exports.main = async (event, context) => {
  console.log('=== 工作流定时触发器开始 ===')
  console.log('触发时间:', new Date().toLocaleString('zh-CN'))
  
  try {
    // 查找待处理的订单
    // 1. pending 状态：等待执行的订单
    // 2. processing 状态但超过5分钟：可能执行中断的订单（超时保护）
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    
    const pendingOrders = await db.collection('orders')
      .where(_.or(
        { status: 'pending' },  // 待处理
        { 
          status: 'processing',  // 处理中的（超时重试）
          started_at: _.lt(fiveMinutesAgo)  // 且超过5分钟未完成
        }
      ))
      .where({ coze_workflow_id: _.exists(true) })
      .limit(5) // 每次最多处理 5 个
      .get()
    
    console.log('待处理订单数量:', pendingOrders.data?.length || 0)
    
    if (!pendingOrders.data || pendingOrders.data.length === 0) {
      console.log('没有待处理的订单')
      return { success: true, message: '没有待处理的订单' }
    }
    
    const results = []
    
    for (const order of pendingOrders.data) {
      console.log('处理订单:', order._id, order.function_name)
      
      try {
        // 使用 atomic 操作确保只处理一次（防止并发重复执行）
        const updateRes = await db.collection('orders').doc(order._id).update({
          data: {
            status: 'processing',
            started_at: new Date()
          }
        })
        
        // 检查是否更新成功（影响行数为0表示已被其他进程处理）
        if (updateRes.updated === 0) {
          console.log('订单已被其他进程处理，跳过:', order._id)
          continue
        }
        
        // 执行工作流
        const workflowResult = await executeWorkflow(order, db)
        
        // 更新订单状态
        await db.collection('orders').doc(order._id).update({
          data: {
            status: workflowResult.success ? 'completed' : 'failed',
            completed_at: new Date(),
            output_result: workflowResult.result_data || null,  // 与 getUserOrders 保持一致
            error_message: workflowResult.error || null
          }
        })
        
        results.push({
          orderId: order._id,
          success: workflowResult.success,
          error: workflowResult.error
        })
        
        console.log('订单处理完成:', order._id, workflowResult.success ? '成功' : '失败')
        
      } catch (err) {
        console.error('处理订单失败:', order._id, err.message)
        
        await db.collection('orders').doc(order._id).update({
          data: {
            status: 'failed',
            error_message: err.message,
            completed_at: new Date()
          }
        })
        
        results.push({
          orderId: order._id,
          success: false,
          error: err.message
        })
      }
    }
    
    console.log('=== 定时触发器结束 ===')
    return {
      success: true,
      processed: results.length,
      results
    }
    
  } catch (err) {
    console.error('定时触发器异常:', err)
    return { success: false, error: err.message }
  }
}

// 执行 Coze 工作流
async function executeWorkflow(order, db) {
  console.log('=== 执行工作流 ===')
  
  const cozeWorkflowId = order.coze_workflow_id
  const orderId = order._id
  
  try {
    // 获取工作流产品配置
    let workflowProduct = null
    let fixedFieldMappings = []
    let inputFieldsConfig = []
    
    if (order.workflow_product_id) {
      const wpRes = await db.collection('workflow_products').doc(order.workflow_product_id).get()
      if (wpRes.data) {
        workflowProduct = wpRes.data
        fixedFieldMappings = wpRes.data.fixed_field_mappings || []
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
    
    // 获取尺寸信息
    let size = null
    if (order.size_id) {
      const sizeRes = await db.collection('generate_sizes').doc(order.size_id).get()
      if (sizeRes.data) {
        size = sizeRes.data
      }
    }
    
    // 获取素材信息
    let material = null
    if (order.material_id) {
      const materialRes = await db.collection('materials').doc(order.material_id).get()
      if (materialRes.data) {
        material = materialRes.data
      }
    }
    
    // 构建数据源映射
    const dataSources = {
      templates: template,
      materials: material,
      generate_sizes: size
    }
    
    // 构建工作流参数
    const workflow_data = {}
    const imageFields = ['cover', 'url', 'example_image']
    
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
    
    // 处理用户输入参数
    const inputParams = order.input_params || {}
    
    if (Object.keys(inputParams).length > 0) {
      const allowedFields = new Set()
      
      // 添加固定字段映射的目标字段
      for (const mapping of fixedFieldMappings) {
        if (mapping.target_field) {
          allowedFields.add(mapping.target_field)
        }
      }
      
      // 添加 input_fields 配置的字段
      for (const field of inputFieldsConfig) {
        const fieldKey = field.field_key || field.fieldKey || field.fieldName
        if (fieldKey) allowedFields.add(fieldKey)
      }
      
      // 处理用户输入
      const imagePromises = []
      
      Object.keys(inputParams).forEach(key => {
        if (!allowedFields.has(key)) {
          console.log('跳过不需要的字段:', key)
          return
        }
        
        const value = inputParams[key]
        
        if (value !== undefined && value !== '') {
          // cloud:// 转 https
          if (typeof value === 'string' && value.startsWith('cloud://')) {
            imagePromises.push(
              cloud.getTempFileURL({ fileList: [value] }).then(tempRes => {
                if (tempRes.fileList?.[0]?.tempFileURL) {
                  return { key, value: tempRes.fileList[0].tempFileURL }
                }
                return { key, value }
              }).catch(() => ({ key, value }))
            )
          } else {
            workflow_data[key] = value
          }
        }
      })
      
      // 并行处理图片转换
      if (imagePromises.length > 0) {
        const imageResults = await Promise.all(imagePromises)
        imageResults.forEach(result => {
          workflow_data[result.key] = result.value
        })
      }
    }
    
    console.log('工作流参数:', JSON.stringify(workflow_data))
    
    // 调用 Coze API
    const response = await axios.post(
      `${COZE_API_BASE}/v1/workflow/run`,
      {
        workflow_id: cozeWorkflowId,
        parameters: workflow_data
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 240000 // 240 秒超时
      }
    )
    
    const result = response.data
    
    if (result.code !== 0) {
      return {
        success: false,
        error: result.msg || '执行工作流失败'
      }
    }
    
    return {
      success: true,
      result_data: result.data || result
    }
    
  } catch (err) {
    console.error('执行工作流失败:', err.message)
    return {
      success: false,
      error: err.message
    }
  }
}
