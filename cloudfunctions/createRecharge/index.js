// cloudfunctions/createRecharge/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { userId, amount, type } = event

  try {
    // 创建充值记录
    const recharge = {
      user_id: userId,
      amount: amount,
      type: type,
      payment_method: 'wechat_pay',
      status: 'pending',
      created_at: new Date()
    }

    const rechargeRes = await db.collection('recharges').add({
      data: recharge
    })

    // 调用微信统一下单
    const result = await cloud.cloudPay.unifiedOrder({
      body: '让她生-余额充值',
      outTradeNo: rechargeRes._id,
      spbillCreateIp: wxContext.CLIENTIP,
      subMchId: 'your_mch_id', // 需要配置
      totalFee: amount,
      envId: 'liandaofutou-2gdayw0068d938b3',
      functionName: 'rechargeCallback'
    })

    return {
      success: true,
      data: result.payment
    }

  } catch (err) {
    console.error('createRecharge error:', err)
    return { success: false, error: err.message }
  }
}
