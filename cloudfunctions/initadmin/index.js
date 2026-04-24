const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { username = 'admin', password = 'admin123' } = event
  
  try {
    // 检查是否已有管理员
    const existing = await db.collection('admin_users').count()
    
    if (existing.total > 0) {
      return { 
        success: false, 
        error: '管理员已存在，请直接登录',
        total: existing.total
      }
    }
    
    // 创建第一个管理员
    const result = await db.collection('admin_users').add({
      data: {
        username,
        password,
        role: 'admin',
        createTime: new Date()
      }
    })
    
    return {
      success: true,
      message: '管理员创建成功',
      id: result._id,
      credentials: { username, password }
    }
  } catch (err) {
    console.error('初始化管理员失败:', err)
    return {
      success: false,
      error: err.message || '初始化失败'
    }
  }
}
