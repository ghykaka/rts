const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// Coze API 配置
const COZE_API_BASE = 'https://api.coze.cn'
const ACCESS_TOKEN = 'pat_Roqj7UcU5clYdyjZ1XXGxu7mIsabPDNnVx8jckw7QtEbfak6Y8tVWaX4IWk8nytU'
const WORKSPACE_ID = '7611606798268891178'

exports.main = async (event, context) => {
  const { pageNum = 1, pageSize = 30, workflowMode } = event

  console.log('=== 获取 Coze 工作流列表 ===')
  console.log('参数:', { pageNum, pageSize, workflowMode })

  try {
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

// 获取发布状态名称
function getPublishStatusName(status) {
  const statusMap = {
    'published_online': '已发布',
    'unpublished_draft': '未发布'
  }
  return statusMap[status] || status
}
