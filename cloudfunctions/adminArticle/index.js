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
      case 'detail':
        return await getDetail(data)
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

// 获取文章列表
async function getList(data) {
  const { page = 1, pageSize = 20, keyword, status } = data || {}
  
  let where = {}
  if (keyword) {
    where.title = db.RegExp({ regexp: keyword, options: 'i' })
  }
  if (status) where.status = status
  
  const countResult = await db.collection('articles').where(where).count()
  const total = countResult.total
  
  const result = await db.collection('articles')
    .where(where)
    .orderBy('createTime', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  
  return { success: true, list: result.data, total, page, pageSize }
}

// 获取文章详情
async function getDetail(data) {
  const { id } = data
  if (!id) return { success: false, error: '缺少ID' }
  
  const result = await db.collection('articles').doc(id).get()
  if (!result.data) return { success: false, error: '文章不存在' }
  
  return { success: true, data: result.data }
}

// 添加文章
async function add(data) {
  const { title, content, path, status = 'enabled' } = data
  if (!title) return { success: false, error: '请输入文章标题' }
  if (!path) return { success: false, error: '请输入文章路径' }
  
  // 检查路径是否已存在
  const exist = await db.collection('articles').where({ path }).count()
  if (exist.total > 0) {
    return { success: false, error: '文章路径已存在' }
  }
  
  const result = await db.collection('articles').add({
    data: { title, content: content || '', path, status, createTime: new Date(), updateTime: new Date() }
  })
  return { success: true, id: result._id }
}

// 更新文章
async function update(data) {
  const { id, title, content, path, status } = data
  if (!id) return { success: false, error: '缺少ID' }
  if (!title) return { success: false, error: '请输入文章标题' }
  if (!path) return { success: false, error: '请输入文章路径' }
  
  // 检查路径是否与其他文章冲突
  const exist = await db.collection('articles').where({
    path,
    _id: db.command.neq(id)
  }).count()
  if (exist.total > 0) {
    return { success: false, error: '文章路径已被其他文章使用' }
  }
  
  await db.collection('articles').doc(id).update({
    data: { title, content: content || '', path, status, updateTime: new Date() }
  })
  return { success: true }
}

// 删除文章
async function delete(data) {
  const { id } = data
  if (!id) return { success: false, error: '缺少ID' }
  await db.collection('articles').doc(id).remove()
  return { success: true }
}
