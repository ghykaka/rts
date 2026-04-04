// cloudfunctions/createOrder/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { 
    userId, 
    templateId, 
    templateName,
    serviceType,
    cozeWorkflowId,
    inputParams,
    outputType,
    aspectRatio,
    duration,
    resolution,
    costType // balance 或 one_time
  } = event

  try {
    // 1. 获取模板定价
    let pricingQuery = {
      template_id: templateId,
      is_active: true
    }
    
    if (outputType === 'image' && aspectRatio) {
      pricingQuery.aspect_ratio = aspectRatio
    } else if (outputType === 'video' && duration && resolution) {
      pricingQuery.duration = duration
      pricingQuery.resolution = resolution
    }

    const pricingRes = await db.collection('template_pricing').where(pricingQuery).get()
    
    if (!pricingRes.data || pricingRes.data.length === 0) {
      return { success: false, error: '该模板暂无定价配置' }
    }

    const pricing = pricingRes.data[0]
    const costAmount = costType === 'balance' ? pricing.balance_price : pricing.one_time_price

    // 2. 如果是余额支付，检查余额是否充足
    if (costType === 'balance') {
      const userRes = await db.collection('users').doc(userId).get()
      const user = userRes.data
      
      if (!user) {
        return { success: false, error: '用户不存在' }
      }
      
      if (user.balance < costAmount) {
        return { success: false, error: '余额不足，请充值' }
      }
    }

    // 3. 创建订单
    const order = {
      user_id: userId,
      template_id: templateId,
      template_name: templateName,
      service_type: serviceType,
      coze_workflow_id: cozeWorkflowId,
      input_params: inputParams,
      output_type: outputType,
      aspect_ratio: aspectRatio,
      duration: duration,
      resolution: resolution,
      cost_amount: costAmount,
      cost_type: costType,
      status: 'pending',
      started_at: new Date(),
      created_at: new Date()
    }

    const orderRes = await db.collection('orders').add({
      data: order
    })

    // 4. 如果是余额支付，扣除余额
    if (costType === 'balance') {
      await db.collection('users').doc(userId).update({
        data: {
          balance: _.inc(-costAmount),
          updated_at: new Date()
        }
      })
    }

    return {
      success: true,
      data: {
        orderId: orderRes._id,
        costAmount: costAmount
      }
    }

  } catch (err) {
    console.error('createOrder error:', err)
    return { success: false, error: err.message }
  }
}
