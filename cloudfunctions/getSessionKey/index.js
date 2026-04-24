// cloudfunctions/getSessionKey/index.js
// 获取 sessionKey（用于虚拟支付签名）
const cloud = require('wx-server-sdk')
const https = require('https')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 获取 appId 和 appSecret
const APPID = process.env.APPID || 'wxe2093480cd4b51cb'
const APP_SECRET = process.env.APP_SECRET || 'b77955de35a3cf320b998d4b7e03ca25'

// Promise 封装 HTTP 请求
function httpsRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch (e) {
          reject(e)
        }
      })
    }).on('error', reject)
  })
}

exports.main = async (event, context) => {
  const { code } = event

  console.log('=== getSessionKey ===')
  console.log('code:', code)
  console.log('APPID:', APPID)

  if (!code) {
    return { success: false, error: 'code is required' }
  }

  if (!APP_SECRET) {
    return { success: false, error: 'APP_SECRET not configured' }
  }

  try {
    // 调用微信 code2Session 接口
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${APP_SECRET}&js_code=${code}&grant_type=authorization_code`
    console.log('请求 URL:', url.replace(APP_SECRET, '***')) // 隐藏 secret

    const result = await httpsRequest(url)
    console.log('微信返回:', JSON.stringify(result))

    if (result.errcode) {
      console.error('微信接口错误:', result.errmsg)
      return { success: false, error: result.errmsg || '获取 sessionKey 失败' }
    }

    return {
      success: true,
      data: {
        openid: result.openid,
        sessionKey: result.session_key,
        unionid: result.unionid || ''
      }
    }

  } catch (err) {
    console.error('getSessionKey error:', err)
    return { success: false, error: err.message }
  }
}
