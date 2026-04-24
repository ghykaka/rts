const cloud = require('wx-server-sdk')
const crypto = require('crypto')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 商户配置
const MCH_ID = process.env.MCH_ID || '1711788352'
const API_KEY = process.env.WEIXIN_API_KEY || ''

// ============ Token 验证（虚拟支付消息推送）===========
const VIRTUAL_PAY_TOKEN = 'xpay2024'

function sha1(str) {
  return crypto.createHash('sha1').update(str).digest('hex')
}

function verifyVirtualPayToken(query) {
  const signature = query.signature || ''
  const timestamp = query.timestamp || ''
  const nonce = query.nonce || ''
  const echostr = query.echostr || ''
  
  if (!signature || !timestamp || !nonce) {
    console.log('Token验证参数不全')
    return { valid: false, echostr: null }
  }
  
  const arr = [VIRTUAL_PAY_TOKEN, timestamp, nonce].sort()
  const str = arr.join('')
  const expectedSig = sha1(str)
  
  console.log('Token验证:', { expected: expectedSig, received: signature })
  
  return {
    valid: expectedSig === signature,
    echostr: echostr
  }
}

// ============ XML 解析 ============
function parseXML(xml) {
  const result = {}
  xml = xml.replace(/<\?xml[^>]*\?>/gi, '')
  
  const regex = /<(\w+)><!\[CDATA\[([^\]]*)\]\]><\/\1>|<(\w+)>([^<]*)<\/\3>/g
  let match
  while ((match = regex.exec(xml)) !== null) {
    if (match[1] && match[2]) {
      result[match[1]] = match[2]
    } else if (match[3] && match[4]) {
      result[match[3]] = match[4]
    }
  }
  return result
}

function generateXML(data) {
  let xml = '<xml>'
  for (const key in data) {
    xml += `<${key}><![CDATA[${data[key]}]]></${key}>`
  }
  xml += '</xml>'
  return xml
}

// ============ 虚拟支付回调处理 ============
async function handleVirtualPay(params) {
  const { out_trade_no, total_fee, event_type } = params
  
  console.log('处理虚拟支付回调:', { out_trade_no, total_fee, event_type })

  try {
    // 查询充值记录
    const rechargeRes = await db.collection('recharges')
      .where({ 
        _id: out_trade_no,
        payment_type: 'virtual'
      })
      .get()

    if (!rechargeRes.data || rechargeRes.data.length === 0) {
      console.error('虚拟充值记录不存在:', out_trade_no)
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

    // 给用户加余额
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
          const newBalance = currentBalance + parseInt(total_fee)
          await db.collection('enterprises').doc(enterpriseId).update({
            data: { balance: newBalance, update_time: db.serverDate() }
          })
          console.log('企业余额更新成功:', { newBalance })
        }
      }
    } else {
      const userRes = await db.collection('users').doc(recharge.user_id).get()
      if (userRes.data && userRes.data._id) {
        const currentBalance = userRes.data.balance || 0
        const newBalance = currentBalance + parseInt(total_fee)
        await db.collection('users').doc(recharge.user_id).update({
          data: { balance: newBalance, update_time: db.serverDate() }
        })
        console.log('个人余额更新成功:', { newBalance })
      }
    }

    return { success: true }
  } catch (err) {
    console.error('处理虚拟支付失败:', err)
    return { success: false, error: err.message }
  }
}

// ============ 普通微信支付处理 ============
function verifySign(params, key) {
  const { sign, ...paramsWithoutSign } = params
  const sortedKeys = Object.keys(paramsWithoutSign).sort()
  const signStr = sortedKeys.map(k => `${k}=${paramsWithoutSign[k]}`).join('&')
  const stringSignTemp = signStr + '&key=' + key
  return crypto.createHash('md5').update(stringSignTemp, 'utf8').digest('hex').toUpperCase() === sign
}

async function handleRecharge(params) {
  const { out_trade_no, transaction_id, total_fee } = params

  console.log('处理充值订单:', out_trade_no)

  const rechargeRes = await db.collection('recharges')
    .where({ out_trade_no: out_trade_no })
    .get()

  if (!rechargeRes.data || rechargeRes.data.length === 0) {
    return { success: false, error: '充值记录不存在' }
  }

  const recharge = rechargeRes.data[0]

  if (recharge.status === 'success') {
    return { success: true }
  }

  await db.collection('recharges').doc(recharge._id).update({
    data: {
      status: 'success',
      wechat_transaction_id: transaction_id,
      paid_at: db.serverDate(),
      update_at: db.serverDate()
    }
  })

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
        const newBalance = currentBalance + parseInt(total_fee)
        await db.collection('enterprises').doc(enterpriseId).update({
          data: { balance: newBalance, update_time: db.serverDate() }
        })
      }
    }
  } else {
    const userRes = await db.collection('users').doc(recharge.user_id).get()
    if (userRes.data && userRes.data._id) {
      const currentBalance = userRes.data.balance || 0
      const newBalance = currentBalance + parseInt(total_fee)
      await db.collection('users').doc(recharge.user_id).update({
        data: { balance: newBalance, update_time: db.serverDate() }
      })
    }
  }

  return { success: true }
}

