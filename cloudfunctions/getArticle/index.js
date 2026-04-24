const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const { id } = event

  if (!id) {
    return { success: false, error: '缺少文章ID' }
  }

  try {
    const result = await db.collection('articles').doc(id).get()

    if (!result.data) {
      return { success: false, error: '文章不存在' }
    }

    // 检查文章状态
    if (result.data.status === 'disabled') {
      return { success: false, error: '文章已下架' }
    }

    return { success: true, data: result.data }
  } catch (err) {
    console.error('getArticle error:', err)
    return { success: false, error: '获取文章失败' }
  }
}
