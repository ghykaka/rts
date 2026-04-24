// cloudfunctions/virtualPaymentNotify/index.js
// 虚拟支付 - 支付回调（发货推送）
const cloud = require('wx-server-sdk')
const crypto = require('crypto')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 消息推送配置（必须和微信后台填的 Token 一致）
const VIRTUAL_PAY_TOKEN = 'xpay2024'

// ============ 微信消息推送 Token 验证 ============

function sha1(str) {
  return crypto.createHash('sha1').update(str).digest('hex')
}

function verifyWechatPush(query) {
  const signature = query.signature || query.Signature || ''
  const timestamp = query.timestamp || query.Timestamp || ''
  const nonce = query.nonce || query.Nonce || ''
  const echostr = query.echostr || query.Echostr || ''
  
  if (!signature || !timestamp || !nonce) {
    console.log('参数不全')
    return false
  }
  
  // 将 token、timestamp、nonce 按字典序排序后拼接
  const arr = [VIRTUAL_PAY_TOKEN, timestamp, nonce]
  arr.sort()
  const str = arr.join('')
  
  const expectedSig = sha1(str)
  return expectedSig === signature
}

// ============ XML 解析 ============

function parseXML(xml) {
  const result = {}
  xml = xml.replace(/<\?xml[^>]*\?>/gi, '')
  
  const cdataRegex = /<(\w+)><!\[CDATA\[([^\]]*)\]\]><\/\1>/g
  let match
  while ((match = cdataRegex.exec(xml)) !== null) {
    result[match[1]] = match[2]
  }
  
  const tagRegex = /<(\w+)>([^<]*)<\/\1>/g
  while ((match = tagRegex.exec(xml)) !== null) {
    if (!result[match[1]]) {
      result[match[1]] = match[2]
    }
  }
  
  return result
}

// ============ 业务逻辑 ============

async function handleRechargeSuccess(params) {
  const { out_trade_no, total_fee } = params
  
  console.log('处理代币充值:', out_trade_no, '金额:', total_fee)

  try {
    // 先通过 out_trade_no 查询（虚拟支付生成的订单号格式是 VP 开头）
    let rechargeRes = await db.collection('recharges')
      .where({ 
        virtual_trade_no: out_trade_no
      })
      .get()

    // 如果没找到，尝试通过 _id 查询
    if (!rechargeRes.data || rechargeRes.data.length === 0) {
      rechargeRes = await db.collection('recharges')
        .where({ 
          _id: out_trade_no
        })
        .get()
    }

    if (!rechargeRes.data || rechargeRes.data.length === 0) {
      console.error('充值记录不存在:', out_trade_no)
      return { success: false, error: '充值记录不存在' }
    }

    const recharge = rechargeRes.data[0]

    if (recharge.status === 'success') {
      console.log('充值已处理过，跳过')
      return { success: true }
    }

    // 更新充值记录
    await db.collection('recharges').doc(recharge._id).update({
      data: {
        status: 'success',
        payment_status: 'paid',
        paid_at: db.serverDate(),
        update_at: db.serverDate()
      }
    })

    // 给用户加余额（1元 = 100积分，total_fee 是元，需要乘以100）
    const addScore = Math.round(parseFloat(total_fee) * 100)
    
    if (recharge.type === 'enterprise') {
      let enterpriseId = null
      const userRes = await db.collection('users').doc(recharge.user_id).get()
      if (userRes.data && userRes.data.enterprise_id) {
        enterpriseId = userRes.data.enterprise_id
      }
      if (!enterpriseId) {
        const entRes = await db.collection('enterprises')
          .where({ admin_user_id: recharge.user_id })
          .get()
        if (entRes.data && entRes.data.length > 0) {
          enterpriseId = entRes.data[0]._id
        }
      }
      
      if (enterpriseId) {
        const enterpriseRes = await db.collection('enterprises').doc(enterpriseId).get()
        if (enterpriseRes.data) {
          const currentBalance = enterpriseRes.data.balance || 0
          const newBalance = currentBalance + addScore
          await db.collection('enterprises').doc(enterpriseId).update({
            data: { balance: newBalance, update_time: db.serverDate() }
          })
          console.log('企业余额更新成功:', { oldBalance: currentBalance, add: addScore, newBalance })
        }
      }
    } else {
      const userRes = await db.collection('users').doc(recharge.user_id).get()
      if (userRes.data && userRes.data._id) {
        const currentBalance = userRes.data.balance || 0
        const newBalance = currentBalance + addScore
        await db.collection('users').doc(recharge.user_id).update({
          data: { balance: newBalance, update_time: db.serverDate() }
        })
        console.log('个人余额更新成功:', { oldBalance: currentBalance, add: addScore, newBalance })
      }
    }

    return { success: true }
  } catch (err) {
    console.error('处理充值失败:', err)
    return { success: false, error: err.message }
  }
}

// ============ 云函数入口 ============

exports.main = async (event, context) => {
  console.log('=== virtualPaymentNotify ===')
  console.log('event:', JSON.stringify(event).substring(0, 500))
  
  // 获取所有参数（兼容不同格式）
  const query = event.queryStringParameters || event.query || event || {}
  const body = event.body || ''
  
  console.log('query:', JSON.stringify(query))
  console.log('body:', typeof body, body.substring ? body.substring(0, 200) : body)

  // ========== Token 验证（GET 请求）==========
  if (query.signature && query.echostr) {
    console.log('收到微信 Token 验证请求')
    
    if (verifyWechatPush(query)) {
      console.log('Token 验证通过，返回 echostr')
      // 直接返回 echostr，不要 JSON 包装
      return query.echostr
    } else {
      console.error('Token 验证失败')
      return 'verify failed'
    }
  }

  // ========== 支付回调（POST 请求）==========
  
  // 解析 body
  let params = query
  if (body && typeof body === 'string' && body.includes('<xml>')) {
    try {
      const decoded = Buffer.from(body, 'base64').toString('utf8')
      params = decoded.includes('<xml>') ? parseXML(decoded) : params
    } catch {
      params = parseXML(body)
    }
  }

  const eventType = params.event_type || params.EventType || ''
  console.log('事件类型:', eventType)

  // 代币支付成功 / 道具发货推送
  if (eventType === 'xpay_coin_pay_notify' || eventType === 'goods_deliver_notify') {
    const outTradeNo = params.out_trade_no || params.OutTradeNo || ''
    const totalFee = params.total_fee || params.TotalFee || params.coin_count || 0
    
    console.log('支付成功:', { outTradeNo, totalFee })

    const result = await handleRechargeSuccess({
      out_trade_no: outTradeNo,
      total_fee: totalFee
    })

    return result.success 
      ? '<xml><ErrCode>0</ErrCode><ErrMsg><![CDATA[success]]></ErrMsg></xml>'
      : '<xml><ErrCode>-1</ErrCode><ErrMsg><![CDATA[' + result.error + ']]></ErrMsg></xml>'
  }

  // 其他事件
  console.log('未处理的事件:', eventType)
  return '<xml><ErrCode>0</ErrCode><ErrMsg><![CDATA[ok]]></ErrMsg></xml>'
}
