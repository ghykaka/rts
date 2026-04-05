const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const cloudStorage = cloud.database().command

exports.main = async (event, context) => {
  const { userId, type, name, url, size } = event

  console.log('=== 添加素材 ===')
  console.log('params:', { userId, type, name, url, size })

  if (!userId) {
    return {
      success: false,
      error: '缺少用户ID'
    }
  }

  try {
    // 验证用户是否存在
    const userRes = await db.collection('users').doc(userId).get()
    if (!userRes.data) {
      return {
        success: false,
        error: '用户不存在'
      }
    }

    // 添加素材记录
    const result = await db.collection('materials').add({
      data: {
        user_id: userId,
        type: type || 'image',
        name: name || '未命名素材',
        url: url || '',
        size: size || 0,
        created_at: db.serverDate(),
        update_at: db.serverDate()
      }
    })

    console.log('素材添加成功:', result._id)

    return {
      success: true,
      id: result._id
    }

  } catch (err) {
    console.error('添加素材失败:', err)
    return {
      success: false,
      error: '添加失败'
    }
  }
}
