// cloudfunctions/getTemplateDetail/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { templateId } = event

  try {
    // 获取模板
    const templateRes = await db.collection('templates').doc(templateId).get()
    
    if (!templateRes.data) {
      return { success: false, error: '模板不存在' }
    }

    // 获取输入字段
    const fieldsRes = await db.collection('template_fields').where({
      template_id: templateId
    }).orderBy('sort', 'asc').get()

    // 获取定价
    const pricingRes = await db.collection('template_pricing').where({
      template_id: templateId,
      is_active: true
    }).get()

    return {
      success: true,
      data: {
        template: templateRes.data,
        fields: fieldsRes.data,
        pricing: pricingRes.data
      }
    }

  } catch (err) {
    console.error('getTemplateDetail error:', err)
    return { success: false, error: err.message }
  }
}
