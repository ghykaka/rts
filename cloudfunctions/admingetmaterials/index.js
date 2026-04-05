const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { page = 1, pageSize = 20, name, type, userId } = event

  console.log('=== 获取素材列表 ===')
  console.log('params:', { page, pageSize, name, type, userId })

  try {
    const where = {}

    if (name) {
      where.name = db.RegExp({
        regexp: name,
        options: 'i'
      })
    }
    if (type) {
      where.type = type
    }
    if (userId) {
      where.user_id = userId
    }

    // 获取总数
    const countResult = await db.collection('materials')
      .where(where)
      .count()

    // 获取列表
    const listResult = await db.collection('materials')
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
    console.error('获取素材列表失败:', err)
    return {
      success: false,
      error: '获取数据失败'
    }
  }
}
