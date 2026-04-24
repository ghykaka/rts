// cloudfunctions/getTemplateDetail/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { templateId } = event

  console.log('getTemplateDetail called, templateId:', templateId)

  try {
    // 获取模板
    const templateRes = await db.collection('templates').doc(templateId).get()
    
    console.log('模板查询结果:', templateRes)

    if (!templateRes.data) {
      return { success: false, error: '模板不存在' }
    }

    const template = templateRes.data
    let fields = []
    let pricing = []

    // 获取输入字段（可选，如果集合不存在则忽略）
    try {
      const fieldsRes = await db.collection('template_fields').where({
        template_id: templateId
      }).orderBy('sort', 'asc').get()
      fields = fieldsRes.data || []
    } catch (e) {
      console.log('template_fields 集合不存在或查询失败:', e.message)
    }

    // 获取定价（可选，如果集合不存在则忽略）
    try {
      const pricingRes = await db.collection('template_pricing').where({
        template_id: templateId,
        is_active: true
      }).get()
      pricing = pricingRes.data || []
    } catch (e) {
      console.log('template_pricing 集合不存在或查询失败:', e.message)
    }

    return {
      success: true,
      data: {
        template,
        fields,
        pricing
      }
    }

  } catch (err) {
    console.error('getTemplateDetail error:', err)
    return { success: false, error: err.message }
  }
}
