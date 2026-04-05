const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { page = 1, pageSize = 20, userId, phone, userType } = event

  console.log('=== 获取用户列表 ===')
  console.log('params:', { page, pageSize, userId, phone, userType })

  try {
    const where = {}

    if (userId) {
      where._id = userId
    }
    if (phone) {
      where.phone = db.RegExp({
        regexp: phone,
        options: 'i'
      })
    }
    if (userType) {
      where.user_type = userType
    }

    // 获取总数
    const countResult = await db.collection('users')
      .where(where)
      .count()

    // 获取列表
    const listResult = await db.collection('users')
      .where(where)
      .orderBy('created_at', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    console.log('查询结果:', {
      total: countResult.total,
      count: listResult.data.length
    })

    return {
      success: true,
      data: listResult.data,
      total: countResult.total
    }

  } catch (err) {
    console.error('获取用户列表失败:', err)
    return {
      success: false,
      error: '获取数据失败'
    }
  }
}
