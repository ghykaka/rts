// cloudfunctions/getUserInfo/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { userId } = event

  try {
    const userRes = await db.collection('users').doc(userId).get()
    
    if (!userRes.data) {
      return { success: false, error: '用户不存在' }
    }

    // 如果是企业用户，获取企业信息
    let enterpriseInfo = null
    if (userRes.data.user_type === 'enterprise' && userRes.data.industry) {
      // 使用 admin_user_id 查询（企业注册时使用的字段）
      const entRes = await db.collection('enterprises').where({
        admin_user_id: userId
      }).get()
      
      if (entRes.data && entRes.data.length > 0) {
        enterpriseInfo = entRes.data[0]
      }
    }

    return {
      success: true,
      data: {
        ...userRes.data,
        enterpriseInfo: enterpriseInfo
      }
    }

  } catch (err) {
    console.error('getUserInfo error:', err)
    return { success: false, error: err.message }
  }
}
