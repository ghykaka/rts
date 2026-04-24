const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// Coze API 配置
const COZE_API_BASE = 'https://api.coze.cn'
const ACCESS_TOKEN = 'pat_Roqj7UcU5clYdyjZ1XXGxu7mIsabPDNnVx8jckw7QtEbfak6Y8tVWaX4IWk8nytU'

/**
 * 查询 Coze 工作流任务结果
 */
async function queryCozeWorkflowResult(conversation_id, chat_id) {
  console.log('=== 查询 Coze 工作流结果 ===')
  console.log('conversation_id:', conversation_id)
  console.log('chat_id:', chat_id)

  try {
    const response = await axios.post(
      `${COZE_API_BASE}/v1/workflows/retrieve`,
      {
        conversation_id: conversation_id,
        chat_id: chat_id
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    )

    const result = response.data
    console.log('Coze 查询响应:', JSON.stringify(result))

    if (result.code !== 0) {
      return {
        success: false,
        error: result.msg || '查询失败'
      }
    }

    return {
      success: true,
      data: {
        status: result.data?.status, // pending, succeeded, failed
        conversation_id: result.data?.conversation_id,
        chat_id: result.data?.chat_id,
        output: result.data?.data, // 工作流输出
        error: result.data?.error
      }
    }

  } catch (err) {
    console.error('查询工作流结果失败:', err.message)
    return {
      success: false,
      error: err.message
    }
  }
}

/**
 * 云函数入口
 * 支持两种调用方式：
 * 1. 按订单ID查询（order_id）
 * 2. 按 conversation_id + chat_id 查询
 */
exports.main = async (event, context) => {
  const { order_id, conversation_id, chat_id } = event

  console.log('queryWorkflowResult 收到参数:', JSON.stringify(event))

  try {
    let finalConversationId = conversation_id
    let finalChatId = chat_id

    // 1. 如果传入的是订单ID，先获取任务ID
    if (order_id) {
      const orderRes = await db.collection('orders').doc(order_id).get()
      if (!orderRes.data) {
        return { success: false, error: '订单不存在' }
      }

      const order = orderRes.data
      finalConversationId = order.conversation_id
      finalChatId = order.chat_id

      if (!finalConversationId || !finalChatId) {
        return {
          success: false,
          error: '订单尚未开始执行'
        }
      }
    }

    if (!finalConversationId || !finalChatId) {
      return {
        success: false,
        error: '缺少 conversation_id 或 chat_id'
      }
    }

    // 2. 查询 Coze 工作流状态
    const result = await queryCozeWorkflowResult(finalConversationId, finalChatId)

    if (!result.success) {
      return result
    }

    // 3. 如果订单存在且状态变化，更新订单
    if (order_id) {
      const updateData = {
        coze_status: result.data.status
      }

      // 如果任务完成
      if (result.data.status === 'succeeded') {
        updateData.status = 'completed'
        updateData.completed_at = new Date()
        
        // 解析输出结果
        if (result.data.output) {
          try {
            const output = typeof result.data.output === 'string' 
              ? JSON.parse(result.data.output) 
              : result.data.output
            updateData.output_result = output
          } catch (e) {
            console.error('解析输出结果失败:', e)
            updateData.output_result = result.data.output
          }
        }
      } else if (result.data.status === 'failed') {
        updateData.status = 'failed'
        updateData.error_msg = result.data.error
        updateData.completed_at = new Date()
      }

      await db.collection('orders').doc(order_id).update({
        data: updateData
      })

      // 返回带订单ID的结果
      return {
        ...result,
        order_id: order_id,
        status: updateData.status
      }
    }

    return result

  } catch (err) {
    console.error('queryWorkflowResult 错误:', err)
    return { success: false, error: err.message }
  }
}
