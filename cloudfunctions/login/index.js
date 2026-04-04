// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { code, userInfo } = event

  try {
    // 1. 获取微信 openid
    const result = await cloud.auth.getOpenIdWithMiniCode({
      code: code,
      grantType: 'authorization_code'
    })
    
    const openid = result.openid
    if (!openid) {
      return { success: false, error: '获取openid失败' }
    }

    // 2. 查询用户是否已存在
    const userRes = await db.collection('users').where({
      openid: openid
    }).get()

    let userId
    let isNewUser = false

    if (userRes.data && userRes.data.length > 0) {
      // 用户已存在
      userId = userRes.data[0]._id
    } else {
      // 新用户注册，赠送5元余额
      isNewUser = true
      const newUser = {
        openid: openid,
        nickname: userInfo ? userInfo.nickName : '微信用户',
        avatar: userInfo ? userInfo.avatarUrl : '',
        user_type: 'personal',
        industry: '',
        enterprise_name: '',
        balance: 500, // 新用户赠送500积分=5元
        created_at: new Date(),
        updated_at: new Date()
      }
      
      const addRes = await db.collection('users').add({
        data: newUser
      })
      userId = addRes._id
    }

    // 3. 返回用户信息
    return {
      success: true,
      data: {
        userId: userId,
        isNewUser: isNewUser,
        openid: openid
      }
    }

  } catch (err) {
    console.error('login error:', err)
    return { success: false, error: err.message }
  }
}
