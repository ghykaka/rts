const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const rp = require('request-promise')

const APP_SECRET = 'b77955de35a3cf320b998d4b7e03ca25'

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { code, encryptedData, iv } = event

  try {
    // 1. 获取微信 openid 和 session_key
    const appid = wxContext.APPID
    const result = await rp({
      method: 'POST',
      url: 'https://api.weixin.qq.com/sns/jscode2session',
      qs: {
        appid: appid,
        secret: APP_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      },
      json: true
    })

    const openid = result.openid
    const sessionKey = result.session_key

    if (!openid) {
      return { success: false, error: '获取openid失败' }
    }

    // 2. 解密手机号（如果获取到 session_key）
    let phoneNumber = ''
    if (encryptedData && iv && sessionKey) {
      try {
        const crypto = require('crypto')
        const encrypted = Buffer.from(encryptedData, 'base64')
        const key = Buffer.from(sessionKey, 'base64')
        const ivBuffer = Buffer.from(iv, 'base64')

        const decipher = crypto.createDecipheriv('aes-128-cbc', key, ivBuffer)
        decipher.setAutoPadding(true)

        let decoded = decipher.update(encrypted)
        decoded = Buffer.concat([decoded, decipher.final()])

        const padding = decoded[decoded.length - 1]
        if (padding > 0 && padding <= 32) {
          decoded = decoded.slice(0, decoded.length - padding)
        }

        const decryptedData = JSON.parse(decoded.toString())
        phoneNumber = decryptedData.phoneNumber || ''
      } catch (decryptErr) {
        console.error('decrypt error:', decryptErr)
      }
    }

    // 3. 查询用户是否已存在
    const userRes = await db.collection('users').where({
      openid: openid
    }).get()

    let userId
    let isNewUser = false

    if (userRes.data && userRes.data.length > 0) {
      // 用户已存在，更新手机号
      userId = userRes.data[0]._id
      const updateData = {
        updated_at: new Date()
      }
      if (phoneNumber) {
        updateData.phone = phoneNumber
      }
      await db.collection('users').doc(userId).update({
        data: updateData
      })
    } else {
      // 新用户注册，赠送500积分
      isNewUser = true
      const newUser = {
        openid: openid,
        phone: phoneNumber,
        nickname: phoneNumber ? '用户' + phoneNumber.slice(-4) : '微信用户',
        avatar: '',
        user_type: 'personal',
        industry: '',
        enterprise_name: '',
        enterprise_id: '',
        balance: 500,
        created_at: new Date(),
        updated_at: new Date()
      }

      const addRes = await db.collection('users').add({
        data: newUser
      })
      userId = addRes._id
    }

    // 4. 检查是否为预添加的企业子账号并自动激活关联
    console.log('Checking subaccount for phone:', phoneNumber)
    if (phoneNumber) {
      try {
        const subRes = await db.collection('enterprise_sub_accounts')
          .where({ phone: phoneNumber, status: 'pending' })
          .limit(1)
          .get()
        
        console.log('Subaccount query result:', JSON.stringify(subRes))
        
        if (subRes.data && subRes.data.length > 0) {
          const subAccount = subRes.data[0]
          console.log('Found subaccount:', JSON.stringify(subAccount))
          // 更新子账号记录：激活并关联用户ID
          await db.collection('enterprise_sub_accounts').doc(subAccount._id).update({
            data: { status: 'active', user_id: userId, updated_at: new Date() }
          })
          // 更新用户记录：关联企业ID和身份（子账号也是企业用户）
          await db.collection('users').doc(userId).update({
            data: { 
              enterprise_id: subAccount.enterprise_id,
              user_type: 'enterprise',
              role: 'subaccount'
            }
          })
          console.log('Subaccount activated successfully')
        } else {
          console.log('No pending subaccount found for this phone')
        }
      } catch (subErr) {
        console.error('subaccount activation error:', subErr)
      }
    }

    // 5. 获取完整用户信息
    const userInfoRes = await db.collection('users').doc(userId).get()
    const userInfo = userInfoRes.data

    // 6. 返回用户信息（不包含敏感字段）
    return {
      success: true,
      data: {
        userId: userId,
        isNewUser: isNewUser,
        userInfo: {
          _id: userInfo._id,
          nickname: userInfo.nickname,
          phone: userInfo.phone,
          user_type: userInfo.user_type,
          balance: userInfo.balance,
          enterprise_id: userInfo.enterprise_id || '',
          enterprise_name: userInfo.enterprise_name || ''
        }
      }
    }

  } catch (err) {
    console.error('loginWithPhone error:', err)
    return { success: false, error: err.message }
  }
}
