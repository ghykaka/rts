// cloudfunctions/getMaterialCategories/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { ownerType, ownerId } = event

  try {
    const res = await db.collection('material_categories').where({
      owner_type: ownerType,
      owner_id: ownerId
    }).orderBy('created_at', 'asc').get()

    return {
      success: true,
      data: res.data
    }

  } catch (err) {
    console.error('getMaterialCategories error:', err)
    return { success: false, error: err.message }
  }
}
