// cloudfunctions/createOrder/index.js
const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// Coze API 配置
const COZE_API_BASE = 'https://api.coze.cn'
const ACCESS_TOKEN = 'pat_Roqj7UcU5clYdyjZ1XXGxu7mIsabPDNnVx8jckw7QtEbfak6Y8tVWaX4IWk8nytU'

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const {
    userId,
    functionId,           // 功能ID
    functionName,         // 功能名称
    workflowProductId,    // 工作流产品ID
    templateId,
    templateName,
    materialId,           // 素材ID
    sizeId,               // 尺寸ID
    serviceType,
    cozeWorkflowId,
    inputParams,
    outputType,
    aspectRatio,
    duration,
    resolution,
    costType, // balance 或 cash
    costAmount,  // 直接传入价格
    skipWorkflow = false, // 跳过执行工作流（用于微信支付场景）
    enterpriseMode = false, // 是否使用企业余额
    isSubAccount = false   // 是否子账号
  } = event

  try {
    // 1. 如果没有直接传入价格，从功能定价中获取
    let finalCostAmount = costAmount || 0

    if (!finalCostAmount && functionId) {
      // 从功能详情获取价格
      const funcRes = await db.collection('workflow_functions').doc(functionId).get()
      if (funcRes.data) {
        const func = funcRes.data
        finalCostAmount = costType === 'balance'
          ? (func.generate_price?.balance_price || 0)
          : (func.generate_price?.cash_price || 0)
      }
    }

    if (!finalCostAmount) {
      return { success: false, error: '未设置价格' }
    }

    // 2. 如果是余额支付，检查余额是否充足
    if (costType === 'balance') {
      const userRes = await db.collection('users').doc(userId).get()
      const user = userRes.data

      if (!user) {
        return { success: false, error: '用户不存在' }
      }

      // 企业余额模式
      if (enterpriseMode) {
        if (isSubAccount) {
          // 子账号：检查子账号余额
          const subRes = await db.collection('enterprise_sub_accounts')
            .where({ phone: user.phone, enterprise_id: user.enterprise_id })
            .get()
          if (!subRes.data || subRes.data.length === 0) {
            return { success: false, error: '子账号不存在' }
          }
          const subAccount = subRes.data[0]
          if (subAccount.balance < finalCostAmount) {
            return { success: false, error: '子账号余额不足' }
          }
        } else {
          // 企业管理员：检查企业余额
          // 兼容两种关联方式：
          // 1. users.enterprise_id 关联
          // 2. enterprises.admin_user_id 关联（通过企业管理员手机号）
          let enterpriseId = user.enterprise_id
          
          if (!enterpriseId) {
            // 尝试通过 admin_user_id 查找企业
            try {
              const entRes = await db.collection('enterprises')
                .where({ admin_user_id: userId })
                .get()
              if (entRes.data && entRes.data.length > 0) {
                enterpriseId = entRes.data[0]._id
              }
            } catch (e) {}
          }
          
          if (!enterpriseId) {
            return { success: false, error: '用户无企业权限' }
          }
          const entRes = await db.collection('enterprises').doc(enterpriseId).get()
          if (!entRes.data) {
            return { success: false, error: '企业不存在' }
          }
          if (entRes.data.balance < finalCostAmount) {
            return { success: false, error: '企业余额不足' }
          }
        }
      } else {
        // 个人余额
        if (user.balance < finalCostAmount) {
          return { success: false, error: '余额不足，请充值' }
        }
      }
    }

    // 3. 创建订单
    const order = {
      user_id: userId,
      function_id: functionId,
      function_name: functionName,
      workflow_product_id: workflowProductId,
      template_id: templateId,
      template_name: templateName,
      material_id: materialId,  // 素材ID
      size_id: sizeId,          // 尺寸ID
      service_type: serviceType,
      coze_workflow_id: cozeWorkflowId,
      input_params: inputParams,
      output_type: outputType || 'image',
      aspect_ratio: aspectRatio,
      duration: duration,
      resolution: resolution,
        cost_amount: finalCostAmount,
      cost_type: costType,
      enterprise_mode: enterpriseMode, // 标记是否使用企业余额
      is_sub_account: isSubAccount,   // 标记是否子账号
      status: 'pending',  // 统一设为待处理，由定时触发器执行工作流
      started_at: null,
      created_at: new Date()
    }
    console.log('创建订单，状态:', order.status)

    const orderRes = await db.collection('orders').add({
      data: order
    })

    const orderId = orderRes._id

    // 4. 如果是余额支付，扣除余额
    if (costType === 'balance') {
      if (enterpriseMode) {
        if (isSubAccount) {
          // 子账号：扣量子账号余额
          const userRes = await db.collection('users').doc(userId).get()
          const user = userRes.data
          const subRes = await db.collection('enterprise_sub_accounts')
            .where({ phone: user.phone, enterprise_id: user.enterprise_id })
            .get()
          if (subRes.data && subRes.data.length > 0) {
            const subAccount = subRes.data[0]
            await db.collection('enterprise_sub_accounts').doc(subAccount._id).update({
              data: { balance: subAccount.balance - finalCostAmount }
            })
          }
        } else {
          // 企业管理员：扣除企业余额
          const userRes = await db.collection('users').doc(userId).get()
          const user = userRes.data
          let enterpriseId = user.enterprise_id
          
          if (!enterpriseId) {
            // 尝试通过 admin_user_id 查找企业
            try {
              const entRes = await db.collection('enterprises')
                .where({ admin_user_id: userId })
                .get()
              if (entRes.data && entRes.data.length > 0) {
                enterpriseId = entRes.data[0]._id
              }
            } catch (e) {}
          }
          
          if (enterpriseId) {
            const entRes = await db.collection('enterprises').doc(enterpriseId).get()
            if (entRes.data) {
              await db.collection('enterprises').doc(enterpriseId).update({
                data: { balance: entRes.data.balance - finalCostAmount }
              })
            }
          }
        }
      } else {
        // 个人余额扣除
        await db.collection('users').doc(userId).update({
          data: {
            balance: _.inc(-finalCostAmount),
            updated_at: new Date()
          }
        })
      }
    }

    // 5. 立即异步触发工作流执行（不等待结果）
    if (cozeWorkflowId) {
      // 先更新订单状态为 processing
      await db.collection('orders').doc(orderId).update({
        data: {
          status: 'processing',
          started_at: new Date()
        }
      })
      
      // 异步调用 executeWorkflow（不等待）
      cloud.callFunction({
        name: 'executeWorkflow',
        data: {
          orderId: orderId,
          cozeWorkflowId: cozeWorkflowId,
          templateId: templateId,
          inputParams: inputParams
        }
      }).then(res => {
        console.log('工作流触发成功:', res)
      }).catch(err => {
        console.error('工作流触发失败:', err)
      })
    }

    return {
      success: true,
      data: {
        orderId: orderId,
        costAmount: finalCostAmount
      }
    }

  } catch (err) {
    console.error('createOrder error:', err)
    return { success: false, error: err.message }
  }
}

