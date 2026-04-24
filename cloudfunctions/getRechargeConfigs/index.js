// cloudfunctions/getRechargeConfigs/index.js
// 获取充值配置列表（小程序端）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    // 获取所有开启的充值配置，按金额排序
    const result = await db.collection('recharge_configs')
      .where({ enabled: true })
      .orderBy('amount', 'asc')
      .get()
    
    return {
      success: true,
      data: result.data
    }
  } catch (err) {
    console.error('getRechargeConfigs error:', err)
    return { success: false, error: err.message }
  }
}
