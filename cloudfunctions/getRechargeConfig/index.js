// cloudfunctions/getRechargeConfig/index.js
// 获取充值配置
const cloud = require('wx-server-sdk')
const cloudDB = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 默认充值配置（如果数据库没有配置）
const DEFAULT_CONFIG = [
  { _id: 'default_1', amount: 6, bonus: 0, name: '基础版' },
  { _id: 'default_2', amount: 30, bonus: 5, name: '月卡' },
  { _id: 'default_3', amount: 68, bonus: 18, name: '超值套餐' },
  { _id: 'default_4', amount: 128, bonus: 38, name: '年度特惠' },
  { _id: 'default_5', amount: 298, bonus: 98, name: '永久会员' }
]

exports.main = async (event, context) => {
  console.log('=== getRechargeConfig ===')

  try {
    // 尝试从数据库获取配置
    const configRes = await db.collection('recharge_configs')
      .where({ enabled: true })
      .orderBy('order', 'asc')
      .orderBy('amount', 'asc')  // 按金额升序排列，确保默认值合理
      .get()

    if (configRes.data && configRes.data.length > 0) {
      console.log('从数据库获取到充值配置:', configRes.data.length)
      return {
        success: true,
        data: configRes.data
      }
    }

    // 如果数据库没有配置，返回默认配置
    console.log('数据库无配置，返回默认配置')
    return {
      success: true,
      data: DEFAULT_CONFIG
    }

  } catch (err) {
    console.error('getRechargeConfig error:', err)
    // 出错时也返回默认配置
    return {
      success: true,
      data: DEFAULT_CONFIG
    }
  }
}
