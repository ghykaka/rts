const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 获取功能详情（包括工作流产品的flow_steps和输入字段）
exports.main = async (event, context) => {
  // 小程序调用时参数在 event 中
  const functionId = event.functionId || event.data?.functionId

  if (!functionId) {
    console.error('functionId is empty, event:', JSON.stringify(event))
    return { success: false, error: '功能ID不能为空' }
  }

  console.log('getWorkflowFunctionDetail called with functionId:', functionId)

  try {
    // 查询功能详情
    const funcRes = await db.collection('workflow_functions')
      .doc(functionId)
      .get()

    if (!funcRes.data) {
      return { success: false, error: '功能不存在' }
    }

    const func = funcRes.data

    // 如果有关联的工作流产品，获取工作流产品的详细信息
    if (func.workflow_product_id) {
      const productRes = await db.collection('workflow_products')
        .doc(func.workflow_product_id)
        .field({
          name: true,
          coze_workflow_id: true,
          coze_workflow_name: true,
          flow_steps: true,
          input_fields: true
        })
        .get()

      if (productRes.data) {
        func.workflow_product = productRes.data
        
        console.log('workflow_product.input_fields:', JSON.stringify(productRes.data.input_fields))
        
        // 强制将所有字段的 max_length 设为 500（多行文本统一500字）
        if (func.workflow_product.input_fields) {
          func.workflow_product.input_fields = func.workflow_product.input_fields.map(field => {
            // textarea/multiline 类型统一500字，其他类型保持原值但上限500
            if (field.field_type === 'textarea' || field.field_type === 'multiline') {
              return { ...field, max_length: 500 }
            }
            return { ...field, max_length: Math.min(field.max_length || 500, 500) }
          })
        }
        
        // 如果有 step1（模板选择页），获取关联的模板信息（用于参考样图）
        // 注意：用户实际选择的模板由小程序端根据传入的 templateId 查询
        if (productRes.data.flow_steps?.step1_select_style && func.template_id) {
          try {
            const templateRes = await db.collection('templates')
              .doc(func.template_id)
              .field({
                reference_images: true
              })
              .get()
          
            if (templateRes.data) {
              func.template_info = templateRes.data
            }
          } catch (err) {
            console.error('模板查询失败:', err)
          }
        }
      }
    }

    // 获取功能可选尺寸（按 sort 字段排序）
    if (func.selected_sizes && func.selected_sizes.length > 0) {
      const sizesRes = await db.collection('generate_sizes')
        .where({
          _id: db.command.in(func.selected_sizes),
          is_enabled: true
        })
        .field({
          _id: true,
          name: true,
          size_value: true,
          description: true,
          category: true,
          example_image: true,
          sort: true
        })
        .orderBy('sort', 'asc')
        .get()

      func.available_sizes = sizesRes.data || []
    }

    return { success: true, data: func }
  } catch (err) {
    console.error('getWorkflowFunctionDetail error:', err)
    return { success: false, error: err.message }
  }
}
