// cloudfunctions/adminRechargeConfig/index.js
// 充值配置管理云函数
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { action, data = {}, adminToken } = event

  try {
    // 验证管理员token（实际项目中应更严格验证）
    // if (!adminToken) {
    //   return { success: false, error: '未授权访问' }
    // }

    switch (action) {
      case 'list':
        return await getList(data)
      case 'add':
        return await addConfig(data)
      case 'update':
        return await updateConfig(data)
      case 'delete':
        return await deleteConfig(data)
      case 'toggle':
        return await toggleStatus(data)
      default:
        return { success: false, error: '未知的操作' }
    }
  } catch (err) {
    console.error('adminRechargeConfig error:', err)
    return { success: false, error: err.message || '服务器错误' }
  }
}

// 获取配置列表
async function getList(data) {
  const { page = 1, pageSize = 50 } = data
  
  const result = await db.collection('recharge_configs')
    .orderBy('amount', 'asc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  
  const countResult = await db.collection('recharge_configs').count()
  
  return {
    success: true,
    list: result.data,
    total: countResult.total
  }
}

// 添加配置
async function addConfig(data) {
  const { amount, bonus = 0, enabled = true, sort = 0 } = data
  
  if (!amount || amount <= 0) {
    return { success: false, error: '请输入正确的充值金额' }
  }
  
  // 检查金额是否已存在
  const exist = await db.collection('recharge_configs')
    .where({ amount })
    .count()
  
  if (exist.total > 0) {
    return { success: false, error: '该充值金额已存在' }
  }
  
  const result = await db.collection('recharge_configs').add({
    data: {
      amount,
      bonus,
      enabled,
      sort,
      createTime: new Date(),
      updateTime: new Date()
    }
  })
  
  return { success: true, id: result._id }
}

// 更新配置
async function updateConfig(data) {
  const { id, amount, bonus, enabled, sort } = data
  
  if (!id) {
    return { success: false, error: '缺少配置ID' }
  }
  
  if (amount !== undefined && amount <= 0) {
    return { success: false, error: '请输入正确的充值金额' }
  }
  
  // 检查金额是否与其他配置冲突
  if (amount) {
    const exist = await db.collection('recharge_configs')
      .where({
        amount,
        _id: _.neq(id)
      })
      .count()
    
    if (exist.total > 0) {
      return { success: false, error: '该充值金额已存在' }
    }
  }
  
  const updateData = {
    updateTime: new Date()
  }
  
  if (amount !== undefined) updateData.amount = amount
  if (bonus !== undefined) updateData.bonus = bonus
  if (enabled !== undefined) updateData.enabled = enabled
  if (sort !== undefined) updateData.sort = sort
  
  await db.collection('recharge_configs').doc(id).update({
    data: updateData
  })
  
  return { success: true }
}

// 删除配置
async function deleteConfig(data) {
  const { id } = data
  
  if (!id) {
    return { success: false, error: '缺少配置ID' }
  }
  
  await db.collection('recharge_configs').doc(id).remove()
  
  return { success: true }
}

// 切换状态
async function toggleStatus(data) {
  const { id, enabled } = data
  
  if (!id) {
    return { success: false, error: '缺少配置ID' }
  }
  
  await db.collection('recharge_configs').doc(id).update({
    data: {
      enabled,
      updateTime: new Date()
    }
  })
  
  return { success: true }
}
