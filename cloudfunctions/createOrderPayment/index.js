const cloud = require('wx-server-sdk')
const crypto = require('crypto')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// 普通商户配置 - 从环境变量读取
const MCH_ID = process.env.MCH_ID || '1711788352'
const APPID = process.env.APPID || 'wxe2093480cd4b51cb'
const API_KEY = process.env.WEIXIN_API_KEY || ''

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
  const { userId, orderId } = event

  console.log('createOrderPayment params:', { userId, orderId })
  console.log('OPENID:', wxContext.OPENID)

  if (!API_KEY) {
    return {
      success: false,
      error: '未配置 API_KEY'
    }
  }

  try {
    // 1. 查询订单信息
    const orderRes = await db.collection('orders').doc(orderId).get()
    if (!orderRes.data) {
      return { success: false, error: '订单不存在' }
    }
    
    const order = orderRes.data
    
    // 验证订单用户
    if (order.user_id !== userId) {
      return { success: false, error: '无权支付该订单' }
    }
    
    // 检查订单状态
    if (order.status !== 'pending' && order.status !== 'processing') {
      return { success: false, error: '订单状态不允许支付' }
    }
    
    // 检查是否余额支付
    if (order.cost_type === 'balance') {
      return { success: false, error: '该订单已使用余额支付' }
    }

    // 2. 获取用户的 openid
    const openId = wxContext.OPENID

    // 3. 生成订单号（微信支付订单号以420开头）
    const outTradeNo = `420${Date.now()}${Math.floor(Math.random() * 1000)}`

    // 4. 金额转换：元转分
    const totalFee = Math.round(order.cost_amount)

    // 5. 更新订单的微信支付单号
    await db.collection('orders').doc(orderId).update({
      data: {
        wx_out_trade_no: outTradeNo,
        payment_status: 'pending'
      }
    })

    // 6. 构建统一下单参数（普通商户模式）
    const nonceStr = generateNonceStr()
    const timeStamp = Math.floor(Date.now() / 1000).toString()
    
    const orderParams = {
      appid: APPID,            // 小程序 AppID
      mch_id: MCH_ID,          // 商户号
      nonce_str: nonceStr,
      body: `让她生-${order.function_name || '作品生成'}`,
      out_trade_no: outTradeNo,
      total_fee: totalFee,
      spbill_create_ip: wxContext.CLIENTIP || '127.0.0.1',
      notify_url: 'https://liandaofutou-2gdayw0068d938b3-1417102114.ap-shanghai.app.tcloudbase.com/paymentNotify',
      trade_type: 'JSAPI',
      openid: openId           // 用户 openid
    }

    // 生成签名
    orderParams.sign = generateSign(orderParams, API_KEY)

    console.log('统一下单参数:', JSON.stringify(orderParams, null, 2))

    // 7. 调用微信支付统一下单 API
    const axios = require('axios')
    const { parseString } = require('xml2js')
    
    const xmlParams = Object.entries(orderParams).map(([k, v]) => `<${k}>${v}</${k}>`).join('')
    const xmlBody = `<xml>${xmlParams}</xml>`
    
    console.log('请求XML:', xmlBody)

    const response = await axios.post('https://api.mch.weixin.qq.com/pay/unifiedorder', xmlBody, {
      headers: { 'Content-Type': 'text/xml' }
    })

    console.log('微信返回:', response.data)

    // 8. 解析 XML 响应
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
    console.error('createOrderPayment error:', err)
    return {
      success: false,
      error: err.message || '支付创建失败'
    }
  }
}
