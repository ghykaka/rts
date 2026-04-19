// cloudfunctions/adminMaterial/index.js
// 素材管理云函数（更新名称、分类、删除等）
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { action, materialId, data, categoryId } = event

  try {
    switch (action) {
      // 更新素材名称
      case 'updateName': {
        const { name } = data
        if (!materialId || !name) {
          return { success: false, error: '参数不完整' }
        }
        
        await db.collection('materials').doc(materialId).update({
          data: {
            name: name.trim(),
            title: name.trim(),
            update_time: db.serverDate()
          }
        })
        return { success: true }
      }

      // 更新素材分类
      case 'updateCategory': {
        if (!materialId) {
          return { success: false, error: '素材ID不能为空' }
        }

        // 先查询该分类的信息，获取其 parent_id
        let catInfo = null
        try {
          const catRes = await db.collection('user_material_categories').doc(categoryId).get()
          catInfo = catRes.data
        } catch (e) {}
        
        if (!catInfo || !catInfo.parent_id) {
          try {
            const catRes2 = await db.collection('material_categories').doc(categoryId).get()
            catInfo = catRes2.data
          } catch (e) {}
        }

        const updateData = {
          update_time: db.serverDate()
        }
        
        if (categoryId) {
          updateData.category_id = categoryId
          updateData.category2_id = categoryId
          if (catInfo && catInfo.parent_id) {
            updateData.category1_id = catInfo.parent_id
          }
        } else {
          updateData.category_id = ''
          updateData.category1_id = null
          updateData.category2_id = null
        }

        await db.collection('materials').doc(materialId).update({
          data: updateData
        })
        return { success: true }
      }

      // 删除素材
      case 'delete': {
        if (!materialId) {
          return { success: false, error: '素材ID不能为空' }
        }
        
        await db.collection('materials').doc(materialId).remove()
        return { success: true }
      }

      default:
        return { success: false, error: '未知操作' }
    }
  } catch (err) {
    console.error('adminMaterial error:', err)
    return { success: false, error: err.message }
  }
}
