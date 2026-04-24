const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { userId, page = 1, pageSize = 20 } = event

  console.log('=== 获取充值记录 ===', { userId, page, pageSize })

  if (!userId) {
    return { success: false, error: '用户ID不能为空' }
  }

  try {
    // 只查询充值成功的记录
    // 使用 and 查询：user_id = xxx AND status = 'success'
    const totalResult = await db.collection('recharges')
      .where({
        user_id: userId,
        status: 'success'
      })
      .count()

    const total = totalResult.total || 0
    console.log('总成功记录数:', total)

    // 分页查询成功的充值记录（按创建时间降序，最新的在前）
    const skip = (page - 1) * pageSize
    const result = await db.collection('recharges')
      .where({
        user_id: userId,
        status: 'success'
      })
      .orderBy('created_at', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    console.log('本次查询记录数:', result.data?.length || 0)

    // 格式化数据并手动排序（最新的在前）
    const records = (result.data || []).map(item => ({
      id: item._id,
      amount: item.amount_cent ? (item.amount_cent / 100).toFixed(2) : '0.00',
      type: item.type === 'enterprise' ? '企业余额' : '个人余额',
      status: item.status === 'success' ? '成功' : '处理中',
      outTradeNo: item.out_trade_no || '',
      wechatTradeNo: item.wechat_transaction_id || '',
      createdAt: item.created_at ? formatTime(item.created_at) : '',
      paidAt: item.paid_at ? formatTime(item.paid_at) : '',
      orderId: item.order_id || '',  // 关联的生成订单ID
      paymentPurpose: item.payment_purpose || 'recharge',  // recharge=充值, generate=单次付费
      _sortTime: new Date(item.created_at).getTime() || 0
    })).sort((a, b) => b._sortTime - a._sortTime)

    return {
      success: true,
      data: records,
      total: total,
      page: page,
      pageSize: pageSize,
      hasMore: skip + records.length < total
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
