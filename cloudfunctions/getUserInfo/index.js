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
    
    // 方式1：通过 enterprise_id 查询
    if (userData.enterprise_id && userData.enterprise_id !== '') {
      try {
        const entRes = await db.collection('enterprises').doc(userData.enterprise_id).get()
        if (entRes.data) {
          enterpriseInfo = entRes.data
        }
      } catch (e) {}
    }
    
    // 方式2：通过 admin_user_id 查询（兼容未正确保存 enterprise_id 的情况）
    if (!enterpriseInfo) {
      try {
        const entRes = await db.collection('enterprises')
          .where({ admin_user_id: userId })
          .get()
        if (entRes.data && entRes.data.length > 0) {
          enterpriseInfo = entRes.data[0]
        }
      } catch (e) {}
    }
    
    // 如果找到企业信息，更新用户数据
    if (enterpriseInfo) {
      userData.user_type = 'enterprise'
      userData.company_name = enterpriseInfo.company_name
      userData.company_short_name = enterpriseInfo.company_short_name
      userData.industry = enterpriseInfo.industry
      userData.enterprise_id = enterpriseInfo._id
      userData.admin_user_id = enterpriseInfo.admin_user_id || ''  // 企业管理员ID
      
      // 直接检查 enterprise_sub_accounts 表来确定是否是子账户
      let isSubAccount = false
      try {
        const subRes = await db.collection('enterprise_sub_accounts')
          .where({ 
            enterprise_id: enterpriseInfo._id,
            user_id: userId,
            status: 'active'
          })
          .limit(1)
          .get()
        isSubAccount = subRes.data && subRes.data.length > 0
        
        if (isSubAccount) {
          // 子账户：使用分配给他的额度
          userData.enterprise_balance = subRes.data[0].balance || 0
          userData.role = 'subaccount'  // 确保 role 字段正确
        } else {
          // 管理员：使用企业总余额
          userData.enterprise_balance = enterpriseInfo.balance || 0
          userData.role = userData.admin_user_id === userId ? 'admin' : 'member'
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
