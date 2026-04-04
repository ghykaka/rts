// cloudfunctions/getOrders/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { userId, status, page = 1, pageSize = 10 } = event

  try {
    let query = db.collection('orders').where({
      user_id: userId
    })

    if (status) {
      query = query.where({
        status: status
      })
    }

    const res = await query.orderBy('created_at', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    return {
      success: true,
      data: {
        list: res.data,
        total: res.total
      }
    }

  } catch (err) {
    console.error('getOrders error:', err)
    return { success: false, error: err.message }
  }
}
