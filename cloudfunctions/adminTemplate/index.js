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
      case 'migrate':
        return await migrateTemplateCodes()
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
    reference_images, // 参考样图（数组）
    status,          // 状态：enabled/disabled
    needMaterial,    // 是否需要关联素材
    functionId       // 绑定的功能ID
  } = data
  
  // 验证必填字段
  if (!templateType) {
    return { success: false, error: '请选择模板类型' }
  }
  if (!templateName) {
    return { success: false, error: '请输入模板名称' }
  }
  
  // 生成模板编号
  // 图片类型从 10001 开始，视频类型从 20001 开始
  const prefix = templateType === 'image' ? 10001 : 20001
  let templateCode = prefix
  
  // 先统计该类型已有多少条
  const countResult = await db.collection('templates')
    .where({
      templateType: templateType
    })
    .count()
  
  // 如果有旧数据，找最大编号
  if (countResult.total > 0) {
    const allTemplates = await db.collection('templates')
      .where({
        templateType: templateType
      })
      .field({
        templateCode: true
      })
      .limit(countResult.total)
      .get()
    
    let maxCode = prefix - 1
    for (const item of allTemplates.data) {
      if (item.templateCode !== undefined && item.templateCode !== null) {
        const code = Number(item.templateCode)
        if (!isNaN(code) && code >= prefix) {
          maxCode = code
        }
      }
    }
    templateCode = maxCode + 1
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
    reference_images: reference_images || [],
    templateCode: templateCode,
    status: status || 'enabled',
    needMaterial: needMaterial || false,
    functionId: functionId || '',
    createTime: now,
    updateTime: now
  }
  
  const result = await db.collection('templates').add({
    data: templateData
  })
  
  return {
    success: true,
    id: result._id,
    templateCode: templateCode,
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
    reference_images,
    status,
    needMaterial,
    functionId
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
    reference_images: reference_images || [],
    status: status || 'enabled',
    needMaterial: needMaterial !== undefined ? needMaterial : false,
    functionId: functionId !== undefined ? functionId : '',
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

// 迁移：为旧模板补充 templateCode
async function migrateTemplateCodes() {
  console.log('开始迁移模板编号...')
  
  // 获取所有模板
  const allTemplates = await db.collection('templates')
    .orderBy('createTime', 'asc')
    .limit(500)
    .get()
  
  let imageIndex = 0
  let videoIndex = 0
  
  // 先统计已有的编号，确定起始值
  for (const t of allTemplates.data) {
    if (t.templateCode) {
      if (t.templateType === 'image' && t.templateCode >= 10001) {
        imageIndex = Math.max(imageIndex, t.templateCode - 10001)
      }
      if (t.templateType === 'video' && t.templateCode >= 20001) {
        videoIndex = Math.max(videoIndex, t.templateCode - 20001)
      }
    }
  }
  
  let updated = 0
  for (const t of allTemplates.data) {
    // 只更新没有 templateCode 的模板
    if (!t.templateCode) {
      const prefix = t.templateType === 'image' ? 10001 : 20001
      const index = t.templateType === 'image' ? ++imageIndex : ++videoIndex
      const newCode = prefix + index - 1
      
      await db.collection('templates').doc(t._id).update({
        data: {
          templateCode: newCode,
          updateTime: new Date()
        }
      })
      updated++
      console.log(`更新模板 ${t._id}: ${t.templateName} -> ${newCode}`)
    }
  }
  
  console.log(`迁移完成，共更新 ${updated} 条记录`)
  
  return {
    success: true,
    message: `迁移完成，共更新 ${updated} 条记录`
  }
}
