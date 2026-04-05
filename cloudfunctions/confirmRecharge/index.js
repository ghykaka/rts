const cloud = require('wx-server-sdk')
const crypto = require('crypto')
const axios = require('axios')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 商户配置
const MCH_ID = '1711788352'           // 商户号
const API_KEY = 'h21kUY34j4Liht68oPqweRY109BdmT4u'  // API 密钥

// 生成签名
function generateSign(params, key) {
  const sortedKeys = Object.keys(params).sort()
  const signStr = sortedKeys.map(k => `${k}=${params[k]}`).join('&') + `&key=${key}`
  return crypto.createHash('md5').update(signStr, 'utf8').digest('hex').toUpperCase()
}

// 查询微信支付订单状态
async function queryWechatOrder(outTradeNo) {
  const nonceStr = crypto.randomBytes(16).toString('hex')
  const params = {
    appid: 'wxe2093480cd4b51cb',
    mch_id: MCH_ID,
    out_trade_no: outTradeNo,
    nonce_str: nonceStr
  }
  params.sign = generateSign(params, API_KEY)

  const xml = `<xml>${Object.entries(params).map(([k, v]) => `<${k}>${v}</${k}>`).join('')}</xml>`
  
  try {
    const res = await axios.post('https://api.mch.weixin.qq.com/pay/orderquery', xml, {
      headers: { 'Content-Type': 'text/xml' }
    })
    
    console.log('微信原始响应:', res.data)
    const result = await parseXml(res.data)
    console.log('微信查询结果:', JSON.stringify(result, null, 2))
    
    // 检查返回状态
    if (result.return_code !== 'SUCCESS') {
      console.error('微信返回失败:', result.return_msg)
    }
    
    return result
  } catch (err) {
    console.error('查询微信订单失败:', err)
    return null
  }
}

// 解析 XML
function parseXml(xmlStr) {
  return new Promise((resolve) => {
    const result = {}
    const regex = /<(\w+)>([^<]+)<\/\1>/g
    let match
    while ((match = regex.exec(xmlStr)) !== null) {
      result[match[1]] = match[2]
    }
    resolve(result)
  })
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { outTradeNo } = event

  console.log('=== 确认充值 ===')
  console.log('outTradeNo:', outTradeNo)

  if (!outTradeNo) {
    return {
      success: false,
      error: '缺少订单号'
    }
  }

  try {
    // 1. 先查询充值记录
    const rechargeRes = await db.collection('recharges')
      .where({ out_trade_no: outTradeNo })
      .get()

    if (!rechargeRes.data || rechargeRes.data.length === 0) {
      console.error('未找到充值记录:', outTradeNo)
      return {
        success: false,
        error: '未找到充值记录'
      }
    }

    const recharge = rechargeRes.data[0]

    // 2. 检查是否已处理过（幂等性保护）
    if (recharge.status === 'success') {
      console.log('该订单已处理过:', outTradeNo)
      return {
        success: true,
        message: '订单已确认'
      }
    }

    // 3. 主动查询微信支付状态（关键安全步骤）
    const wechatResult = await queryWechatOrder(outTradeNo)
    
    if (!wechatResult) {
      console.error('无法查询微信订单状态')
      return {
        success: false,
        error: '无法验证支付状态，请稍后重试'
      }
    }

    // 4. 验证支付状态
    const tradeState = wechatResult.trade_state
    if (tradeState !== 'SUCCESS') {
      console.error('支付未成功:', tradeState, wechatResult.trade_state_desc)
      return {
        success: false,
        error: `支付未完成: ${wechatResult.trade_state_desc || tradeState}`
      }
    }

    // 5. 验证金额（防止篡改）
    const wechatTotalFee = parseInt(wechatResult.total_fee)
    if (wechatTotalFee !== recharge.amount_cent) {
      console.error('金额不匹配:', { wechat: wechatTotalFee, local: recharge.amount_cent })
      return {
        success: false,
        error: '金额校验失败'
      }
    }

    // 6. 更新充值记录状态为成功
    await db.collection('recharges').doc(recharge._id).update({
      data: {
        status: 'success',
        confirmed_at: db.serverDate(),
        update_at: db.serverDate(),
        wechat_transaction_id: wechatResult.transaction_id
      }
    })

    // 7. 给用户加余额
    const userRes = await db.collection('users').doc(recharge.user_id).get()
    // doc().get() 返回的是对象，不是数组
    if (userRes.data && userRes.data._id) {
      const user = userRes.data
      const currentBalance = user.balance || 0
      const addAmount = recharge.amount_cent
      const newBalance = currentBalance + addAmount

      await db.collection('users').doc(recharge.user_id).update({
        data: {
          balance: newBalance,
          update_time: db.serverDate()
        }
      })

      console.log('余额更新成功:', {
        userId: recharge.user_id,
        oldBalance: currentBalance,
        addAmount: addAmount,
        newBalance: newBalance
      })
    } else {
      console.error('未找到用户:', recharge.user_id)
    }

    return {
      success: true,
      message: '充值确认成功'
    }

  } catch (err) {
    console.error('confirmRecharge error:', err)
    return {
      success: false,
      error: err.message || '处理失败'
    }
  }
}
