// cloudfunctions/getMaterials/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { 
    userType, 
    userId, 
    enterpriseId,
    category2Id, 
    page = 1, 
    pageSize = 30 
  } = event

  try {
    // 构建查询条件（兼容 user_type 和 user_id）
    let whereCondition = {}
    
    if (userType === 'enterprise') {
      whereCondition = {
        user_type: 'enterprise',
        $or: [
          { enterprise_id: enterpriseId },
          { user_id: userId }
        ]
      }
    } else {
      whereCondition = {
        user_type: 'personal',
        user_id: userId
      }
    }

    // 分类筛选
    if (category2Id) {
      whereCondition.category2_id = category2Id
    }

    console.log('getMaterials whereCondition:', JSON.stringify(whereCondition))

    // 先查询总数
    const countRes = await db.collection('materials')
      .where(whereCondition)
      .count()
    
    console.log('Total count:', countRes.total)

    // 查询分页数据
    const res = await db.collection('materials')
      .where(whereCondition)
      .orderBy('create_time', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    return {
      success: true,
      data: res.data,
      total: countRes.total,
      page,
      pageSize
    }

  } catch (err) {
    console.error('getMaterials error:', err)
    return { success: false, error: err.message }
  }
}
