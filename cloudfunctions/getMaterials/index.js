// cloudfunctions/getMaterials/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { ownerType, ownerId, categoryId, type } = event

  try {
    let query = db.collection('materials').where({
      owner_type: ownerType,
      owner_id: ownerId
    })

    if (categoryId) {
      query = query.where({ category_id: categoryId })
    }

    if (type) {
      query = query.where({ type: type })
    }

    const res = await query.orderBy('created_at', 'desc').get()

    return {
      success: true,
      data: res.data
    }

  } catch (err) {
    console.error('getMaterials error:', err)
    return { success: false, error: err.message }
  }
}
