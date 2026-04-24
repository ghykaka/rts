// 引入 MD5 库
import md5 from 'js-md5'

// 腾讯云 HTTP 访问服务地址
const API_BASE_URL = 'https://liandaofutou-2gdayw0068d938b3-1417102114.ap-shanghai.app.tcloudbase.com'

// 调用云函数的通用方法
// 方式：callCloudFunction(action, data, token)
async function callCloudFunction(action, data = {}, adminToken = null) {
  const payload = { action, data }
  if (adminToken) {
    payload.adminToken = adminToken
  }
  
  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  
  const result = await res.json()
  return { result }
}

// 直接调用云函数（绕过 adminproxy）
async function callCloudFunctionDirect(functionName, data = {}, adminToken = null) {
  const res = await fetch(`${API_BASE_URL.replace('/adminproxy', '')}/${functionName}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-admin-token': adminToken || ''
    },
    body: JSON.stringify(data)
  })
  
  const result = await res.json()
  return { result }
}

// API 接口
const api = {
  // 直接调用云函数（绕过 adminproxy）
  callCloudFunctionDirect,

  // 管理员登录
  async login({ username, password }) {
    const encryptedPwd = md5(password + 'salt')
    return await callCloudFunction('login', { username, password: encryptedPwd })
  },
  
  // 获取用户列表
  async getUsers({ page = 1, pageSize = 20, userId, phone, userType, enterpriseName }, token) {
    return await callCloudFunction('admingetusers', {
      page,
      pageSize,
      userId,
      phone,
      userType,
      enterpriseName
    }, token)
  },
  
  // 更新用户余额
  async updateUserBalance(id, balance, token) {
    return await callCloudFunction('adminupdateuser', { id, balance }, token)
  },

  // 更新企业余额
  async updateEnterpriseBalance(id, balance, token) {
    return await callCloudFunction('updateEnterpriseBalance', { id, balance }, token)
  },

  // 初始化数据库集合
  async initCollections(token) {
    return await callCloudFunction('initCollections', {}, token)
  },

  // 获取充值记录
  async getRecharges(params, token) {
    return await callCloudFunction('admingetrecharges', params, token)
  },
  
  // 获取素材列表
  async getMaterials({ page = 1, pageSize = 20, phone, userType, category1Id, category2Id, keyword }, token) {
    return await callCloudFunction('admingetmaterials', { page, pageSize, phone, userType, category1Id, category2Id, keyword }, token)
  },

  // 添加素材
  async addMaterial(data, token) {
    return await callCloudFunction('adminaddmaterial', data, token)
  },

  // 批量添加素材
  async batchAddMaterials(data, token) {
    return await callCloudFunction('adminbatchaddmaterials', data, token)
  },

  // 更新素材
  async updateMaterial(data, token) {
    return await callCloudFunction('adminupdatematerial', data, token)
  },

  // 删除素材
  async deleteMaterial(id, token) {
    return await callCloudFunction('admindeletematerial', { id }, token)
  },

  // 批量删除素材
  async batchDeleteMaterials(params, token) {
    return await callCloudFunction('adminbatchdeletematerials', params, token)
  },

  // ============ 用户素材分类管理 ============

  // 获取用户素材分类
  async getUserMaterialCategories(params, token) {
    return await callCloudFunction('admingetusermaterials', params, token)
  },

  // 创建/更新用户素材分类
  async upsertUserMaterialCategory(data, token) {
    return await callCloudFunction('adminupsertusermaterialcategory', data, token)
  },

  // 删除用户素材分类
  async deleteUserMaterialCategory(id, token) {
    return await callCloudFunction('admindeleteusermaterialcategory', { id }, token)
  },

  // 获取 Coze 工作流列表
  async getCozeWorkflows({ pageNum = 1, pageSize = 10, name, description, status, workflowId, getDetails }, token) {
    return await callCloudFunction('getcozeworkflows', {
      pageNum,
      pageSize,
      name,
      description,
      status,
      workflowId,
      getDetails
    }, token)
  },

  // 获取 Coze 工作流详情
  async getCozeWorkflowDetail(workflowId, token) {
    return await callCloudFunction('getcozeworkflowdetail', {
      workflow_id: workflowId
    }, token)
  },

  // ============ 工作流产品管理 ============

  async getWorkflowProducts(params, token) {
    return await callCloudFunction('getworkflowproducts', params, token)
  },

  async getWorkflowProductDetail(id, token) {
    return await callCloudFunction('getworkflowproductdetail', { id }, token)
  },

  async createWorkflowProduct(data, token) {
    return await callCloudFunction('createworkflowproduct', data, token)
  },

  async updateWorkflowProduct(data, token) {
    return await callCloudFunction('updateworkflowproduct', data, token)
  },

  async deleteWorkflowProduct(id, token) {
    return await callCloudFunction('deleteworkflowproduct', { id }, token)
  },

  // ============ 功能管理 ============

  async getWorkflowFunctions(params, token) {
    return await callCloudFunction('getworkflowfunctions', params, token)
  },

  async getWorkflowFunctionDetail(id, token) {
    return await callCloudFunction('getworkflowfunctiondetail', { id }, token)
  },

  async createWorkflowFunction(data, token) {
    return await callCloudFunction('createworkflowfunction', data, token)
  },

  async updateWorkflowFunction(data, token) {
    return await callCloudFunction('updateworkflowfunction', data, token)
  },

  async deleteWorkflowFunction(id, token) {
    return await callCloudFunction('deleteworkflowfunction', { id }, token)
  },

  // 获取功能列表（用于首页配置跳转目标选择）
  async getFunctionList(token) {
    return await callCloudFunction('getworkflowfunctions', { page: 1, pageSize: 100 }, token)
  },

  // ============ 生成物尺寸管理 ============

  async getGenerateSizes(params, token) {
    return await callCloudFunction('getgeneratesizes', params, token)
  },

  async createGenerateSize(data, token) {
    return await callCloudFunction('creategeneratesize', data, token)
  },

  async updateGenerateSize(data, token) {
    return await callCloudFunction('updategeneratesize', data, token)
  },

  async deleteGenerateSize(id, token) {
    return await callCloudFunction('deletegeneratesize', { id }, token)
  },

  // ============ 模板管理 ============

  // 获取模板列表
  async getTemplates(params, token) {
    return await callCloudFunction('admintemplate', { action: 'list', data: params }, token)
  },

  // 获取模板详情
  async getTemplateDetail(id, token) {
    return await callCloudFunction('admintemplate', { action: 'detail', data: { id } }, token)
  },

  // 添加模板
  async addTemplate(data, token) {
    return await callCloudFunction('admintemplate', { action: 'add', data }, token)
  },

  // 更新模板
  async updateTemplate(data, token) {
    return await callCloudFunction('admintemplate', { action: 'update', data }, token)
  },

  // 删除模板
  async deleteTemplate(id, token) {
    return await callCloudFunction('admintemplate', { action: 'delete', data: { id } }, token)
  },

  // 迁移模板编号
  async migrateTemplateCodes(token) {
    return await callCloudFunction('admintemplate', { action: 'migrate' }, token)
  },

  // ============ 首页配置 ============
  async getHomeConfigs(token) {
    return await callCloudFunction('adminhomeconfig', { action: 'list' }, token)
  },
  async addHomeConfig(data, token) {
    return await callCloudFunction('adminhomeconfig', { action: 'add', data }, token)
  },
  async updateHomeConfig(data, token) {
    return await callCloudFunction('adminhomeconfig', { action: 'update', data }, token)
  },
  async deleteHomeConfig(id, token) {
    return await callCloudFunction('adminhomeconfig', { action: 'delete', data: { id } }, token)
  },
  async updateHomeConfigOrder(orders, token) {
    return await callCloudFunction('adminhomeconfig', { action: 'updateOrder', data: { orders } }, token)
  },

  // ============ 行业管理 ============

  async getIndustries(token) {
    return await callCloudFunction('adminindustry', { action: 'list' }, token)
  },

  async addIndustry(data, token) {
    return await callCloudFunction('adminindustry', { action: 'add', data }, token)
  },

  async updateIndustry(data, token) {
    return await callCloudFunction('adminindustry', { action: 'update', data }, token)
  },

  async deleteIndustry(id, token) {
    return await callCloudFunction('adminindustry', { action: 'delete', data: { id } }, token)
  },

  // ============ 企业管理 ============

  // 获取企业详情
  async getEnterpriseDetail(id, token) {
    return await callCloudFunction('getenterprise', { id }, token)
  },

  // 更新企业信息
  async updateEnterprise(data, token) {
    return await callCloudFunction('updateenterprise', data, token)
  },

  // ============ 企业子账号管理 ============

  // 获取企业子账号列表
  async getEnterpriseSubAccounts(enterpriseId, token) {
    return await callCloudFunction('getsubaccounts', { enterpriseId }, token)
  },

  // 添加子账号
  async addSubAccount(data, token) {
    return await callCloudFunction('addsubaccount', data, token)
  },

  // 更新子账号
  async updateSubAccount(data, token) {
    return await callCloudFunction('updatesubaccount', data, token)
  },

  // 删除子账号
  async deleteSubAccount(id, token) {
    return await callCloudFunction('deletesubaccount', { id }, token)
  },

  // ============ 分类管理 ============

  async getCategories(token) {
    return await callCloudFunction('admincategory', { action: 'list' }, token)
  },

  async addCategory(data, token) {
    return await callCloudFunction('admincategory', { action: 'add', data }, token)
  },

  async updateCategory(data, token) {
    return await callCloudFunction('admincategory', { action: 'update', data }, token)
  },

  async deleteCategory(id, token) {
    return await callCloudFunction('admincategory', { action: 'delete', data: { id } }, token)
  },

  // ============ 文章管理 ============

  async getArticles(params, token) {
    return await callCloudFunction('adminarticle', { action: 'list', data: params }, token)
  },

  async getArticleDetail(id, token) {
    return await callCloudFunction('adminarticle', { action: 'detail', data: { id } }, token)
  },

  async addArticle(data, token) {
    return await callCloudFunction('adminarticle', { action: 'add', data }, token)
  },

  async updateArticle(data, token) {
    return await callCloudFunction('adminarticle', { action: 'update', data }, token)
  },

  async deleteArticle(id, token) {
    return await callCloudFunction('adminarticle', { action: 'delete', data: { id } }, token)
  },

  // ============ 充值金额配置 ============

  async getRechargeConfigs(token) {
    return await callCloudFunction('adminRechargeConfig', { action: 'list' }, token)
  },

  async addRechargeConfig(data, token) {
    return await callCloudFunction('adminRechargeConfig', { action: 'add', data }, token)
  },

  async updateRechargeConfig(data, token) {
    return await callCloudFunction('adminRechargeConfig', { action: 'update', data }, token)
  },

  async deleteRechargeConfig(id, token) {
    return await callCloudFunction('adminRechargeConfig', { action: 'delete', data: { id } }, token)
  },

  async toggleRechargeConfig(id, enabled, token) {
    return await callCloudFunction('adminRechargeConfig', { action: 'toggle', data: { id, enabled } }, token)
  },

  // ============ 订单管理 ============

  async getAdminOrders(params, token) {
    return await callCloudFunction('adminOrder', { action: 'list', data: params }, token)
  },

  async getAdminOrderDetail(orderId, token) {
    return await callCloudFunction('adminOrder', { action: 'detail', data: { orderId } }, token)
  },

  async retryOrderWorkflow(orderId, token) {
    return await callCloudFunction('adminOrder', { action: 'retry', data: { orderId } }, token)
  },

  // 压缩图片（如果太大）
  async compressImage(file, maxSizeKB = 300) {
    // 如果文件已经小于目标大小，直接返回
    if (file.size <= maxSizeKB * 1024) {
      return file
    }
    
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // 计算压缩后的尺寸
          let width = img.width
          let height = img.height
          const maxDimension = 1920 // 最大边长
          
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round(height * maxDimension / width)
              width = maxDimension
            } else {
              width = Math.round(width * maxDimension / height)
              height = maxDimension
            }
          }
          
          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)
          
          // 逐步降低质量直到文件小于目标大小
          let quality = 0.8
          let blob = canvas.toBlob('image/jpeg', quality)
          
          const tryCompress = () => {
            if (blob.size <= maxSizeKB * 1024 || quality <= 0.1) {
              // 转回 File 对象
              const compressedFile = new File([blob], file.name, { type: 'image/jpeg' })
              console.log('图片压缩完成:', file.name, '原始:', (file.size/1024).toFixed(0), 'KB', '压缩后:', (blob.size/1024).toFixed(0), 'KB')
              resolve(compressedFile)
            } else {
              quality -= 0.1
              blob = canvas.toBlob('image/jpeg', quality)
              tryCompress()
            }
          }
          
          tryCompress()
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  },

  // 上传图片（保持原始格式，由云函数生成JPG缩略图）
  async uploadImage(file, token) {
    return this.uploadImageWithProgress(file, token, null)
  },

  // 带进度的上传图片（前端直传COS，原图存储，COS生成缩略图）
  async uploadImageWithProgress(file, token, onProgress) {
    // 文件大小限制：10MB
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return { success: false, error: '图片大小不能超过10MB' }
    }
    
    try {
      // 1. 获取预签名 URL
      if (onProgress) onProgress(0, file.size)
      
      const res1 = await callCloudFunction('getcosuploadurl', {
        filename: file.name,
        fileSize: file.size,
        contentType: file.type || 'image/jpeg'
      }, token)
      
      const result1 = res1.result || res1
      if (!result1.success) {
        return result1
      }
      
      const { uploadUrl, cosPath } = result1.data
      
      // 2. 前端直传文件到 COS
      if (onProgress) onProgress(file.size * 0.3, file.size)
      
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'image/jpeg'
        },
        body: file
      })
      
      if (!uploadRes.ok) {
        console.error('COS上传失败:', uploadRes.status)
        return { success: false, error: `上传失败: ${uploadRes.status}` }
      }
      
      if (onProgress) onProgress(file.size * 0.8, file.size)
      
      // 3. 获取访问 URL
      const res2 = await callCloudFunction('processuploadedimage', {
        cosPath
      }, token)
      
      const result2 = res2.result || res2
      
      if (onProgress) onProgress(file.size, file.size)
      
      if (result2.success) {
        return {
          success: true,
          url: result2.data.url,           // 原图URL
          thumbnailUrl: result2.data.thumbnailUrl  // COS生成的缩略图
        }
      } else {
        // 如果处理失败，返回原图URL
        return {
          success: true,
          url: uploadUrl.split('?')[0]
        }
      }
    } catch (err) {
      console.error('上传失败:', err)
      return { success: false, error: err.message }
    }
  }
}

export default api
export { api, callCloudFunction, callCloudFunctionDirect }
