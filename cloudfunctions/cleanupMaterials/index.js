const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    // 获取所有 materials 数据
    const result = await db.collection('materials').limit(100).get()
    const materials = result.data
    
    let deletedCount = 0
    
    for (const item of materials) {
      // 删除旧字段格式的数据（有 name 或 owner_id 的）
      if (item.name !== undefined || item.owner_id !== undefined) {
        await db.collection('materials').doc(item._id).remove()
        deletedCount++
      }
    }
    
    return {
      success: true,
      message: `已删除 ${deletedCount} 条旧格式测试数据`,
      totalScanned: materials.length
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}
