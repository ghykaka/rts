const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// 微信支付回调处理
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  console.log('=== 订单微信支付回调 ===')
  console.log('Headers:', JSON.stringify(wxContext.headers))
  console.log('Body:', JSON.stringify(event))

  try {
    // 解析 XML 数据
    const { parseString } = require('xml2js')
    const xmlData = event.body || event
    console.log('原始数据:', xmlData)

    let result = xmlData
    if (typeof xmlData === 'string') {
      result = await new Promise((resolve, reject) => {
        parseString(xmlData, { explicitArray: false }, (err, res) => {
          if (err) reject(err)
          else resolve(res.xml || res)
        })
      })
    } else if (xmlData.xml) {
      result = xmlData.xml
    }

    console.log('解析后结果:', JSON.stringify(result))

    const { return_code, return_msg, out_trade_no, transaction_id, total_fee } = result

    // 返回应答
    if (return_code !== 'SUCCESS') {
      console.error('支付失败:', return_msg)
      return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[${return_msg}]]></return_msg></xml>`
    }

    // 查询对应的订单
    console.log('查询订单, out_trade_no:', out_trade_no)
    
    const orderRes = await db.collection('orders')
      .where({ wx_out_trade_no: out_trade_no })
      .get()

    console.log('订单查询结果:', orderRes.data?.length || 0)

    if (!orderRes.data || orderRes.data.length === 0) {
      console.error('订单不存在, out_trade_no:', out_trade_no)
      return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单不存在]]></return_msg></xml>`
    }

    const order = orderRes.data[0]
    
    // 检查订单状态
    if (order.payment_status === 'paid') {
      console.log('订单已支付，跳过处理')
      return `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`
    }

    // 更新订单状态
    console.log('更新订单状态:', order._id)
    await db.collection('orders').doc(order._id).update({
      data: {
        status: 'processing',
        started_at: new Date(),
        payment_status: 'paid',
        wx_transaction_id: transaction_id,
        paid_at: new Date()
      }
    })

    // 触发工作流执行
    console.log('触发工作流执行...')
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

    console.log('支付回调处理完成')
    return `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`

  } catch (err) {
    console.error('回调处理错误:', err)
    return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[${err.message}]]></return_msg></xml>`
  }
}
