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
    // 获取用户的充值记录（不依赖 orderBy，因为 created_at 是 ISO 字符串，云开发无法正确排序）
    const result = await db.collection('recharges')
      .where({
        user_id: userId
      })
      .limit(50)
      .get()

    console.log('查询到的记录数:', result.data?.length || 0)

    // 格式化数据并手动排序（最新的在前）
    const records = (result.data || []).map(item => ({
      id: item._id,
      amount: item.amount_cent ? (item.amount_cent / 100).toFixed(2) : '0.00',
      type: item.type === 'enterprise' ? '企业余额' : '个人余额',
      status: item.status === 'success' ? '成功' : '处理中',
      outTradeNo: item.out_trade_no || '',
      wechatTradeNo: item.wechat_transaction_id || '',  // 微信支付单号
      createdAt: item.created_at ? formatTime(item.created_at) : '',
      paidAt: item.paid_at ? formatTime(item.paid_at) : '',
      // 用于排序的时间戳
      _sortTime: new Date(item.created_at).getTime() || 0
    })).sort((a, b) => b._sortTime - a._sortTime) // 降序排列

    console.log('排序后记录:', records.map(r => r.createdAt))

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

// 格式化时间（转换为中国时区 UTC+8）
function formatTime(date) {
  if (!date) return ''
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    // 转换为中国时区
    const chinaOffset = 8 * 60 * 60 * 1000 // UTC+8
    const chinaTime = new Date(d.getTime() + chinaOffset)
    const year = chinaTime.getUTCFullYear()
    const month = String(chinaTime.getUTCMonth() + 1).padStart(2, '0')
    const day = String(chinaTime.getUTCDate()).padStart(2, '0')
    const hour = String(chinaTime.getUTCHours()).padStart(2, '0')
    const minute = String(chinaTime.getUTCMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  } catch (e) {
    return ''
  }
}
