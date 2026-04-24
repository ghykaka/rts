// cloudfunctions/getUserIndustries/index.js
// 获取用户所属企业的行业属性
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  // 支持前端传入 userId 或 phone
  const { userId, phone } = event

  try {
    console.log('getUserIndustries openid:', openid, 'userId:', userId, 'phone:', phone)
    
    let user = null
    
    // 优先通过 userId 查询
    if (userId) {
      console.log('getUserIndustries trying userId:', userId)
      const userRes = await db.collection('users').doc(userId).get()
      console.log('getUserIndustries userRes by userId:', userRes.data ? 'found' : 'not found')
      if (userRes.data) {
        user = userRes.data
        console.log('getUserIndustries found by userId')
      }
    }
    
    // 其次通过 phone 查询
    if (!user && phone) {
      console.log('getUserIndustries trying phone:', phone)
      const userRes = await db.collection('users')
        .where({ phone })
        .get()
      console.log('getUserIndustries userRes by phone:', userRes.data?.length || 0, 'records')
      if (userRes.data && userRes.data.length > 0) {
        user = userRes.data[0]
        console.log('getUserIndustries found by phone')
      }
    }
    
    // 最后通过 openid 查询
    if (!user && openid) {
      console.log('getUserIndustries trying openid:', openid)
      const userRes = await db.collection('users')
        .where({ _openid: openid })
        .get()
      console.log('getUserIndustries userRes by openid:', userRes.data?.length || 0, 'records')
      if (userRes.data && userRes.data.length > 0) {
        user = userRes.data[0]
        console.log('getUserIndustries found by openid')
      }
    }

    if (!user) {
      console.log('getUserIndustries: user not found by userId/phone/openid')
      return { success: true, data: { isLogin: false, industries: [] } }
    }

    console.log('getUserIndustries user:', JSON.stringify(user))
    
    let industries = []
    let isEnterprise = false
    
    // 获取企业的行业信息（无论主账号还是子账号）
    const getEnterpriseIndustries = async (enterpriseId) => {
      if (!enterpriseId) return []
      
      const entRes = await db.collection('enterprises').doc(enterpriseId).get()
      console.log('getUserIndustries enterprise:', entRes.data ? 'found' : 'not found')
      
      if (entRes.data) {
        // 优先使用 industries 字段（新字段），兼容 industry 字段（旧字段）
        const industriesField = entRes.data.industries || entRes.data.industry
        console.log('getUserIndustries enterprise.industries:', industriesField)
        return parseIndustryField(industriesField)
      }
      return []
    }
    
    // 判断用户类型和获取企业行业
    const userType = user.user_type || ''
    
    // 情况1：用户本身就是企业管理员 (user_type === 'enterprise')
    if (userType === 'enterprise') {
      isEnterprise = true
      industries = await getEnterpriseIndustries(user.enterprise_id)
    }
    // 情况2：用户有 enterprise_id（可能是子账号）
    else if (user.enterprise_id) {
      isEnterprise = true
      industries = await getEnterpriseIndustries(user.enterprise_id)
    }
    // 情况3：通过 admin_user_id 查找（用户可能是企业主账号）
    else {
      const entRes = await db.collection('enterprises')
        .where({ admin_user_id: user._id })
        .get()
      
      if (entRes.data && entRes.data.length > 0) {
        isEnterprise = true
        const enterprise = entRes.data[0]
        console.log('getUserIndustries found enterprise by admin_user_id:', enterprise.name)
        // 优先使用 industries 字段（新字段），兼容 industry 字段（旧字段）
        const industriesField = enterprise.industries || enterprise.industry
        industries = parseIndustryField(industriesField)
      }
    }

    console.log('getUserIndustries final isEnterprise:', isEnterprise, 'industries:', industries)
    
    return {
      success: true,
      data: {
        isLogin: true,
        isEnterprise,
        userId: user._id,
        industries
      }
    }

  } catch (err) {
    console.error('getUserIndustries error:', err)
    return { success: false, error: err.message }
  }
}

// 解析行业字段，支持多种格式
function parseIndustryField(industryField) {
  if (!industryField) return []
  
  console.log('parseIndustryField input type:', typeof industryField, 'value:', JSON.stringify(industryField))
  
  // 如果是对象数组（如 [{name: '餐饮'}, {name: '互联网'}]）
  if (Array.isArray(industryField) && industryField.length > 0) {
    const firstItem = industryField[0]
    if (typeof firstItem === 'object' && firstItem.name) {
      // 对象数组格式：提取 name 字段
      return industryField.map(i => i.name).filter(n => n)
    }
    // 字符串数组格式
    return industryField.filter(i => i && typeof i === 'string')
  }
  
  // 如果是字符串，可能是逗号分隔的
  if (typeof industryField === 'string' && industryField) {
    return industryField.split(',').map(i => i.trim()).filter(i => i)
  }
  
  return []
}
