const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { page = 1, pageSize = 20, name, type, userId, keyword, userType, category1Id, category2Id } = event

  console.log('=== 获取素材列表 ===')
  console.log('params:', { page, pageSize, name, type, userId, keyword, userType, category1Id, category2Id })

  try {
    const where = {}

    // 素材类型（图片/视频）
    if (type) {
      where.type = type
    }
    
    // 用户类型（personal/enterprise）
    if (userType) {
      where.user_type = userType
    }
    
    // 用户ID
    if (userId) {
      where.user_id = userId
    }
    
    // 分类筛选
    if (category1Id) {
      where.category1_id = category1Id
    }
    if (category2Id) {
      where.category2_id = category2Id
    }
    
    // 素材名称关键词搜索
    if (name || keyword) {
      where.title = db.RegExp({
        regexp: name || keyword,
        options: 'i'
      })
    }

    // 获取总数
    const countResult = await db.collection('materials')
      .where(where)
      .count()

    // 获取列表
    const listResult = await db.collection('materials')
      .where(where)
      .orderBy('create_time', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    // 关联查询用户信息
    const materials = listResult.data || []
    const userIds = [...new Set(materials.map(m => m.user_id).filter(Boolean))]
    
    let userMap = {}
    if (userIds.length > 0) {
      const userResult = await db.collection('users')
        .where({
          _id: _.in(userIds)
        })
        .limit(100)
        .get()
      
      // 构建用户信息映射
      ;(userResult.data || []).forEach(user => {
        userMap[user._id] = user
      })
    }

    // 关联分类信息（查询 user_material_categories 集合）
    const categoryIds = [...new Set([
      ...materials.map(m => m.category1_id).filter(Boolean),
      ...materials.map(m => m.category2_id).filter(Boolean)
    ])]
    
    console.log('需要查询的分类IDs:', categoryIds)
    
    let categoryMap = {}
    if (categoryIds.length > 0) {
      // 查 user_material_categories（小程序和后台共用的分类表）
      const catResult = await db.collection('user_material_categories')
        .where({
          _id: _.in(categoryIds)
        })
        .limit(100)
        .get()
      
      console.log('user_material_categories 查询结果:', catResult.data.length, '条')
      
      ;(catResult.data || []).forEach(cat => {
        categoryMap[cat._id] = cat
        console.log('分类映射:', cat._id, '->', cat.name)
      })
      
      // 同时查 material_categories（备用）
      const catResult2 = await db.collection('material_categories')
        .where({
          _id: _.in(categoryIds)
        })
        .limit(100)
        .get()
      
      console.log('material_categories 查询结果:', catResult2.data.length, '条')
      
      ;(catResult2.data || []).forEach(cat => {
        if (!categoryMap[cat._id]) {
          categoryMap[cat._id] = cat
        }
      })
    }

    // 合并用户和分类信息到素材数据
    const enrichedMaterials = await Promise.all(materials.map(async m => {
      const user = userMap[m.user_id] || {}
      
      // 转换 cloud:// URL 为临时链接
      let displayUrl = m.url || ''
      let displayThumbnailUrl = m.thumbnail_url || ''
      
      try {
        if (displayUrl && displayUrl.startsWith('cloud://')) {
          const urlRes = await cloud.getTempFileURL({
            fileList: [displayUrl]
          })
          if (urlRes.fileList && urlRes.fileList[0] && urlRes.fileList[0].tempFileURL) {
            displayUrl = urlRes.fileList[0].tempFileURL
          }
        }
        
        if (displayThumbnailUrl && displayThumbnailUrl.startsWith('cloud://')) {
          const thumbRes = await cloud.getTempFileURL({
            fileList: [displayThumbnailUrl]
          })
          if (thumbRes.fileList && thumbRes.fileList[0] && thumbRes.fileList[0].tempFileURL) {
            displayThumbnailUrl = thumbRes.fileList[0].tempFileURL
          }
        }
      } catch (err) {
        console.error('转换临时链接失败:', err)
      }
      
      return {
        ...m,
        url: displayUrl,
        thumbnail_url: displayThumbnailUrl,
        user_phone: user.phone || '',
        company_name: user.company_name || '',
        company_short_name: user.company_short_name || '',
        category1_name: categoryMap[m.category1_id]?.name || '',
        category2_name: categoryMap[m.category2_id]?.name || ''
      }
    }))

    console.log('查询结果:', {
      total: countResult.total,
      count: enrichedMaterials.length,
      firstItem: enrichedMaterials[0] || null
    })
    console.log('categoryMap keys:', Object.keys(categoryMap))
    console.log('materials原始数据前3条:', materials.slice(0, 3).map(m => ({
      _id: m._id,
      title: m.title,
      url: m.url,
      thumbnail_url: m.thumbnail_url,
      category1_id: m.category1_id,
      category2_id: m.category2_id
    })))

    return {
      success: true,
      data: enrichedMaterials,
      total: countResult.total
    }

  } catch (err) {
    console.error('获取素材列表失败:', err)
    return {
      success: false,
      error: '获取数据失败'
    }
  }
}
