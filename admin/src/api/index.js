// 使用 Railway 部署的 API
const API_BASE_URL = 'https://rts-production-3e7e.up.railway.app'

// 引入 MD5 库
import md5 from 'js-md5'

// API 接口
const api = {
  // 管理员登录
  async login({ username, password }) {
    // 对密码进行 MD5 加密（与云函数一致）
    const encryptedPwd = md5(password + 'salt')
    
    // 通过 Railway API 调用
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: encryptedPwd })
    })
    
    return await res.json()
  },
  
  // 获取用户列表（支持类型筛选和素材统计）
  async getUsers({ page = 1, pageSize = 20, userId, phone, userType, enterpriseName }, token) {
    let url = `${API_BASE_URL}/admin/users?page=${page}&pageSize=${pageSize}`
    if (userId) url += `&userId=${encodeURIComponent(userId)}`
    if (phone) url += `&phone=${encodeURIComponent(phone)}`
    if (userType) url += `&userType=${userType}`
    if (enterpriseName) url += `&enterpriseName=${encodeURIComponent(enterpriseName)}`
    
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return await res.json()
  },
  
  // 更新用户余额
  async updateUserBalance(id, balance, token) {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}/balance`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ balance })
    })
    return await res.json()
  },

  // 更新企业余额
  async updateEnterpriseBalance(id, balance, token) {
    const res = await fetch(`${API_BASE_URL}/admin/enterprises/${id}/balance`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ balance })
    })
    return await res.json()
  },
  
  // 获取充值记录
  async getRecharges(params, token) {
    const { page = 1, pageSize = 20, phone, outTradeNo, transactionId, status, startDate, endDate } = params
    let url = `${API_BASE_URL}/admin/recharges?page=${page}&pageSize=${pageSize}`
    if (phone) url += `&phone=${encodeURIComponent(phone)}`
    if (outTradeNo) url += `&outTradeNo=${encodeURIComponent(outTradeNo)}`
    if (transactionId) url += `&transactionId=${encodeURIComponent(transactionId)}`
    if (status !== undefined && status !== '') url += `&status=${status}`
    if (startDate) url += `&startDate=${startDate}`
    if (endDate) url += `&endDate=${endDate}`
    
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return await res.json()
  },
  
  // 获取素材列表
  async getMaterials({ page = 1, pageSize = 20 }, token) {
    const res = await fetch(`${API_BASE_URL}/admin/materials?page=${page}&pageSize=${pageSize}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return await res.json()
  },
  
  // 添加素材
  async addMaterial(data, token) {
    const res = await fetch(`${API_BASE_URL}/admin/materials`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    return await res.json()
  },
  
  // 删除素材
  async deleteMaterial(id, token) {
    const res = await fetch(`${API_BASE_URL}/admin/materials/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return await res.json()
  },

  // 获取 Coze 工作流列表
  async getCozeWorkflows({ pageNum = 1, pageSize = 30, workflowMode }, token) {
    let url = `${API_BASE_URL}/admin/coze/workflows?pageNum=${pageNum}&pageSize=${pageSize}`
    if (workflowMode) url += `&workflowMode=${workflowMode}`

    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return await res.json()
  }
}

export default api
export { api }
