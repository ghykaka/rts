const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// Coze API 配置
const COZE_API_BASE = 'https://api.coze.cn'
const ACCESS_TOKEN = 'pat_Roqj7UcU5clYdyjZ1XXGxu7mIsabPDNnVx8jckw7QtEbfak6Y8tVWaX4IWk8nytU'
const WORKSPACE_ID = '7611606798268891178'

exports.main = async (event, context) => {
  const { pageNum = 1, pageSize = 30, workflowMode, workflowId, getDetails } = event

  console.log('=== 获取 Coze 工作流列表 ===')
  console.log('参数:', { pageNum, pageSize, workflowMode, workflowId, getDetails })

  try {
    // 如果指定了 workflowId 且需要获取详情，调用详情接口
    if (workflowId && getDetails) {
      return await getWorkflowDetails(workflowId)
    }

    // 构建请求参数
    const params = {
      workspace_id: WORKSPACE_ID,
      page_num: pageNum,
      page_size: pageSize,
      publish_status: 'all'
    }
    
    if (workflowMode) {
      params.workflow_mode = workflowMode
    }

    // 调用 Coze API
    const response = await axios.get(`${COZE_API_BASE}/v1/workflows`, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params
    })

    const result = response.data

    console.log('Coze API 响应:', {
      code: result.code,
      msg: result.msg,
      total: result.data?.total || 0,
      count: result.data?.items?.length || 0
    })

    if (result.code !== 0) {
      return {
        success: false,
        error: result.msg || '获取工作流列表失败'
      }
    }

    // 整理工作流数据
    const workflows = (result.data?.items || []).map(item => ({
      workflow_id: item.workflow_id,
      workflow_name: item.workflow_name,
      description: item.description || '',
      icon_url: item.icon_url || '',
      workflow_mode: item.workflow_mode, // workflow 或 chatflow
      workflow_mode_name: item.workflow_mode === 'workflow' ? '工作流' : '对话流',
      publish_status: item.publish_status,
      publish_status_name: getPublishStatusName(item.publish_status),
      app_id: item.app_id || '',
      created_at: item.created_at ? new Date(item.created_at * 1000).toLocaleString('zh-CN') : '',
      updated_at: item.updated_at ? new Date(item.updated_at * 1000).toLocaleString('zh-CN') : '',
      creator: item.creator?.name || ''
    }))

    return {
      success: true,
      data: workflows,
      total: result.data?.total || 0,
      has_more: result.data?.has_more || false
    }

  } catch (err) {
    console.error('获取工作流列表失败:', err)
    
    // 处理 Axios 错误
    if (err.response) {
      console.error('API 错误响应:', err.response.data)
      return {
        success: false,
        error: `API 请求失败: ${err.response.status} - ${JSON.stringify(err.response.data)}`
      }
    }
    
    return {
      success: false,
      error: '获取工作流列表失败: ' + err.message
    }
  }
}

// 获取单个工作流的详细信息（输入/输出参数）
async function getWorkflowDetails(workflowId) {
  console.log('获取工作流详情:', workflowId)
  
  try {
    const response = await axios.get(`${COZE_API_BASE}/v1/workflows/${workflowId}`, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        workflow_id: workflowId
      }
    })

    const result = response.data
    console.log('工作流详情响应 code:', result.code)

    if (result.code !== 0) {
      return {
        success: false,
        error: result.msg || '获取工作流详情失败'
      }
    }

    // Coze API 返回的数据在 data.workflow_detail 中
    const workflowDetail = result.data?.workflow_detail || result.data || {}
    console.log('工作流名:', workflowDetail.workflow_name)
    console.log('原始数据 keys:', Object.keys(workflowDetail))

    // 尝试获取输入输出参数 - 可能在不同位置
    let inputParamsData = workflowDetail.input_params || workflowDetail.input_definition || {}
    let outputParamsData = workflowDetail.output_params || workflowDetail.output_definition || {}

    // 如果是嵌套在 workflow_detail 里的情况
    if (!inputParamsData.properties && workflowDetail.properties) {
      inputParamsData = workflowDetail.properties?.input || {}
      outputParamsData = workflowDetail.properties?.output || {}
    }

    console.log('输入参数原始:', JSON.stringify(inputParamsData))
    console.log('输出参数原始:', JSON.stringify(outputParamsData))

    // 整理输入参数
    const inputParams = []
    const inputProps = inputParamsData.properties || inputParamsData
    if (inputProps && typeof inputProps === 'object') {
      const required = inputParamsData.required || []
      
      for (const [key, config] of Object.entries(inputProps)) {
        if (typeof config === 'object') {
          const fieldName = config.description || config.name || key
          // 判断是否是多行文本字段（字段名包含关键词或配置有多行标记）
          const isMultiline = isMultilineField(key, fieldName, config)
          // 多行文本默认1000字，其他默认200字
          const defaultMaxLength = isMultiline ? 1000 : 200
          
          inputParams.push({
            field_key: key,
            field_name: fieldName,
            field_type: isMultiline ? 'textarea' : getFieldType(config.type),
            max_length: config.max_length || defaultMaxLength,
            is_required: required.includes(key)
          })
        }
      }
    }

    // 整理输出参数
    const outputParams = []
    const outputProps = outputParamsData.properties || outputParamsData
    if (outputProps && typeof outputProps === 'object') {
      for (const [key, config] of Object.entries(outputProps)) {
        if (typeof config === 'object') {
          outputParams.push({
            field_key: key,
            field_name: config.description || config.name || key,
            field_type: getFieldType(config.type),
            downloadable: true,
            copyable: false
          })
        }
      }
    }

    console.log('整理后输入参数:', inputParams.length, '个')
    console.log('整理后输出参数:', outputParams.length, '个')

    return {
      success: true,
      data: {
        workflow_id: workflowId,
        workflow_name: workflowDetail.workflow_name,
        description: workflowDetail.description || '',
        input_params: inputParams,
        output_params: outputParams
      }
    }

  } catch (err) {
    console.error('获取工作流详情失败:', err.message)
    return {
      success: false,
      error: '获取工作流详情失败: ' + err.message
    }
  }
}

// 根据 JSON Schema 类型映射为前端类型
function getFieldType(type) {
  const typeMap = {
    'string': 'text',
    'integer': 'number',
    'number': 'number',
    'boolean': 'text',
    'array': 'text',
    'object': 'text'
  }
  return typeMap[type] || 'text'
}

// 判断是否是多行文本字段
function isMultilineField(key, fieldName, config) {
  // 如果配置明确标记了 multiline
  if (config.multiline === true || config.field_type === 'multiline' || config.fieldType === 'multiline') {
    return true
  }
  
  // 字段名包含关键词的视为多行文本
  const multilineKeywords = ['内容', '描述', '详情', '正文', '说明', '文案', '文章', '故事', '剧本', '台词', '对话', 'message', 'content', 'description', 'text', 'input']
  const lowerKey = key.toLowerCase()
  const lowerName = fieldName.toLowerCase()
  
  for (const keyword of multilineKeywords) {
    if (lowerKey.includes(keyword) || lowerName.includes(keyword)) {
      return true
    }
  }
  
  return false
}

// 获取发布状态名称
function getPublishStatusName(status) {
  const statusMap = {
    'published_online': '已发布',
    'unpublished_draft': '未发布'
  }
  return statusMap[status] || status
}
