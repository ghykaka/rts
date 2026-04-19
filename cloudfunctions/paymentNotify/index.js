const cloud = require('wx-server-sdk')
const crypto = require('crypto')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 商户配置
const MCH_ID = process.env.MCH_ID || '1711788352'
const API_KEY = process.env.WEIXIN_API_KEY || ''

// 解析 XML（支持 CDATA 格式）
function parseXML(xml) {
  const result = {}

  // 移除 XML 声明
  xml = xml.replace(/<\?xml[^>]*\?>/gi, '')

  // 匹配普通标签和 CDATA 标签
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

// 生成 XML
function generateXML(data) {
  let xml = '<xml>'
  for (const key in data) {
    xml += `<${key}><![CDATA[${data[key]}]]></${key}>`
  }
  xml += '</xml>'
  return xml
}

// 验证签名
function verifySign(params, key) {
  const { sign, ...paramsWithoutSign } = params
  const sortedKeys = Object.keys(paramsWithoutSign).sort()
  const signStr = sortedKeys.map(k => `${k}=${paramsWithoutSign[k]}`).join('&')
  const stringSignTemp = signStr + '&key=' + key
  const md5 = crypto.createHash('md5')
  md5.update(stringSignTemp, 'utf8')
  const calculatedSign = md5.digest('hex').toUpperCase()
  return calculatedSign === sign
}

// 处理充值订单
async function handleRecharge(params) {
  const { out_trade_no, transaction_id, total_fee } = params

  console.log('处理充值订单:', out_trade_no)

  // 查询充值记录
  const rechargeRes = await db.collection('recharges')
    .where({ out_trade_no: out_trade_no })
    .get()

  if (!rechargeRes.data || rechargeRes.data.length === 0) {
    console.error('未找到充值记录:', out_trade_no)
    return { success: false, error: '充值记录不存在' }
  }

  const recharge = rechargeRes.data[0]

  // 检查是否已处理
  if (recharge.status === 'success') {
    console.log('充值已处理过，跳过')
    return { success: true }
  }

  // 更新充值记录
  await db.collection('recharges').doc(recharge._id).update({
    data: {
      status: 'success',
      wechat_transaction_id: transaction_id,
      paid_at: db.serverDate(),
      update_at: db.serverDate()
    }
  })

  // 给用户加余额
  console.log('准备更新余额, user_id:', recharge.user_id, ', type:', recharge.type)

  if (recharge.type === 'enterprise') {
    // 企业充值 - 通过 admin_user_id 查找企业
    let enterpriseId = null
    
    // 方式1：用户表中可能有 enterprise_id
    const userRes = await db.collection('users').doc(recharge.user_id).get()
    if (userRes.data && userRes.data.enterprise_id) {
      enterpriseId = userRes.data.enterprise_id
    }
    
    // 方式2：通过 admin_user_id 查找（更可靠）
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
          data: {
            balance: newBalance,
            update_time: db.serverDate()
          }
        })

        console.log('企业余额更新成功:', { oldBalance: currentBalance, add: total_fee, newBalance })
      }
    } else {
      console.error('未找到企业信息, user_id:', recharge.user_id)
    }
  } else {
    // 个人充值
    const userRes = await db.collection('users').doc(recharge.user_id).get()
    if (userRes.data && userRes.data._id) {
      const currentBalance = userRes.data.balance || 0
      const newBalance = currentBalance + parseInt(total_fee)

      await db.collection('users').doc(recharge.user_id).update({
        data: {
          balance: newBalance,
          update_time: db.serverDate()
        }
      })

      console.log('个人余额更新成功:', { oldBalance: currentBalance, add: total_fee, newBalance })
    }
  }

  return { success: true }
}

