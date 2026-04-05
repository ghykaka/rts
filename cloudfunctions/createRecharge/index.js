const cloud = require('wx-server-sdk')
const crypto = require('crypto')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 普通商户配置 - 使用子商户号
const MCH_ID = '1711788352'           // 商户号（子商户）
const APPID = 'wxe2093480cd4b51cb'    // 小程序 AppID
const API_KEY = 'h21kUY34j4Liht68oPqweRY109BdmT4u'  // 子商户 API 密钥

// 生成随机字符串
function generateNonceStr() {
  return Math.random().toString(36).substr(2, 15)
}

// 生成签名
function generateSign(params, key) {
  const sorted = Object.keys(params).sort().reduce((acc, k) => {
    if (params[k] !== '' && params[k] !== undefined && params[k] !== null) {
      acc[k] = params[k]
    }
    return acc
  }, {})
  
  const stringA = Object.entries(sorted).map(([k, v]) => `${k}=${v}`).join('&')
  const stringSignTemp = stringA + '&key=' + key
  return crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase()
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { userId, amount, type } = event

  console.log('createRecharge params:', { userId, amount, type })
  console.log('OPENID:', wxContext.OPENID)

  if (!API_KEY) {
    return {
      success: false,
      error: '未配置 API_KEY'
    }
  }

  try {
    // 获取用户的 openid
    const openId = wxContext.OPENID

    // 生成订单号
    const outTradeNo = `${Date.now()}${Math.floor(Math.random() * 10000)}`

    // 金额转换：元转分
    const totalFee = Math.round(amount * 100)

    // 创建充值记录
    const rechargeData = {
      user_id: userId,
      openid: openId,
      amount: amount,
      amount_cent: totalFee,
      type: type,
      payment_method: 'wechat_pay',
      status: 'pending',
      out_trade_no: outTradeNo,
      mch_id: MCH_ID,
      created_at: db.serverDate()
    }

    const rechargeRes = await db.collection('recharges').add({
      data: rechargeData
    })

    console.log('充值记录创建成功:', rechargeRes._id)

    // 构建统一下单参数（普通商户模式）
    const nonceStr = generateNonceStr()
    const timeStamp = Math.floor(Date.now() / 1000).toString()
    
    const orderParams = {
      appid: APPID,            // 小程序 AppID
      mch_id: MCH_ID,          // 商户号
      nonce_str: nonceStr,
      body: '让她生-余额充值',
      out_trade_no: outTradeNo,
      total_fee: totalFee,
      spbill_create_ip: wxContext.CLIENTIP || '127.0.0.1',
      notify_url: 'https://liandaofutou-2gdayw0068d938b3-1417102114.ap-shanghai.app.tcloudbase.com/rechargeNotify/',
      trade_type: 'JSAPI',
      openid: openId           // 用户 openid
    }

    // 生成签名
    orderParams.sign = generateSign(orderParams, API_KEY)

    console.log('统一下单参数:', JSON.stringify(orderParams, null, 2))

    // 调用微信支付统一下单 API
    const axios = require('axios')
    const { parseString } = require('xml2js')
    
    const xmlParams = Object.entries(orderParams).map(([k, v]) => `<${k}>${v}</${k}>`).join('')
    const xmlBody = `<xml>${xmlParams}</xml>`
    
    console.log('请求XML:', xmlBody)

    const response = await axios.post('https://api.mch.weixin.qq.com/pay/unifiedorder', xmlBody, {
      headers: { 'Content-Type': 'text/xml' }
    })

    console.log('微信返回:', response.data)

    // 解析 XML 响应
    const result = await new Promise((resolve, reject) => {
      parseString(response.data, { explicitArray: false }, (err, result) => {
        if (err) reject(err)
        else resolve(result.xml)
      })
    })

    console.log('解析结果:', JSON.stringify(result, null, 2))

    // 打印详细错误信息
    if (result.return_code !== 'SUCCESS') {
      console.error('微信返回失败: return_code=' + result.return_code + ', return_msg=' + result.return_msg)
    }
    if (result.result_code !== 'SUCCESS') {
      console.error('业务返回失败: err_code=' + result.err_code + ', err_code_des=' + result.err_code_des)
    }

    if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
      // 生成前端调起支付所需的参数
      const prepayId = result.prepay_id
      const payParams = {
        appId: APPID,          // 小程序 AppID
        timeStamp: timeStamp,
        nonceStr: nonceStr,
        package: `prepay_id=${prepayId}`,
        signType: 'MD5'
      }
      payParams.paySign = generateSign(payParams, API_KEY)

      return {
        success: true,
        outTradeNo: outTradeNo,
        data: {
          timeStamp: payParams.timeStamp,
          nonceStr: payParams.nonceStr,
          package: payParams.package,
          signType: payParams.signType,
          paySign: payParams.paySign
        }
      }
    } else {
      let errorMsg = ''
      if (result.return_code !== 'SUCCESS') {
        errorMsg += `return_msg: ${result.return_msg}; `
      }
      if (result.result_code !== 'SUCCESS') {
        errorMsg += `err_code: ${result.err_code}, err_code_des: ${result.err_code_des}`
      }
      console.error('微信支付错误:', errorMsg)
      return {
        success: false,
        error: errorMsg || '统一下单失败'
      }
    }

  } catch (err) {
    console.error('createRecharge error:', err)
    return {
      success: false,
      error: err.message || '充值失败'
    }
  }
}
