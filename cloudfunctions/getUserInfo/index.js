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

    const userData = userRes.data
    
    // 如果用户有 enterprise_id，说明是企业管理员
    // 即使 user_type 字段没有更新，也能正确识别
    if (userData.enterprise_id) {
      try {
        const entRes = await db.collection('enterprises').doc(userData.enterprise_id).get()
        if (entRes.data) {
          // 更新用户数据，标记为企业用户
          userData.user_type = 'enterprise'
          userData.company_name = entRes.data.company_name
          userData.company_short_name = entRes.data.company_short_name
          userData.industry = entRes.data.industry
        }
      } catch (entErr) {
        console.error('get enterprise info error:', entErr)
      }
    }

    return {
      success: true,
      data: userData
    }

  } catch (err) {
    console.error('getUserInfo error:', err)
    return { success: false, error: err.message }
  }
}
