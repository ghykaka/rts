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
        return await getList(data)
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

// 获取分类列表
async function getList(data) {
  const { level } = data || {}
  let where = {}
  if (level) where.level = parseInt(level)
  
  const result = await db.collection('categories')
    .where(where)
    .orderBy('order', 'asc')
    .orderBy('createTime', 'desc')
    .get()
  
  // 构造成树形结构
  const list = result.data
  const tree = []
  const map = {}
  
  list.forEach(item => {
    map[item._id] = { ...item, children: [] }
  })
  
  list.forEach(item => {
    if (item.parentId && map[item.parentId]) {
      map[item.parentId].children.push(map[item._id])
    } else if (!item.parentId) {
      tree.push(map[item._id])
    }
  })
  
  return { success: true, list: tree, flatList: list }
}

// 添加分类
async function add(data) {
  const { name, parentId, level, order = 0, status = 'enabled' } = data
  if (!name) return { success: false, error: '请输入分类名称' }
  
  const result = await db.collection('categories').add({
    data: { name, parentId: parentId || null, level: level || 1, order, status, createTime: new Date() }
  })
  return { success: true, id: result._id }
}

// 更新分类
async function update(data) {
  const { id, name, parentId, level, order, status } = data
  if (!id) return { success: false, error: '缺少ID' }
  if (!name) return { success: false, error: '请输入分类名称' }
  
  await db.collection('categories').doc(id).update({
    data: { name, parentId: parentId || null, level: level || 1, order, status }
  })
  return { success: true }
}

// 删除分类
async function delete(data) {
  const { id } = data
  if (!id) return { success: false, error: '缺少ID' }
  
  // 检查是否有子分类
  const children = await db.collection('categories').where({ parentId: id }).count()
  if (children.total > 0) {
    return { success: false, error: '请先删除子分类' }
  }
  
  await db.collection('categories').doc(id).remove()
  return { success: true }
}
