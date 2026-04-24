const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const { userId, userType, adminToken } = event

  // 验证管理员 token
  if (!adminToken || adminToken.length < 10) {
    return { success: false, error: '未登录或登录已过期' }
  }

  try {
    // 构建查询条件
    const where = {}
    if (userType) where.user_type = userType
    if (userId) where.user_id = userId

    const res = await db.collection('user_material_categories')
      .where(where)
      .orderBy('level', 'asc')
      .orderBy('order', 'asc')
      .get()

    return {
      success: true,
      data: res.data || []
    }
  } catch (err) {
    console.error('admingetusermaterials error:', err)
    return { success: false, error: err.message }
  }
}
