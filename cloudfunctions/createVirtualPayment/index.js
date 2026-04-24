// cloudfunctions/createVirtualPayment/index.js
// 虚拟支付 - 代币充值（short_series_coin）
const cloud = require('wx-server-sdk')
const crypto = require('crypto')
const https = require('https')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 虚拟支付配置
const OFFER_ID = process.env.VIRTUAL_OFFER_ID || '1450515481'
// env=0 现网，env=1 沙箱
const ENV = process.env.VIRTUAL_ENV || '0'
const SANDBOX_APPKEY = process.env.VIRTUAL_SANDBOX_APPKEY || 'ZLRh8krhgvEuncwoMl3o12zvY4n23qlb'
const PROD_APPKEY = process.env.VIRTUAL_PROD_APPKEY || 'JCUupBX0sX96FL46SGf6fevFKiT3R3I8'

// 获取 appId 和 appSecret
const APPID = process.env.APPID || 'wxe2093480cd4b51cb'
const APP_SECRET = process.env.APP_SECRET || 'b77955de35a3cf320b998d4b7e03ca25'

// 获取当前环境对应的 AppKey
function getAppKey() {
  return ENV === '1' ? SANDBOX_APPKEY : PROD_APPKEY
}

// 生成 HMAC-SHA256（十六进制输出）
function hmacSha256Hex(key, data) {
  return crypto.createHmac('sha256', key)
    .update(data, 'utf8')
    .digest('hex')
}

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

// 获取 sessionKey
async function getSessionKey(code) {
  if (!code) {
    console.warn('没有 loginCode，无法获取 sessionKey')
    return null
  }
  
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${APP_SECRET}&js_code=${code}&grant_type=authorization_code`
  console.log('获取 sessionKey, code:', code)
  
  try {
    const result = await httpsRequest(url)
    console.log('sessionKey 返回:', JSON.stringify(result))
    
    if (result.errcode) {
      console.error('获取 sessionKey 失败:', result.errmsg)
      return null
    }
    
    return result.session_key
  } catch (err) {
    console.error('获取 sessionKey 异常:', err)
    return null
  }
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { 
    userId, 
    rechargeId, 
    totalFee,  // 充值金额（元）
    loginCode  // 登录凭证，用于获取 sessionKey
  } = event

  console.log('=== createVirtualPayment (代币充值 short_series_coin) ===')
  console.log('userId:', userId)
  console.log('rechargeId:', rechargeId)
  console.log('totalFee:', totalFee, '元')
  console.log('ENV:', ENV, '(1=沙箱, 0=现网)')

  if (!userId) {
    return { success: false, error: 'userId is required' }
  }

  try {
    const openId = wxContext.OPENID
    const appKey = getAppKey()

    console.log('openId:', openId)
    console.log('appKey:', appKey.substring(0, 10) + '***')

    // 获取 sessionKey（用于生成 signature）
    let sessionKey = null
    console.log('loginCode 接收情况:', loginCode ? `收到 (${loginCode.substring(0, 10)}...)` : '未收到')
    
    if (loginCode) {
      sessionKey = await getSessionKey(loginCode)
      console.log('sessionKey:', sessionKey ? sessionKey.substring(0, 10) + '***' : 'null')
    }

    // 虚拟支付参数：商户平台汇率 1元=1000000代币
    // 实际支付 = buyQuantity * coinAmount / 1000000
    const buyQuantity = Math.round(totalFee * 100)
    const coinAmount = 100
    
    // 生成商户订单号
    const tradeNo = rechargeId || `VP${Date.now()}${Math.random().toString(36).substr(2, 9)}`

    // signData 使用 JSON 格式，字段按字母序排列
    // 重要：字段必须按字母序排列！
    const signDataObj = {
      attach: JSON.stringify({ userId: userId, type: 'coin' }),
      buyQuantity: buyQuantity,
      coinAmount: coinAmount,
      currencyType: 'CNY',
      env: parseInt(ENV),
      mode: 'short_series_coin',
      offerId: OFFER_ID,
      openId: openId,
      outTradeNo: tradeNo
    }
    
    // JSON.stringify 确保格式正确（不添加额外空格）
    const signData = JSON.stringify(signDataObj)
    
    console.log('signData:', signData)

    // 生成 paySig：HMAC-SHA256(appKey, uri + "&" + signData)
    const uri = 'requestVirtualPayment'
    const paySigData = `${uri}&${signData}`
    const paySig = hmacSha256Hex(appKey, paySigData)

    // 生成 signature：HMAC-SHA256(sessionKey, signData)
    let signature = ''
    if (sessionKey) {
      signature = hmacSha256Hex(sessionKey, signData)
    } else {
      console.warn('没有 sessionKey，无法生成 signature')
    }
    console.log('sessionKey:', sessionKey ? sessionKey.substring(0, 10) + '***' : 'null')

    // 更新充值记录
    if (rechargeId) {
      // 用 out_trade_no 查询充值记录获取正确的 _id
      const rechargeRes = await db.collection('recharges')
        .where({ out_trade_no: rechargeId })
        .get()
      
      if (rechargeRes.data && rechargeRes.data.length > 0) {
        await db.collection('recharges').doc(rechargeRes.data[0]._id).update({
          data: {
            payment_type: 'virtual',
            payment_status: 'pending',
            virtual_trade_no: tradeNo,
            env: ENV,
            update_at: db.serverDate()
          }
        })
      } else {
        console.error('未找到充值记录, out_trade_no:', rechargeId)
      }
    }

    // 返回给前端
    return {
      success: true,
      data: {
        mode: 'short_series_coin',
        env: parseInt(ENV),
        offerId: OFFER_ID,
        buyQuantity: buyQuantity,
        coinAmount: coinAmount,
        currencyType: 'CNY',
        outTradeNo: tradeNo,
        attach: rechargeId || '',
        signData: signData,
        paySig: paySig,
        signature: signature  // 使用 sessionKey 生成
      }
    }

  } catch (err) {
    console.error('createVirtualPayment error:', err)
    return {
      success: false,
      error: err.message || '创建虚拟支付订单失败'
    }
  }
}
