const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { page = 1, pageSize = 20, userId, phone, userType, companyName } = event

  console.log('=== 获取用户列表 ===')
  console.log('params:', { page, pageSize, userId, phone, userType, companyName })

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
    if (companyName) {
      where.companyName = db.RegExp({
        regexp: companyName,
        options: 'i'
      })
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

    // 获取素材统计信息
    const userList = listResult.data || []
    if (userList.length > 0) {
      // 单独查询每个用户的素材统计
      for (const user of userList) {
        // 统计素材数量
        const countRes = await db.collection('materials')
          .where({ user_id: user._id })
          .count()
        user.materialCount = countRes.total
        
        // 计算总大小
        const sizeRes = await db.collection('materials')
          .where({ user_id: user._id })
          .field({ size: true })
          .get()
        user.materialSize = sizeRes.data.reduce((sum, m) => sum + (m.size || 0), 0)
      }
    }

    console.log('查询结果:', {
      total: countResult.total,
      count: userList.length
    })

    return {
      success: true,
      data: userList,
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
