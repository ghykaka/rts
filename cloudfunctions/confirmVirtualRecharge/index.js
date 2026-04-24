// cloudfunctions/confirmVirtualRecharge/index.js
// 虚拟支付 - 确认充值（支持充值后自动支付生成订单）
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { rechargeId, amount, orderId } = event

  console.log('=== confirmVirtualRecharge ===')
  console.log('rechargeId:', rechargeId, 'amount:', amount, 'orderId:', orderId)

  if (!rechargeId) {
    return {
      success: false,
      error: '缺少 rechargeId'
    }
  }

  try {
    // 1. 查询充值记录（通过 out_trade_no 查询）
    const rechargeRes = await db.collection('recharges')
      .where({ out_trade_no: rechargeId })
      .get()

    if (!rechargeRes.data || rechargeRes.data.length === 0) {
      console.error('充值记录不存在:', rechargeId)
      return {
        success: false,
        error: '充值记录不存在'
      }
    }

    const recharge = rechargeRes.data[0]

    // 2. 检查是否已处理
    if (recharge.status === 'success') {
      console.log('该订单已处理过:', rechargeId)
      // 如果已处理但有 orderId，直接尝试支付订单
      if (orderId) {
        const payResult = await payOrderWithBalance(orderId, recharge.user_id)
        return payResult
      }
      return {
        success: true,
        message: '订单已确认'
      }
    }

    // 3. 更新充值记录（用 recharge._id 而不是 rechargeId）
    console.log('准备更新充值记录, _id:', recharge._id, 'status: pending -> success')
    
    const updateData = {
      status: 'success',
      payment_status: 'paid',
      confirmed_at: db.serverDate(),
      update_at: db.serverDate()
    }
    
    // 如果有 orderId，标记这是用于支付生成订单的
    if (orderId) {
      updateData.order_id = orderId
      updateData.payment_purpose = 'generate'  // 标记用途：generate=生成订单, recharge=充值
    } else {
      updateData.payment_purpose = 'recharge'  // 普通充值
    }
    
    const updateResult = await db.collection('recharges').doc(recharge._id).update({
      data: updateData
    })
    console.log('更新充值记录结果:', JSON.stringify(updateResult))

    // 6. 如果传入了 orderId，用虚拟支付的钱直接支付生成订单（不增加积分）
    if (orderId) {
      console.log('单次付费，准备支付生成订单:', orderId)
      const payResult = await payOrderWithBalance(orderId, recharge.user_id, true) // true=不检查余额
      return payResult
    }

    // 4. 计算积分（1元 = 100积分）- 只有普通充值才加积分
    const addScore = Math.round((amount || recharge.amount) * 100)

    // 5. 给用户加积分（仅限普通充值）
    if (recharge.type === 'enterprise') {
      // 企业充值
      let enterpriseId = null
      const userRes = await db.collection('users').doc(recharge.user_id).get()
      if (userRes.data && userRes.data.enterprise_id) {
        enterpriseId = userRes.data.enterprise_id
      }
      if (!enterpriseId) {
        const entRes = await db.collection('enterprises')
          .where({ admin_user_id: recharge.user_id })
          .get()
        if (entRes.data && entRes.data.length > 0) {
          enterpriseId = entRes.data[0]._id
        }
      }
      
      if (enterpriseId) {
        const enterpriseRes = await db.collection('enterprises').doc(enterpriseId).get()
        if (enterpriseRes.data) {
          const currentBalance = enterpriseRes.data.balance || 0
          const newBalance = currentBalance + addScore
          await db.collection('enterprises').doc(enterpriseId).update({
            data: { balance: newBalance, update_time: db.serverDate() }
          })
          console.log('企业积分更新成功:', { oldBalance: currentBalance, add: addScore, newBalance })
        }
      }
    } else {
      // 个人充值
      const userRes = await db.collection('users').doc(recharge.user_id).get()
      if (userRes.data && userRes.data._id) {
        const currentBalance = userRes.data.balance || 0
        const newBalance = currentBalance + addScore
        await db.collection('users').doc(recharge.user_id).update({
          data: { balance: newBalance, update_time: db.serverDate() }
        })
        console.log('个人积分更新成功:', { oldBalance: currentBalance, add: addScore, newBalance })
      }
    }

    return {
      success: true,
      message: '充值确认成功',
      addScore: addScore
    }

  } catch (err) {
    console.error('confirmVirtualRecharge error:', err)
    return {
      success: false,
      error: err.message || '处理失败'
    }
  }
}

