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
    
    // 尝试多种方式获取企业信息
    let enterpriseInfo = null
    
    console.log('userData.enterprise_id=', userData.enterprise_id)
    
    // 方式1：通过 enterprise_id 查询
    if (userData.enterprise_id && userData.enterprise_id !== '') {
      try {
        const entRes = await db.collection('enterprises').doc(userData.enterprise_id).get()
        console.log('方式1查询结果:', JSON.stringify(entRes))
        if (entRes.data) {
          enterpriseInfo = entRes.data
        }
      } catch (e) {
        console.log('方式1查询失败:', e.message)
      }
    }
    
    // 方式2：通过 admin_user_id 查询（兼容未正确保存 enterprise_id 的情况）
    if (!enterpriseInfo) {
      try {
        const entRes = await db.collection('enterprises')
          .where({ admin_user_id: userId })
          .get()
        console.log('方式2查询结果:', JSON.stringify(entRes))
        if (entRes.data && entRes.data.length > 0) {
          enterpriseInfo = entRes.data[0]
        }
      } catch (e) {
        console.log('方式2查询失败:', e.message)
      }
    }
    
    console.log('enterpriseInfo=', enterpriseInfo ? '找到' : '未找到')
    
    // 如果找到企业信息，更新用户数据
    if (enterpriseInfo) {
      userData.user_type = 'enterprise'
      userData.company_name = enterpriseInfo.company_name
      userData.company_short_name = enterpriseInfo.company_short_name
      userData.industry = enterpriseInfo.industry
      userData.enterprise_id = enterpriseInfo._id
      userData.admin_user_id = enterpriseInfo.admin_user_id || ''
      
      console.log('开始检查子账户, enterprise_id=', enterpriseInfo._id, 'userId=', userId, 'phone=', userData.phone)
      
      // 直接用 phone 查询子账户（和 loginWithPhone 一样的方式）
      try {
        const phone = userData.phone
        if (phone) {
          const subRes = await db.collection('enterprise_sub_accounts')
            .where({ phone: phone })
            .limit(1)
            .get()
          
          console.log('子账户查询结果:', JSON.stringify(subRes))
          
          if (subRes.data && subRes.data.length > 0) {
            const subAccount = subRes.data[0]
            // 子账户：使用分配给他的额度
            userData.enterprise_balance = subAccount.balance || 0
            userData.role = 'subaccount'
            console.log('子账户余额:', userData.enterprise_balance)
          } else {
            // 管理员：使用企业总余额
            userData.enterprise_balance = enterpriseInfo.balance || 0
            userData.role = userData.admin_user_id === userId ? 'admin' : 'member'
            console.log('管理员余额:', userData.enterprise_balance)
          }
        } else {
          userData.enterprise_balance = enterpriseInfo.balance || 0
        }
      } catch (e) {
        console.error('检查子账户失败:', e)
        userData.enterprise_balance = enterpriseInfo.balance || 0
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
