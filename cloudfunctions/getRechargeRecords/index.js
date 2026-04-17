const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { userId } = event

  console.log('=== 获取充值记录 ===', userId)

  if (!userId) {
    return { success: false, error: '用户ID不能为空' }
  }

  try {
    // 获取用户的充值记录
    const result = await db.collection('recharges')
      .where({
        user_id: userId
      })
      .orderBy('created_at', 'desc')
      .limit(50)  // 最多显示50条
      .get()

    // 格式化数据
    const records = (result.data || []).map(item => ({
      id: item._id,
      amount: item.amount_cent ? (item.amount_cent / 100).toFixed(2) : '0.00',  // 金额（元）
      type: item.type === 'enterprise' ? '企业余额' : '个人余额',  // 类型
      status: item.status === 'success' ? '成功' : '处理中',  // 状态
      outTradeNo: item.out_trade_no || '',  // 商户订单号
      wechatTradeNo: item.wechat_transaction_id || '',  // 微信支付单号
      createdAt: item.created_at ? formatTime(item.created_at) : '',  // 创建时间
      paidAt: item.paid_at ? formatTime(item.paid_at) : ''  // 支付时间
    }))

    return {
      success: true,
      data: records
    }

  } catch (err) {
    console.error('获取充值记录失败:', err)
    return {
      success: false,
      error: err.message || '获取数据失败'
    }
  }
}

// 格式化时间
function formatTime(date) {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}
