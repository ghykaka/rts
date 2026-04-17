const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 模板管理云函数
exports.main = async (event, context) => {
  const { action, data, adminToken } = event
  
  console.log('=== adminTemplate 收到请求 ===')
  console.log('action:', action)
  console.log('adminToken:', adminToken ? '(已提供)' : '(未提供)')
  
  // 验证管理员 token
  if (!adminToken) {
    return { success: false, error: '未登录或登录已过期' }
  }
  if (adminToken.length < 10) {
    return { success: false, error: '无效的 token' }
  }
  
  try {
    switch (action) {
      case 'add':
        return await addTemplate(data)
      case 'update':
        return await updateTemplate(data)
      case 'delete':
        return await deleteTemplate(data)
      case 'list':
        return await getTemplateList(data)
      case 'detail':
        return await getTemplateDetail(data)
      default:
        return { success: false, error: '未知的操作' }
    }
  } catch (err) {
    console.error('云函数错误:', err)
    return { success: false, error: err.message || '服务器错误' }
  }
}

// 添加模板
async function addTemplate(data) {
  const {
    industry,        // 所属行业（数组）
    templateType,    // 模板类型：image/video
    templateName,    // 模板名称
    templateDesc,    // 模板描述
    category1,       // 一级分类
    category2,       // 二级分类
    tags,            // 模板标签（数组）
    prompt,          // 模板提示词（传入工作流的字段名为prompt）
    thumbnail,       // 缩略图URL
    originalImage,   // 原图URL
    status           // 状态：enabled/disabled
  } = data
  
  // 验证必填字段
  if (!templateType) {
    return { success: false, error: '请选择模板类型' }
  }
  if (!templateName) {
    return { success: false, error: '请输入模板名称' }
  }
  
  const now = new Date()
  
  const templateData = {
    industry: industry || [],
    templateType,
    templateName,
    templateDesc: templateDesc || '',
    category1: category1 || '',
    category2: category2 || '',
    tags: tags || [],
    prompt: prompt || '',
    thumbnail: thumbnail || '',
    originalImage: originalImage || '',
    status: status || 'enabled',
    createTime: now,
    updateTime: now
  }
  
  const result = await db.collection('templates').add({
    data: templateData
  })
  
  return {
    success: true,
    id: result._id,
    message: '添加成功'
  }
}

// 更新模板
async function updateTemplate(data) {
  const {
    id,
    industry,
    templateType,
    templateName,
    templateDesc,
    category1,
    category2,
    tags,
    prompt,
    thumbnail,
    originalImage,
    status
  } = data
  
  if (!id) {
    return { success: false, error: '缺少模板ID' }
  }
  
  // 验证必填字段
  if (!templateType) {
    return { success: false, error: '请选择模板类型' }
  }
  if (!templateName) {
    return { success: false, error: '请输入模板名称' }
  }
  
  const updateData = {
    industry: industry || [],
    templateType,
    templateName,
    templateDesc: templateDesc || '',
    category1: category1 || '',
    category2: category2 || '',
    tags: tags || [],
    prompt: prompt || '',
    thumbnail: thumbnail || '',
    originalImage: originalImage || '',
    status: status || 'enabled',
    updateTime: new Date()
  }
  
  await db.collection('templates').doc(id).update({
    data: updateData
  })
  
  return {
    success: true,
    message: '更新成功'
  }
}

// 删除模板
async function deleteTemplate(data) {
  const { id } = data
  
  if (!id) {
    return { success: false, error: '缺少模板ID' }
  }
  
  await db.collection('templates').doc(id).remove()
  
  return {
    success: true,
    message: '删除成功'
  }
}

// 获取模板列表
async function getTemplateList(data) {
  const {
    page = 1,
    pageSize = 20,
    keyword,
    templateType,
    status,
    category1
  } = data || {}
  
  let where = {}
  
  // 关键词搜索
  if (keyword) {
    where.templateName = db.RegExp({
      regexp: keyword,
      options: 'i'
    })
  }
  
  // 模板类型筛选
  if (templateType) {
    where.templateType = templateType
  }
  
  // 状态筛选
  if (status) {
    where.status = status
  }
  
  // 一级分类筛选
  if (category1) {
    where.category1 = category1
  }
  
  const countResult = await db.collection('templates').where(where).count()
  const total = countResult.total
  
  const listResult = await db.collection('templates')
    .where(where)
    .orderBy('createTime', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  
  return {
    success: true,
    list: listResult.data,
    total,
    page,
    pageSize
  }
}

// 获取模板详情
async function getTemplateDetail(data) {
  const { id } = data
  
  if (!id) {
    return { success: false, error: '缺少模板ID' }
  }
  
  const result = await db.collection('templates').doc(id).get()
  
  if (!result.data) {
    return { success: false, error: '模板不存在' }
  }
  
  return {
    success: true,
    data: result.data
  }
}
