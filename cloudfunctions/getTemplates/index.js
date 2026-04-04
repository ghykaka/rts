// cloudfunctions/getTemplates/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { categoryId, categoryName, industry, page = 1, pageSize = 20 } = event

  try {
    // 如果传了分类名称，先查找分类ID
    let targetCategoryId = categoryId
    if (categoryName && !categoryId) {
      const catRes = await db.collection('template_categories').where({
        name: db.RegExp({
          regexp: categoryName,
          options: 'i'
        })
      }).get()
      
      if (catRes.data && catRes.data.length > 0) {
        targetCategoryId = catRes.data[0]._id
      }
    }

    let query = db.collection('templates').where({
      is_active: true
    })

    // 按分类筛选
    if (targetCategoryId) {
      query = query.where({
        category_id: targetCategoryId
      })
    }

    // 按行业筛选
    if (industry) {
      query = query.where({
        industry: db.RegExp({
          regexp: industry,
          options: 'i'
        })
      })
    }

    // 分页查询
    const res = await query.orderBy('sort', 'asc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    // 获取分类信息
    let templates = res.data
    if (templates.length > 0) {
      const categoryIds = [...new Set(templates.map(t => t.category_id).filter(Boolean))]
      
      if (categoryIds.length > 0) {
        const categoryRes = await db.collection('template_categories').where({
          _id: _.in(categoryIds)
        }).get()
        
        const categoryMap = {}
        categoryRes.data.forEach(c => {
          categoryMap[c._id] = c
        })

        templates = templates.map(t => ({
          ...t,
          categoryInfo: categoryMap[t.category_id] || null
        }))
      }
    }

    return {
      success: true,
      data: {
        list: templates,
        total: res.total,
        page: page,
        pageSize: pageSize
      }
    }

  } catch (err) {
    console.error('getTemplates error:', err)
    return { success: false, error: err.message }
  }
}
