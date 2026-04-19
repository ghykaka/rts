// cloudfunctions/getAppTemplates/index.js
// 获取小程序模板列表
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { 
    industry,           // 行业筛选
    category1,          // 一级分类ID
    category2,          // 二级分类ID
    templateType,      // 模板类型: image/video
    page = 1, 
    pageSize = 20 
  } = event

  try {
    console.log('getAppTemplates params:', { industry, category1, category2, templateType, page, pageSize })
    
    // 构建查询条件
    const where = {}
    
    // 状态筛选 - 只获取启用状态的模板
    where.status = 'enabled'
    
    // 模板类型筛选
    if (templateType) {
      where.templateType = templateType
    }
    
    // 行业筛选
    if (industry) {
      where.industry = industry
    }
    
    // 一级分类筛选
    if (category1) {
      where.category1 = category1
      console.log('Filtering by category1:', category1)
    }
    
    // 二级分类筛选
    if (category2) {
      where.category2 = category2
      console.log('Filtering by category2:', category2)
    }

    console.log('Final where:', JSON.stringify(where))
    
    // 查询总数
    const countResult = await db.collection('templates').where(where).count()
    const total = countResult.total
    console.log('Total templates found:', total)

    // 分页查询 - 按创建时间倒序（越新的越前面）
    const res = await db.collection('templates')
      .where(where)
      .orderBy('createTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    let templates = res.data || []

    // 获取一级分类名称
    if (templates.length > 0) {
      const category1Ids = [...new Set(templates.map(t => t.category1).filter(Boolean))]
      const functionIds = [...new Set(templates.map(t => t.functionId).filter(Boolean))]
      
      // 获取分类信息
      let category1Map = {}
      if (category1Ids.length > 0) {
        const categoryRes = await db.collection('categories')
          .where({
            _id: _.in(category1Ids),
            level: 1
          })
          .get()
        
        categoryRes.data.forEach(c => {
          category1Map[c._id] = c
        })
      }
      
      // 获取功能信息
      let functionMap = {}
      if (functionIds.length > 0) {
        const functionRes = await db.collection('workflow_functions')
          .where({
            _id: _.in(functionIds)
          })
          .get()
        
        functionRes.data.forEach(f => {
          functionMap[f._id] = f
        })
      }
      
      templates = templates.map(t => ({
        ...t,
        category1Info: category1Map[t.category1] || null,
        category1Name: category1Map[t.category1]?.name || '',
        functionName: functionMap[t.functionId]?.name || ''
      }))
    }

    return {
      success: true,
      data: {
        list: templates,
        total,
        page,
        pageSize,
        hasMore: templates.length >= pageSize
      }
    }

  } catch (err) {
    console.error('getAppTemplates error:', err)
    return { success: false, error: err.message }
  }
}
