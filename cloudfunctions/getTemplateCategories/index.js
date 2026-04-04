// cloudfunctions/getTemplateCategories/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { parentId } = event

  try {
    let query = db.collection('template_categories')
    
    if (parentId) {
      query = query.where({ parent_id: parentId })
    } else {
      query = query.where({ parent_id: '' })
    }

    const res = await query.orderBy('sort', 'asc').get()

    return {
      success: true,
      data: res.data,
      list: res.data
    }

  } catch (err) {
    console.error('getTemplateCategories error:', err)
    return { success: false, error: err.message }
  }
}