async function handleOrder(params) {
  const { out_trade_no, transaction_id } = params

  console.log('处理生成订单:', out_trade_no)

  const orderRes = await db.collection('orders')
    .where({ wx_out_trade_no: out_trade_no })
    .get()

  if (!orderRes.data || orderRes.data.length === 0) {
    return { success: false, error: '订单不存在' }
  }

  const order = orderRes.data[0]

  if (order.payment_status === 'paid') {
    return { success: true }
  }

  await db.collection('orders').doc(order._id).update({
    data: {
      status: 'processing',
      started_at: new Date(),
      payment_status: 'paid',
      wx_transaction_id: transaction_id,
      paid_at: new Date()
    }
  })

  cloud.callFunction({
    name: 'executeWorkflow',
    data: {
      orderId: order._id,
      cozeWorkflowId: order.coze_workflow_id,
      templateId: order.template_id,
      inputParams: order.input_params
    }
  }).catch(err => {
    console.error('工作流触发失败:', err)
  })

  return { success: true }
}

// ============ 云函数入口 ============
exports.main = async (event, context) => {
  console.log('=== paymentNotify 回调 ===')
  
  // 获取 query 参数
  const query = event.queryStringParameters || event.query || {}
  
  // ========== Token 验证请求（GET）==========
  if (query.signature && query.echostr) {
    console.log('收到Token验证请求')
    const result = verifyVirtualPayToken(query)
    if (result.valid) {
      console.log('Token验证通过')
      return result.echostr
    } else {
      console.error('Token验证失败')
      return 'verify failed'
    }
  }

  // 获取原始 body
  let rawBody = ''
  if (event.body) {
    rawBody = typeof event.body === 'string' ? event.body : JSON.stringify(event.body)
  } else if (event.rawBody) {
    rawBody = event.rawBody
  } else {
    rawBody = JSON.stringify(event)
  }

  // Base64 解码
  try {
    const decoded = Buffer.from(rawBody, 'base64').toString('utf8')
    if (decoded.includes('<xml>')) {
      rawBody = decoded
    }
  } catch (e) {}

  try {
    const params = parseXML(rawBody)
    console.log('解析后参数:', JSON.stringify(params))

    // ========== 虚拟支付回调 ==========
    const eventType = params.event_type || ''
    if (eventType) {
      console.log('虚拟支付回调, event_type:', eventType)
      
      // 代币支付成功 / 道具发货
      if (eventType === 'xpay_coin_pay_notify' || eventType === 'goods_deliver_notify') {
        const result = await handleVirtualPay(params)
        if (result.success) {
          return '<xml><ErrCode>0</ErrCode><ErrMsg><![CDATA[success]]></ErrMsg></xml>'
        } else {
          return '<xml><ErrCode>-1</ErrCode><ErrMsg><![CDATA[' + result.error + ']]></ErrMsg></xml>'
        }
      }
      
      return '<xml><ErrCode>0</ErrCode><ErrMsg><![CDATA[ok]]></ErrMsg></xml>'
    }

    // ========== 普通微信支付回调 ==========
    const { return_code, out_trade_no, transaction_id, total_fee } = params

    if (!return_code || !out_trade_no) {
      return generateXML({ return_code: 'FAIL', return_msg: '参数不完整' })
    }

    if (return_code !== 'SUCCESS') {
      return generateXML({ return_code: 'FAIL', return_msg: params.return_msg })
    }

    if (out_trade_no.startsWith('rc_')) {
      const result = await handleRecharge(params)
      return result.success 
        ? generateXML({ return_code: 'SUCCESS', return_msg: 'OK' })
        : generateXML({ return_code: 'FAIL', return_msg: result.error })
    } else {
      const result = await handleOrder(params)
      return result.success 
        ? generateXML({ return_code: 'SUCCESS', return_msg: 'OK' })
        : generateXML({ return_code: 'FAIL', return_msg: result.error })
    }

  } catch (err) {
    console.error('回调处理异常:', err)
    return generateXML({ return_code: 'FAIL', return_msg: err.message })
  }
}
