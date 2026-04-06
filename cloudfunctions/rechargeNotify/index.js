const cloud = require('wx-server-sdk')
const crypto = require('crypto')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 商户配置
const MCH_ID = '1711788352'           // 商户号（子商户）
const API_KEY = 'h21kUY34j4Liht68oPqweRY109BdmT4u'      // 子商户 API 密钥

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
      // CDATA 格式
      result[match[1]] = match[2]
    } else if (match[3] && match[4]) {
      // 普通格式
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

exports.main = async (event, context) => {
  // HTTP 触发器中，event 可能直接包含 body
  const wxContext = cloud.getWXContext() || {}
  
  // 获取原始 body（可能是 Base64 编码）
  let rawBody = event.body || event.rawBody || wxContext.body || ''
  
  // 如果是 Base64 编码，解码
  let requestBody = rawBody
  try {
    // 尝试作为 Base64 解码
    const decoded = Buffer.from(rawBody, 'base64').toString('utf8')
    // 检查解码后是否是 XML
    if (decoded.includes('<xml>') || decoded.includes('<?xml')) {
      requestBody = decoded
      console.log('=== Base64 解码成功 ===')
    }
  } catch (e) {
    console.log('=== 不是 Base64 编码，使用原始内容 ===')
  }

  console.log('=== 支付回调接收 ===')
  console.log('event.body:', typeof rawBody === 'string' ? rawBody.substring(0, 200) + '...' : rawBody)
  console.log('解码后 requestBody:', requestBody.substring(0, 500))

  try {
    // 解析 XML 数据
    const params = parseXML(requestBody)
    console.log('解析后的参数:', JSON.stringify(params, null, 2))

    // 验证必填参数
    if (!params.return_code || !params.out_trade_no) {
      console.error('参数不完整')
      return generateXML({
        return_code: 'FAIL',
        return_msg: '参数不完整'
      })
    }

    // 通信失败，直接返回
    if (params.return_code !== 'SUCCESS') {
      console.error('通信失败:', params.return_msg)
      return generateXML({
        return_code: 'FAIL',
        return_msg: '通信失败'
      })
    }

    // 验证签名（如果配置了密钥）
    if (API_KEY && !verifySign(params, API_KEY)) {
      console.error('签名验证失败')
      return generateXML({
        return_code: 'FAIL',
        return_msg: '签名验证失败'
      })
    }

    // 支付成功
    if (params.result_code === 'SUCCESS') {
      const outTradeNo = params.out_trade_no
      const transactionId = params.transaction_id
      const totalFee = parseInt(params.total_fee) // 单位是分

      console.log('支付成功:', { outTradeNo, transactionId, totalFee })

      // 查询充值记录
      const rechargeRes = await db.collection('recharges')
        .where({ out_trade_no: outTradeNo })
        .get()

      if (rechargeRes.data && rechargeRes.data.length > 0) {
        const recharge = rechargeRes.data[0]

        // 检查是否已处理过（防止重复）
        if (recharge.status !== 'success') {
          // 更新充值记录状态
          await db.collection('recharges').doc(recharge._id).update({
            data: {
              status: 'success',
              wechat_transaction_id: transactionId,
              paid_at: db.serverDate(),
              update_at: db.serverDate()
            }
          })

          // 给用户加余额
          console.log('准备更新用户余额, user_id:', recharge.user_id, ', type:', recharge.type)
          
          if (recharge.type === 'enterprise') {
            // 企业充值：更新 enterprises 表中的 balance
            const userRes = await db.collection('users').doc(recharge.user_id).get()
            if (userRes.data && userRes.data.enterprise_id) {
              const enterpriseRes = await db.collection('enterprises').doc(userRes.data.enterprise_id).get()
              if (enterpriseRes.data) {
                const currentBalance = enterpriseRes.data.balance || 0
                const newBalance = currentBalance + totalFee
                
                await db.collection('enterprises').doc(userRes.data.enterprise_id).update({
                  data: {
                    balance: newBalance,
                    update_time: db.serverDate()
                  }
                })
                
                console.log('企业余额更新成功:', {
                  enterpriseId: userRes.data.enterprise_id,
                  oldBalance: currentBalance,
                  addAmount: totalFee,
                  newBalance: newBalance
                })
              }
            }
          } else {
            // 个人充值：更新 users 表中的 balance
            const userRes = await db.collection('users').doc(recharge.user_id).get()
            console.log('用户查询结果:', JSON.stringify(userRes))
            
            // doc().get() 返回的是对象，不是数组
            if (userRes.data && userRes.data._id) {
              const user = userRes.data
              const currentBalance = user.balance || 0
              const newBalance = currentBalance + totalFee

              console.log('更新余额:', { currentBalance, addAmount: totalFee, newBalance })

              await db.collection('users').doc(recharge.user_id).update({
                data: {
                  balance: newBalance,
                  update_time: db.serverDate()
                }
              })

              console.log('用户余额更新成功:', {
                userId: recharge.user_id,
                oldBalance: currentBalance,
                addAmount: totalFee,
                newBalance: newBalance
              })
            } else {
              console.error('未找到用户或用户数据为空, user_id:', recharge.user_id)
            }
          }

          console.log('充值处理完成')
        } else {
          console.log('该订单已处理过，跳过')
        }
      } else {
        console.error('未找到充值记录:', outTradeNo)
      }
    } else {
      // 支付失败
      console.error('支付失败:', params.err_code, params.err_code_des)

      // 更新充值记录状态
      await db.collection('recharges')
        .where({ out_trade_no: params.out_trade_no })
        .update({
          data: {
            status: 'failed',
            error_code: params.err_code,
            error_msg: params.err_code_des,
            update_at: db.serverDate()
          }
        })
    }

    // 返回成功响应
    return generateXML({
      return_code: 'SUCCESS',
      return_msg: 'OK'
    })

  } catch (err) {
    console.error('支付回调处理异常:', err)
    return generateXML({
      return_code: 'FAIL',
      return_msg: err.message || '系统错误'
    })
  }
}
