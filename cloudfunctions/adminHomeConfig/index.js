// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 组件类型映射
const COMPONENT_TYPES = {
  banner: { name: '轮播图', icon: 'el-icon-picture' },
  iconGrid: { name: '金刚区', icon: 'el-icon-menu' },
  imageGrid: { name: '图片网格', icon: 'el-icon-grid' },
  waterfall: { name: '瀑布流', icon: 'el-icon-document' }
}

exports.main = async (event, context) => {
  const { action, data = {} } = event
  
  try {
    switch (action) {
      case 'list':
        return await getConfigList(data)
      case 'add':
        return await addConfig(data)
      case 'update':
        return await updateConfig(data)
      case 'delete':
        return await deleteConfig(data)
      case 'updateOrder':
        return await updateOrder(data)
      case 'getClient':
        return await getClientConfig() // 小程序端获取首页配置
      default:
        return { success: false, error: '未知的操作' }
    }
  } catch (err) {
    console.error('adminHomeConfig error:', err)
    return { success: false, error: err.message || '服务器错误' }
  }
}

// 获取配置列表
async function getConfigList(data) {
  const { page = 1, pageSize = 50 } = data
  
  const result = await db.collection('home_configs')
    .orderBy('order', 'asc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  
  // 格式化显示
  const list = result.data.map(item => ({
    ...item,
    typeName: COMPONENT_TYPES[item.componentType]?.name || item.componentType,
    itemsCount: item.items?.length || 0
  }))
  
  const countResult = await db.collection('home_configs').count()
  
  return {
    success: true,
    list,
    total: countResult.total
  }
}

// 添加配置
async function addConfig(data) {
  const { componentType, title = '', params = {}, items = [], enabled = true } = data
  
  if (!componentType || !COMPONENT_TYPES[componentType]) {
    return { success: false, error: '请选择组件类型' }
  }
  
  // 获取最大排序值
  const maxOrder = await db.collection('home_configs')
    .orderBy('order', 'desc')
    .limit(1)
    .get()
  
  const order = maxOrder.data.length > 0 ? (maxOrder.data[0].order || 0) + 1 : 1
  
  const result = await db.collection('home_configs').add({
    data: {
      componentType,
      title,
      params,
      items,
      enabled,
      order,
      createTime: new Date(),
      updateTime: new Date()
    }
  })
  
  return { success: true, id: result._id }
}

// 更新配置
async function updateConfig(data) {
  const { id, ...updateData } = data
  
  if (!id) {
    return { success: false, error: '缺少配置ID' }
  }
  
  // 移除不允许更新的字段
  delete updateData._id
  delete updateData.createTime
  
  await db.collection('home_configs').doc(id).update({
    data: {
      ...updateData,
      updateTime: new Date()
    }
  })
  
  return { success: true }
}

// 删除配置
async function deleteConfig(data) {
  const { id } = data
  
  if (!id) {
    return { success: false, error: '缺少配置ID' }
  }
  
  await db.collection('home_configs').doc(id).remove()
  
  return { success: true }
}

// 批量更新排序
async function updateOrder(data) {
  const { orders } = data // [{ id, order }]
  
  if (!Array.isArray(orders)) {
    return { success: false, error: '参数格式错误' }
  }
  
  const dbCmd = db.command
  
  for (const item of orders) {
    await db.collection('home_configs').doc(item.id).update({
      data: {
        order: item.order,
        updateTime: new Date()
      }
    })
  }
  
  return { success: true }
}

// 小程序端获取首页配置
async function getClientConfig() {
  // 获取所有启用的组件，按排序排列
  const result = await db.collection('home_configs')
    .where({ enabled: true })
    .orderBy('order', 'asc')
    .get()
  
  // 获取所有分类，构建ID到名称的映射
  const allCategories = await db.collection('categories').get()
  const categoryMap = {}
  allCategories.data.forEach(cat => {
    categoryMap[cat._id] = cat
  })
  
  // 获取所有功能，构建ID到名称的映射
  const allFunctions = await db.collection('workflow_functions').get()
  const functionMap = {}
  allFunctions.data.forEach(func => {
    functionMap[func._id] = func
  })
  
  // 处理瀑布流组件，获取模板数据
  for (const item of result.data) {
    if (item.componentType === 'waterfall') {
      // 获取首页推荐的模板
      const templates = await db.collection('templates')
        .where({ 
          status: 'enabled',
          recommendHome: true 
        })
        .limit(20)
        .orderBy('updateTime', 'desc')
        .get()
      
      // 为每个模板添加分类路径和功能名称
      item.templates = templates.data.map(tpl => {
        let categoryPath = ''
        if (tpl.category_id && categoryMap[tpl.category_id]) {
          const category = categoryMap[tpl.category_id]
          if (category.parentId && categoryMap[category.parentId]) {
            // 二级分类：显示 一级-二级
            categoryPath = `${categoryMap[category.parentId].name}-${category.name}`
          } else {
            // 一级分类：只显示一级
            categoryPath = category.name
          }
        }
        
        // 获取功能名称（支持多个功能）
        let functionName = ''
        if (tpl.functionIds && tpl.functionIds.length > 0) {
          // 取第一个功能的名称
          const firstFunc = functionMap[tpl.functionIds[0]]
          if (firstFunc) {
            functionName = firstFunc.name || ''
          }
        } else if (tpl.functionId && functionMap[tpl.functionId]) {
          // 兼容旧数据
          functionName = functionMap[tpl.functionId].name || ''
        }
        
        return {
          ...tpl,
          categoryPath,
          functionName
        }
      })
    }
  }
  
  return { success: true, data: result.data }
}