/**
 * 执行 Coze 工作流
 */
async function executeWorkflow(cozeWorkflowId, templateId, inputParams, orderId) {
  console.log('=== 执行工作流 ===')
  console.log('workflow_id:', cozeWorkflowId)
  console.log('templateId:', templateId)

  try {
    // 构建工作流参数
    const workflow_data = {}

    // 1. 获取订单信息（包含 material_id 和 size_id）
    let orderData = null
    if (orderId) {
      const orderRes = await db.collection('orders').doc(orderId).get()
      orderData = orderRes.data
    }

    // 2. 获取工作流产品配置
    let workflowProduct = null
    let fixedFieldMappings = []
    console.log('订单中的 workflow_product_id:', orderData?.workflow_product_id)
    if (orderData?.workflow_product_id) {
      const wpRes = await db.collection('workflow_products').doc(orderData.workflow_product_id).get()
      console.log('工作流产品查询结果:', wpRes.data ? '存在' : '不存在')
      if (wpRes.data) {
        workflowProduct = wpRes.data
        fixedFieldMappings = wpRes.data.fixed_field_mappings || []
        console.log('工作流产品名称:', workflowProduct.name)
        console.log('固定字段映射配置数量:', fixedFieldMappings.length)
        console.log('固定字段映射配置详情:', JSON.stringify(fixedFieldMappings))
      }
    } else {
      console.log('警告: workflow_product_id 为空!')
    }

    // 3. 获取模板信息
    let template = null
    console.log('开始查询模板, templateId:', templateId)
    if (templateId) {
      const templateRes = await db.collection('templates').doc(templateId).get()
      console.log('模板查询结果:', templateRes.data ? '存在' : '不存在')
      if (templateRes.data) {
        template = templateRes.data
        console.log('模板数据包含的字段:', Object.keys(template))
        console.log('模板 prompt 值:', template.prompt ? template.prompt.substring(0, 100) : '空')
      }
    } else {
      console.log('警告: templateId 为空!')
    }

    // 4. 获取尺寸信息（优先使用 order.size_id）
    let size = null
    const sizeIdToUse = orderData?.size_id || template?.size_id
    if (sizeIdToUse) {
      const sizeRes = await db.collection('generate_sizes').doc(sizeIdToUse).get()
      if (sizeRes.data) {
        size = sizeRes.data
      }
    }

    // 5. 获取素材信息（优先使用 order.material_id）
    let material = null
    const materialIdToUse = orderData?.material_id
    if (materialIdToUse) {
      // 直接使用 material_id 查询
      const materialRes = await db.collection('materials').doc(materialIdToUse).get()
      if (materialRes.data) {
        material = materialRes.data
        console.log('通过 material_id 获取素材:', material._id)
      }
    } else if (templateId) {
      // 备用方案：使用 template_id 查询
      const materialsRes = await db.collection('materials')
        .where({ template_id: templateId })
        .limit(1)
        .get()
      if (materialsRes.data?.length > 0) {
        material = materialsRes.data[0]
        console.log('通过 template_id 获取素材:', material._id)
      }
    }

    // 5. 根据 fixed_field_mappings 配置构建固定字段
    console.log('固定字段映射配置:', JSON.stringify(fixedFieldMappings))
    
    // 建立数据源映射
    const dataSources = {
      templates: template,
      materials: material,
      generate_sizes: size
    }
    
    console.log('数据源状态:')
    console.log('- templates:', template ? '有数据, 字段: ' + Object.keys(template).join(', ') : '空')
    console.log('- materials:', material ? '有数据, 字段: ' + Object.keys(material).join(', ') : '空')
    console.log('- size:', size ? '有数据, 字段: ' + Object.keys(size).join(', ') : '空')

    // 处理固定字段映射
    const imageFields = ['cover', 'url', 'example_image']
    
    console.log('开始遍历固定字段映射...')
    for (const mapping of fixedFieldMappings) {
      const { source_table, source_field, target_field } = mapping
      console.log(`处理映射: ${source_table}.${source_field} -> ${target_field}`)
      
      if (!source_table || !source_field || !target_field) {
        console.log('  跳过: 必要字段为空')
        continue
      }
      
      const sourceData = dataSources[source_table]
      if (!sourceData) {
        console.log(`  跳过: 数据源 ${source_table} 为空`)
        continue
      }
      console.log(`  数据源 ${source_table} 存在, 包含字段:`, Object.keys(sourceData))
      
      let value = sourceData[source_field]
      console.log(`  获取 ${source_table}.${source_field} = ${value !== undefined && value !== null ? String(value).substring(0, 100) : 'undefined/null'}`)
      
      if (value === undefined || value === null) {
        console.log('  跳过: 字段值为空')
        continue
      }
      
      // 如果是图片字段且是 cloud:// 路径，转换为 HTTPS
      if (imageFields.includes(source_field) && typeof value === 'string' && value.startsWith('cloud://')) {
        try {
          const tempRes = await cloud.getTempFileURL({
            fileList: [value]
          })
          if (tempRes.fileList && tempRes.fileList[0]?.tempFileURL) {
            value = tempRes.fileList[0].tempFileURL
            console.log(`固定字段 ${source_table}.${source_field} -> ${target_field}: cloud:// 转换成功`)
          }
        } catch (urlErr) {
          console.error(`获取文件临时链接失败 ${source_table}.${source_field}:`, urlErr)
        }
      }
      
      workflow_data[target_field] = value
      console.log(`固定字段: ${source_table}.${source_field} -> ${target_field} = ${String(value).substring(0, 50)}`)
    }

    // 6. 添加用户自定义输入参数（只传递工作流需要的字段）
    if (inputParams) {
      // 收集工作流需要的字段（固定字段映射的 target_field + input_fields 配置的 field_key）
      const allowedFields = new Set()
      
      // 添加固定字段映射的目标字段（这些是必须传递的）
      for (const mapping of fixedFieldMappings) {
        if (mapping.target_field) {
          allowedFields.add(mapping.target_field)
        }
      }
      
      // 添加 input_fields 配置的字段
      const inputFieldsConfig = workflowProduct?.input_fields || []
      console.log('input_fields 配置内容:', JSON.stringify(inputFieldsConfig))
      if (inputFieldsConfig.length > 0) {
        for (const field of inputFieldsConfig) {
          // 兼容不同的字段名格式
          const fieldKey = field.field_key || field.fieldKey || field.fieldName
          if (fieldKey) {
            allowedFields.add(fieldKey)
            console.log(`添加用户输入字段: ${fieldKey}`)
          }
        }
      } else {
        console.log('警告: input_fields 配置为空，将只传递固定字段映射的字段')
      }
      
      console.log('允许传递的字段:', Array.from(allowedFields))
      
      // 只处理允许的字段
      const imagePromises = []
      
      Object.keys(inputParams).forEach(key => {
        // 只处理允许的字段
        if (!allowedFields.has(key)) {
          console.log(`跳过不需要的字段: ${key}`)
          return
        }
        
        // 始终传递允许的字段，即使值是空的
        const value = inputParams[key]
        console.log(`处理用户输入字段 ${key}: ${value !== undefined && value !== '' ? value : '(空值)'}`)
        
        if (value !== undefined && value !== '') {
          // 如果是 cloud:// 开头的图片路径，转换为 HTTPS 链接
          if (typeof value === 'string' && value.startsWith('cloud://')) {
            imagePromises.push(
              cloud.getTempFileURL({ fileList: [value] }).then(tempRes => {
                if (tempRes.fileList && tempRes.fileList[0]?.tempFileURL) {
                  console.log(`用户输入 ${key}: cloud:// -> ${tempRes.fileList[0].tempFileURL.substring(0, 50)}...`)
                  return { key, value: tempRes.fileList[0].tempFileURL }
                }
                return { key, value }
              }).catch(urlErr => {
                console.error(`获取文件临时链接失败 ${key}:`, urlErr)
                return { key, value }
              })
            )
          } else {
            workflow_data[key] = value
          }
        } else {
          // 传递空值字段（确保 COZE 工作流必填检查通过）
          workflow_data[key] = ''
        }
      })
      
      // 并行处理所有图片转换
      if (imagePromises.length > 0) {
        const imageResults = await Promise.all(imagePromises)
        imageResults.forEach(result => {
          workflow_data[result.key] = result.value
        })
      }
    }

    console.log('工作流参数:', JSON.stringify(workflow_data))

    // 4. 调用 Coze API
    console.log('准备调用 Coze API...')
    console.log('API 端点:', `${COZE_API_BASE}/v1/workflow/run`)
    console.log('workflow_id:', cozeWorkflowId)
    console.log('parameters:', JSON.stringify(workflow_data))
    
    try {
      const response = await axios.post(
        `${COZE_API_BASE}/v1/workflow/run`,
        {
          workflow_id: cozeWorkflowId,
          parameters: workflow_data
        },
        {
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      )

      const result = response.data
      console.log('Coze 响应状态:', response.status)
      console.log('Coze 响应:', JSON.stringify(result))
      
      const resultData = result.data || result

      if (result.code !== 0) {
        return {
          success: false,
          error: result.msg || '执行工作流失败'
        }
      }

      return {
        success: true,
        conversation_id: resultData.conversation_id,
        chat_id: resultData.chat_id,
        log_id: resultData.log_id,
        // 返回原始 result_data，包含图片 URL 等信息
        result_data: resultData.data || resultData,
        // 返回工作流产品配置，包含 output_fields
        workflowProduct: workflowProduct
      }
    } catch (err) {
      console.error('执行工作流失败:', err.message)
      console.error('错误详情:', err.response?.data)
      console.error('HTTP 状态码:', err.response?.status)
      return {
        success: false,
        error: err.message
      }
    }
  } catch (err) {
    console.error('executeWorkflow 异常:', err)
    return {
      success: false,
      error: err.message || '执行工作流异常'
    }
  }
}