// 用积分支付生成订单
// forcePaid: true=单次付费模式，不检查余额，直接标记支付成功
async function payOrderWithBalance(orderId, userId, forcePaid = false) {
  console.log('=== payOrderWithBalance ===')
  console.log('orderId:', orderId, 'userId:', userId, 'forcePaid:', forcePaid)

  try {
    // 1. 查询订单
    const orderRes = await db.collection('orders').doc(orderId).get()
    if (!orderRes.data) {
      return { success: false, error: '订单不存在' }
    }

    const order = orderRes.data
    console.log('订单状态:', order.status)

    // 2. 检查订单状态
    if (order.status === 'paid' || order.status === 'processing' || order.status === 'completed') {
      console.log('订单已支付，跳过')
      return { success: true, message: '订单已支付' }
    }

    // 3. 单次付费模式（虚拟支付直接抵扣）
    if (forcePaid) {
      console.log('单次付费模式：直接标记订单已支付')
      
      // 更新订单状态
      await db.collection('orders').doc(orderId).update({
        data: {
          status: 'paid',
          payment_status: 'paid',
          payment_type: 'virtual',
          payment_time: db.serverDate(),
          update_time: db.serverDate()
        }
      })
      console.log('订单状态更新为 paid（单次付费）')

      // 触发工作流执行
      try {
        const workflowRes = await cloud.callFunction({
          name: 'executeWorkflow',
          data: { orderId: orderId }
        })
        console.log('工作流执行请求结果:', workflowRes)
      } catch (wfErr) {
        console.error('触发工作流失败:', wfErr)
      }

      return { success: true, message: '支付成功' }
    }

    // 4. 积分支付模式：查询用户积分
    const userRes = await db.collection('users').doc(userId).get()
    if (!userRes.data) {
      return { success: false, error: '用户不存在' }
    }

    const userBalance = userRes.data.balance || 0
    const orderCost = order.cost_amount || 0

    console.log('用户余额:', userBalance, '订单价格:', orderCost)

    // 5. 检查积分是否足够
    if (userBalance < orderCost) {
      console.log('积分不足，订单转为待支付状态')
      await db.collection('orders').doc(orderId).update({
        data: {
          status: 'pending',
          payment_status: 'insufficient_balance',
          update_time: db.serverDate()
        }
      })
      return { 
        success: false, 
        error: `积分不足（需要${orderCost}积分，当前${userBalance}积分）`,
        insufficientBalance: true
      }
    }

    // 6. 扣除积分
    const newBalance = userBalance - orderCost
    await db.collection('users').doc(userId).update({
      data: { 
        balance: newBalance,
        update_time: db.serverDate()
      }
    })
    console.log('扣除积分成功，新余额:', newBalance)

    // 7. 更新订单状态
    await db.collection('orders').doc(orderId).update({
      data: {
        status: 'paid',
        payment_status: 'paid',
        payment_type: 'balance',
        payment_time: db.serverDate(),
        update_time: db.serverDate()
      }
    })
    console.log('订单状态更新为 paid')

    // 8. 触发工作流执行
    try {
      const workflowRes = await cloud.callFunction({
        name: 'executeWorkflow',
        data: { orderId: orderId }
      })
      console.log('工作流执行请求结果:', workflowRes)
    } catch (wfErr) {
      console.error('触发工作流失败:', wfErr)
    }

    return {
      success: true,
      message: '支付成功',
      newBalance: newBalance
    }

  } catch (err) {
    console.error('payOrderWithBalance error:', err)
    return { success: false, error: err.message }
  }
}
