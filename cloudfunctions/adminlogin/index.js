const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const crypto = require('crypto')

// 简单加密密码
function encryptPassword(password) {
  return crypto.createHash('md5').update(password + 'salt').digest('hex')
}

// 验证密码
function verifyPassword(password, encrypted) {
  return password === encrypted
}

// CORS 头
function addCorsHeaders(response) {
  response.headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  }
  return response
}

exports.main = async (event, context) => {
  const { username, password } = event
  
  let res = {
    success: false,
    error: ''
  }
  
  addCorsHeaders(res)
  
  console.log('=== 管理员登录 ===')
  console.log('username:', username)

  if (!username || !password) {
    return {
      ...res,
      success: false,
      error: '请输入账号和密码'
    }
  }

  try {
    // 查询管理员
    const adminRes = await db.collection('admin_users')
      .where({ username })
      .get()

    if (!adminRes.data || adminRes.data.length === 0) {
      console.error('管理员不存在:', username)
      return {
        ...res,
        success: false,
        error: '账号或密码错误'
      }
    }

    const admin = adminRes.data[0]

    // 验证密码
    if (!verifyPassword(password, admin.password)) {
      console.error('密码错误')
      return {
        ...res,
        success: false,
        error: '账号或密码错误'
      }
    }

    // 生成简单 token
    const token = crypto.randomBytes(16).toString('hex')
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7天

    // 更新登录状态
    await db.collection('admin_users').doc(admin._id).update({
      data: {
        token,
        expires_at: expiresAt,
        last_login: db.serverDate()
      }
    })

    console.log('登录成功:', admin._id)

    return {
      success: true,
      token,
      user: {
        id: admin._id,
        username: admin.username,
        role: admin.role || 'admin'
      }
    }

  } catch (err) {
    console.error('登录错误:', err)
    return {
      ...res,
      success: false,
      error: '登录失败'
    }
  }
}
