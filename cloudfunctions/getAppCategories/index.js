// cloudfunctions/getAppCategories/index.js
// 获取小程序行业和分类数据
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { action, userId, userType, level, parentId } = event

  try {
    // 获取行业列表
    const getIndustries = async () => {
      const res = await db.collection('industries')
        .where({ status: 'enabled' })
        .orderBy('order', 'asc')
        .get()
      return res.data || []
    }

    // 获取一级分类
    const getCategories = async () => {
      const res = await db.collection('categories')
        .where({ level: 1, status: 'enabled' })
        .orderBy('order', 'asc')
        .get()
      return res.data || []
    }

    // 获取二级分类
    const getSubCategories = async (pId) => {
      const res = await db.collection('categories')
        .where({ level: 2, parentId: pId, status: 'enabled' })
        .orderBy('order', 'asc')
        .get()
      return res.data || []
    }

    // 获取用户素材分类（来自 user_material_categories）
    const getUserMaterialCategories = async () => {
      const where = {}
      if (userType) where.user_type = userType
      if (userId) where.user_id = userId
      
      console.log('getUserMaterialCategories query where:', JSON.stringify(where))
      
      const res = await db.collection('user_material_categories')
        .where(where)
        .orderBy('level', 'asc')
        .orderBy('order', 'asc')
        .orderBy('create_time', 'asc')  // 添加第三个排序条件确保稳定性
        .get()
      
      console.log('getUserMaterialCategories found:', res.data.length, 'records')
      
      // 如果没有分类，自动创建"未分类"一级分类和同名二级分类
      if (res.data.length === 0 && userId) {
        console.log('No categories found, creating default categories')
        
        // 创建一级分类"未分类"
        const topRes = await db.collection('user_material_categories').add({
          data: {
            name: '未分类',
            parent_id: null,
            user_type: userType || 'personal',
            user_id: userId,
            order: 0,
            level: 1,
            is_default: true,
            create_time: db.serverDate(),
            update_time: db.serverDate()
          }
        })
        
        // 创建二级分类"未分类"，关联到一级分类
        await db.collection('user_material_categories').add({
          data: {
            name: '未分类',
            parent_id: topRes._id,
            user_type: userType || 'personal',
            user_id: userId,
            order: 0,
            level: 2,
            is_default: true,
            create_time: db.serverDate(),
            update_time: db.serverDate()
          }
        })
        
        // 重新查询
        const newRes = await db.collection('user_material_categories')
          .where(where)
          .orderBy('level', 'asc')
          .orderBy('order', 'asc')
          .get()
        return newRes.data || []
      }
      
      console.log('First 3 records:', JSON.stringify(res.data.slice(0, 3)))
      return res.data || []
    }

    // 更新分类名称
    const updateCategory = async (categoryId, name) => {
      await db.collection('user_material_categories').doc(categoryId).update({
        data: {
          name: name,
          update_time: db.serverDate()
        }
      })
      return { success: true }
    }

    // 删除分类
    const deleteCategory = async (categoryId) => {
      // 检查是否有素材使用该分类（包括 category_id, category1_id, category2_id）
      const materialsRes = await db.collection('materials')
        .where(_.or([
          { category_id: categoryId },
          { category1_id: categoryId },
          { category2_id: categoryId }
        ]))
        .count()
      
      if (materialsRes.total > 0) {
        return { success: false, error: '该分类下有素材，请先移除或删除素材后再删除分类' }
      }

      // 检查是否有子分类
      const childrenRes = await db.collection('user_material_categories')
        .where({ parent_id: categoryId })
        .count()
      
      if (childrenRes.total > 0) {
        return { success: false, error: '该分类下有子分类，请先删除子分类后再删除' }
      }

      // 删除分类
      await db.collection('user_material_categories').doc(categoryId).remove()
      return { success: true }
    }

    // 批量更新排序
    const updateSortOrders = async (updates, userId) => {
      console.log('updateSortOrders received:', JSON.stringify(updates))
      
      if (!updates || !Array.isArray(updates) || updates.length === 0) {
        return { success: false, error: '无效的更新数据' }
      }

      try {
        // 并行执行所有更新（移除多余的 get 查询）
        const promises = updates.map(async (item) => {
          const updateResult = await db.collection('user_material_categories').doc(item._id).update({
            data: { 
              order: Number(item.order),
              update_time: db.serverDate()
            }
          })
          return { id: item._id, updated: updateResult.stats?.updated || 0 }
        })
        
        const results = await Promise.all(promises)
        console.log('All update results:', JSON.stringify(results))
        
        // 检查是否所有更新都成功了
        const allUpdated = results.every(r => r.updated > 0)
        if (!allUpdated) {
          const failedCount = results.filter(r => r.updated === 0).length
          return { success: false, error: `有 ${failedCount} 条更新失败`, results }
        }
        
        return { success: true, results }
      } catch (err) {
        console.error('updateSortOrders error:', err)
        return { success: false, error: err.message }
      }
    }

    // 添加分类
    const addCategory = async (data) => {
      // 获取当前最大排序值
      const where = {}
      if (data.user_type) where.user_type = data.user_type
      if (data.user_id) where.user_id = data.user_id
      
      // 判断是否是一级分类
      const isTopLevel = !data.parent_id || data.parent_id === ''
      if (isTopLevel) {
        // 查询 parent_id 为 null 或 空字符串 的记录
        where.parent_id = _.or([{ parent_id: null }, { parent_id: '' }])
      } else {
        where.parent_id = data.parent_id
      }

      const maxRes = await db.collection('user_material_categories')
        .where(where)
        .orderBy('order', 'desc')
        .limit(1)
        .get()

      const maxOrder = (maxRes.data && maxRes.data.length > 0) ? (maxRes.data[0].order || 0) : -1

      const res = await db.collection('user_material_categories').add({
        data: {
          name: data.name,
          parent_id: isTopLevel ? null : data.parent_id,
          user_type: data.user_type,
          user_id: data.user_id,
          order: maxOrder + 1,
          level: isTopLevel ? 1 : 2,
          create_time: db.serverDate(),
          update_time: db.serverDate()
        }
      })
      return { success: true, id: res._id }
    }

    // 修复所有分类的 order 值
    const fixOrders = async (targetUserId, targetUserType) => {
      console.log('fixOrders for userId:', targetUserId, 'userType:', targetUserType)
      
      try {
        // 获取该用户的所有一级分类
        const topRes = await db.collection('user_material_categories')
          .where({
            user_id: targetUserId,
            user_type: targetUserType,
            level: 1,
            parent_id: null
          })
          .orderBy('order', 'asc')
          .get()
        
        console.log('Found top-level categories:', topRes.data.length)
        
        let updated = 0
        for (let i = 0; i < topRes.data.length; i++) {
          const cat = topRes.data[i]
          // 更新一级分类的 order
          await db.collection('user_material_categories').doc(cat._id).update({
            data: { order: i }
          })
          updated++
          
          // 获取并更新该一级分类下的二级分类
          const subRes = await db.collection('user_material_categories')
            .where({
              parent_id: cat._id,
              level: 2
            })
            .orderBy('order', 'asc')
            .get()
          
          console.log('Sub-categories for', cat.name, ':', subRes.data.length)
          
          for (let j = 0; j < subRes.data.length; j++) {
            await db.collection('user_material_categories').doc(subRes.data[j]._id).update({
              data: { order: j }
            })
            updated++
          }
        }
        
        return { success: true, message: `已修复 ${updated} 个分类的排序值` }
      } catch (err) {
        console.error('fixOrders error:', err)
        return { success: false, error: err.message }
      }
    }

    switch (action) {
      case 'industries':
        return { success: true, data: await getIndustries() }
      
      case 'categories':
        return { success: true, data: await getCategories() }
      
      case 'subCategories': {
        return { success: true, data: await getSubCategories(parentId) }
      }
      
      // 获取用户素材分类
      case 'userMaterialCategories':
        return { success: true, data: await getUserMaterialCategories() }
      
      // 更新分类名称
      case 'updateCategory':
        return await updateCategory(event.categoryId, event.name)
      
      // 删除分类
      case 'deleteCategory':
        return await deleteCategory(event.categoryId)
      
      // 批量更新排序
      case 'updateSortOrders':
        return await updateSortOrders(event.updates, event.userId)
      
      // 添加分类
      case 'addCategory':
        return await addCategory({
          name: event.name,
          parent_id: event.parentId,
          user_type: event.userType,
          user_id: event.userId
        })
      
      // 修复分类 order 值
      case 'fixOrders':
        return await fixOrders(event.userId, event.userType)
      
      case 'all':
      default: {
        const industries = await getIndustries()
        const categories = await getCategories()
        
        // 获取所有一级分类的二级分类
        const subCategoriesMap = {}
        for (const cat of categories) {
          const subs = await getSubCategories(cat._id)
          subCategoriesMap[cat._id] = subs
        }
        
        return {
          success: true,
          data: {
            industries,
            categories,
            subCategoriesMap
          }
        }
      }
    }
  } catch (err) {
    console.error('getAppCategories error:', err)
    return { success: false, error: err.message }
  }
}