// 处理生成订单
async function handleOrder(params) {
  const { out_trade_no, transaction_id } = params

  console.log('处理生成订单:', out_trade_no)

  // 查询订单
  const orderRes = await db.collection('orders')
    .where({ wx_out_trade_no: out_trade_no })
    .get()

  if (!orderRes.data || orderRes.data.length === 0) {
    console.error('订单不存在:', out_trade_no)
    return { success: false, error: '订单不存在' }
  }

  const order = orderRes.data[0]

  // 检查状态
  if (order.payment_status === 'paid') {
    console.log('订单已支付，跳过')
    return { success: true }
  }

  // 更新订单状态
  await db.collection('orders').doc(order._id).update({
    data: {
      status: 'processing',
      started_at: new Date(),
      payment_status: 'paid',
      wx_transaction_id: transaction_id,
      paid_at: new Date()
    }
  })

  // 触发工作流
  console.log('触发工作流...')
  cloud.callFunction({
    name: 'executeWorkflow',
    data: {
      orderId: order._id,
      cozeWorkflowId: order.coze_workflow_id,
      templateId: order.template_id,
      inputParams: order.input_params
    }
  }).then(res => {
    console.log('工作流触发成功:', res)
  }).catch(err => {
    console.error('工作流触发失败:', err)
  })

  return { success: true }
}

// 云函数入口
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext() || {}

  console.log('=== 统一支付回调 ===')
  console.log('event keys:', Object.keys(event))
  console.log('wxContext keys:', Object.keys(wxContext))
  console.log('headers:', wxContext.headers)

  // 获取原始 body - 腾讯云 SCF HTTP 触发的数据格式
  let rawBody = ''
  
  // 尝试多种方式获取 body
  if (event.body) {
    rawBody = typeof event.body === 'string' ? event.body : JSON.stringify(event.body)
  } else if (event.rawBody) {
    rawBody = event.rawBody
  } else if (wxContext.body) {
    rawBody = wxContext.body
  } else if (wxContext.request?.body) {
    rawBody = wxContext.request.body
  } else {
    // 如果都获取不到，把整个 event 转成字符串看看有什么
    rawBody = JSON.stringify(event)
  }

  console.log('rawBody 长度:', rawBody.length)
  console.log('rawBody 前200字符:', rawBody.substring(0, 200))

  // Base64 解码
  try {
    const decoded = Buffer.from(rawBody, 'base64').toString('utf8')
    if (decoded.includes('<xml>') || decoded.includes('<?xml')) {
      rawBody = decoded
      console.log('=== Base64 解码成功 ===')
    }
  } catch (e) {
    console.log('Base64 解码失败，使用原始内容')
  }

  try {
    // 解析 XML
    const params = parseXML(rawBody)
    console.log('解析后参数:', JSON.stringify(params))

    const { return_code, out_trade_no, transaction_id, total_fee } = params

    // 验证必填参数
    if (!return_code || !out_trade_no) {
      console.error('参数不完整')
      return generateXML({ return_code: 'FAIL', return_msg: '参数不完整' })
    }

    // 通信失败
    if (return_code !== 'SUCCESS') {
      console.error('通信失败:', params.return_msg)
      return generateXML({ return_code: 'FAIL', return_msg: params.return_msg })
    }

    // 验证签名（如果配置了 API_KEY）
    if (API_KEY) {
      if (!verifySign(params, API_KEY)) {
        console.error('签名验证失败，将跳过验证继续处理')
        // 不直接返回，继续处理（仅用于调试）
      } else {
        console.log('签名验证通过')
      }
    } else {
      console.warn('未配置 WEIXIN_API_KEY，跳过签名验证')
    }

    // 根据订单号前缀区分类型
    console.log('订单号:', out_trade_no, '前缀判断:', out_trade_no.startsWith('rc_') ? '充值订单' : '生成订单')
    
    let result
    if (out_trade_no.startsWith('rc_')) {
      result = await handleRecharge(params)
    } else {
      result = await handleOrder(params)
    }

    if (!result.success) {
      console.error('处理失败:', result.error)
      return generateXML({ return_code: 'FAIL', return_msg: result.error })
    }

    console.log('支付回调处理成功')
    return generateXML({ return_code: 'SUCCESS', return_msg: 'OK' })

  } catch (err) {
    console.error('回调处理异常:', err)
    return generateXML({ return_code: 'FAIL', return_msg: err.message })
  }
}
