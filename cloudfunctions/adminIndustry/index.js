const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const { action, data, adminToken } = event
  
  // 验证管理员 token
  if (!adminToken || adminToken.length < 10) {
    return { success: false, error: '未登录或登录已过期' }
  }
  
  try {
    switch (action) {
      case 'list':
        return await getList()
      case 'add':
        return await add(data)
      case 'update':
        return await update(data)
      case 'delete':
        return await delete(data)
      default:
        return { success: false, error: '未知的操作' }
    }
  } catch (err) {
    return { success: false, error: err.message || '服务器错误' }
  }
}

// 获取行业列表
async function getList() {
  const result = await db.collection('industries')
    .orderBy('order', 'asc')
    .orderBy('createTime', 'desc')
    .get()
  return { success: true, list: result.data }
}

// 添加行业
async function add(data) {
  const { name, order = 0, status = 'enabled' } = data
  if (!name) return { success: false, error: '请输入行业名称' }
  
  // 检查是否已存在
  const exist = await db.collection('industries').where({ name }).count()
  if (exist.total > 0) {
    return { success: false, error: '行业名称已存在' }
  }
  
  const result = await db.collection('industries').add({
    data: { name, order, status, createTime: new Date() }
  })
  return { success: true, id: result._id }
}

// 更新行业
async function update(data) {
  const { id, name, order, status } = data
  if (!id) return { success: false, error: '缺少ID' }
  if (!name) return { success: false, error: '请输入行业名称' }
  
  await db.collection('industries').doc(id).update({
    data: { name, order, status }
  })
  return { success: true }
}

// 删除行业
async function delete(data) {
  const { id } = data
  if (!id) return { success: false, error: '缺少ID' }
  await db.collection('industries').doc(id).remove()
  return { success: true }
}
