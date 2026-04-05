const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { 
    page = 1, 
    pageSize = 20, 
    outTradeNo, 
    userId, 
    phone,
    transactionId,
    status,
    startDate,
    endDate
  } = event

  console.log('=== 获取充值记录 ===')
  console.log('params:', event)

  try {
    const where = {}

    if (outTradeNo) {
      where.out_trade_no = outTradeNo
    }
    if (userId) {
      where.user_id = userId
    }
    if (transactionId) {
      where.wechat_transaction_id = transactionId
    }
    if (status) {
      where.status = status
    }
    if (startDate || endDate) {
      where.created_at = {}
      if (startDate) {
        where.created_at.gte = startDate + 'T00:00:00.000Z'
      }
      if (endDate) {
        where.created_at.lte = endDate + 'T23:59:59.999Z'
      }
    }

    // 如果有手机号，先查找用户
    let userIds = null
    if (phone) {
      const userRes = await db.collection('users')
        .where({
          phone: db.RegExp({
            regexp: phone,
            options: 'i'
          })
        })
        .field({ _id: true })
        .get()
      
      if (userRes.data && userRes.data.length > 0) {
        userIds = userRes.data.map(u => u._id)
      } else {
        return {
          success: true,
          data: [],
          total: 0,
          totalAmount: 0,
          successCount: 0
        }
      }
    }

    if (userIds) {
      where.user_id = db.command.in(userIds)
    }

    // 获取总数
    const countResult = await db.collection('recharges')
      .where(where)
      .count()

    // 获取成功订单的总金额
    const successResult = await db.collection('recharges')
      .where({ ...where, status: 'success' })
      .field({ amount_cent: true })
      .get()

    const totalAmount = successResult.data.reduce((sum, item) => sum + (item.amount_cent || 0), 0)
    const successCount = successResult.data.length

    // 获取列表
    const listResult = await db.collection('recharges')
      .where(where)
      .orderBy('created_at', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    console.log('查询结果:', {
      total: countResult.total,
      count: listResult.data.length,
      totalAmount,
      successCount
    })

    // 关联用户信息
    const rechargeList = listResult.data || []
    if (rechargeList.length > 0) {
      const uidList = [...new Set(rechargeList.map(r => r.user_id).filter(Boolean))]
      
      if (uidList.length > 0) {
        const usersRes = await db.collection('users')
          .where({
            _id: db.command.in(uidList)
          })
          .field({
            _id: true,
            phone: true,
            nickName: true,
            user_type: true,
            companyName: true
          })
          .get()
        
        const userMap = {}
        if (usersRes.data) {
          usersRes.data.forEach(u => {
            userMap[u._id] = u
          })
        }
        
        rechargeList.forEach(r => {
          const user = userMap[r.user_id]
          if (user) {
            r.user_phone = user.phone
            r.user_nickName = user.nickName
            r.user_type = user.user_type
            r.user_companyName = user.companyName
          }
        })
      }
    }

    return {
      success: true,
      data: rechargeList,
      total: countResult.total,
      totalAmount,
      successCount
    }

  } catch (err) {
    console.error('获取充值记录失败:', err)
    return {
      success: false,
      error: '获取数据失败'
    }
  }
}
