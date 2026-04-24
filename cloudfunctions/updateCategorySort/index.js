// 轻量级排序更新云函数
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { updates } = event

  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    return { success: false, error: '无效数据' }
  }

  try {
    // 并行更新所有排序
    const promises = updates.map(item => {
      return db.collection('user_material_categories').doc(item._id).update({
        data: { order: Number(item.order) }
      })
    })
    
    const results = await Promise.all(promises)
    
    return { success: true, count: results.length }
  } catch (err) {
    console.error('updateSort error:', err)
    return { success: false, error: err.message }
  }
}
