const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

/**
 * 获取用户订单列表
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  // 获取 userId（优先从参数，没有则从上下文）
  let userId = event.userId || event.data?.userId
  
  // 如果都没传，尝试从 openid 获取
  if (!userId && wxContext.OPENID) {
    // 通过 openid 查找用户
    const userRes = await db.collection('users')
      .where({ openid: wxContext.OPENID })
      .limit(1)
      .get()
    
    if (userRes.data?.length > 0) {
      userId = userRes.data[0]._id
    }
  }

  const { 
    page = 1, 
    pageSize = 10, 
    status // 可选：pending, processing, completed, failed
  } = event

  console.log('getUserOrders:', { userId, page, pageSize, status })

  if (!userId) {
    return { success: false, error: '用户未登录' }
  }

  try {
    const collection = db.collection('orders')
    
    // 构建查询条件
    const where = { user_id: userId }
    if (status) {
      where.status = status
    }

    // 查询总数
    const countResult = await collection.where(where).count()
    const total = countResult.total

    // 分页查询
    const skip = (page - 1) * pageSize
    const ordersRes = await collection
      .where(where)
      .orderBy('created_at', 'desc')
      .skip(skip)
      .limit(pageSize)
      .field({
        _id: true,
        function_name: true,
        template_name: true,
        workflow_product_id: true,  // 用于动态获取 output_fields
        output_type: true,
        cost_amount: true,
        cost_type: true,
        status: true,
        output_result: true,
        created_at: true,
        completed_at: true
      })
      .get()

    // 格式化数据
    const orders = []
    for (const order of (ordersRes.data || [])) {
      // 动态获取预览图
      const previewUrl = await extractPreviewUrl(order.output_result, order.workflow_product_id, db)
      
      orders.push({
        orderId: order._id,
        functionName: order.function_name || '',
        templateName: order.template_name || '',
        outputType: order.output_type || 'image',
        costAmount: ((order.cost_amount || 0) / 100).toFixed(2),  // 分转元，保留2位小数
        costType: order.cost_type || 'balance',
        status: order.status || 'pending',
        // 预览图：根据工作流产品的 output_fields 配置动态获取
        previewUrl: previewUrl,
        // 返回完整结果供前端使用（包含所有图片）
        outputResult: order.output_result,
        createdAt: formatTime(order.created_at),
        completedAt: formatTime(order.completed_at)
      })
    }

    return {
      success: true,
      data: orders,
      total,
      page,
      pageSize,
      hasMore: skip + orders.length < total
    }

  } catch (err) {
    console.error('getUserOrders 错误:', err)
    return { success: false, error: err.message }
  }
}

// 提取预览图 URL - 根据工作流产品的 output_fields 配置动态获取
async function extractPreviewUrl(outputResult, workflowProductId, db) {
  if (!outputResult) return ''
  
  // 如果是字符串，尝试解析
  let data = outputResult
  if (typeof outputResult === 'string') {
    try {
      data = JSON.parse(outputResult)
    } catch (e) {
      // 解析失败，直接返回原字符串（可能是直接的URL）
      return outputResult
    }
  }
  
  // 优先从 data 字段获取（Coze API 返回格式）
  const resultData = data.data || data
  
  // 如果有工作流产品ID，读取其 output_fields 配置
  if (workflowProductId && db) {
    try {
      const wpRes = await db.collection('workflow_products').doc(workflowProductId).get()
      if (wpRes.data?.output_fields) {
        const outputFields = wpRes.data.output_fields
        // 按 sort 排序，依次尝试获取预览图
        for (const field of outputFields.sort((a, b) => (a.sort || 0) - (b.sort || 0))) {
          const fieldKey = field.field_key || field.fieldKey
          if (fieldKey && resultData[fieldKey]) {
            return resultData[fieldKey]
          }
        }
      }
    } catch (e) {
      console.error('读取 output_fields 失败:', e)
    }
  }
  
  // 如果没有配置或配置读取失败，返回第一个非空字段值
  if (typeof resultData === 'object' && resultData !== null) {
    for (const key of Object.keys(resultData)) {
      const value = resultData[key]
      if (value && typeof value === 'string' && value.startsWith('http')) {
        return value
      }
    }
  }
  
  return ''
}

// 格式化时间（北京时间 UTC+8）
function formatTime(date) {
  if (!date) return ''
  const d = new Date(date)
  d.setHours(d.getHours() + 8)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}
