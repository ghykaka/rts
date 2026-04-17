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

// API 接口
const api = {
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
  
  // 获取充值记录
  async getRecharges(params, token) {
    return await callCloudFunction('admingetrecharges', params, token)
  },
  
  // 获取素材列表
  async getMaterials({ page = 1, pageSize = 20 }, token) {
    return await callCloudFunction('admingetmaterials', { page, pageSize }, token)
  },
  
  // 添加素材
  async addMaterial(data, token) {
    return await callCloudFunction('adminaddmaterial', data, token)
  },
  
  // 删除素材
  async deleteMaterial(id, token) {
    return await callCloudFunction('admindeletematerial', { id }, token)
  },

  // 获取 Coze 工作流列表
  async getCozeWorkflows({ pageNum = 1, pageSize = 10, name, description, status }, token) {
    return await callCloudFunction('getcozeworkflows', {
      pageNum,
      pageSize,
      name,
      description,
      status
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

  // 上传图片（压缩到500KB以内，确保base64后不超过700KB）
  async uploadImage(file, token) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const img = new Image()
        img.onload = async () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          // 限制最大尺寸为600px（确保压缩后足够小）
          const maxDim = 600
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round(height * maxDim / width)
              width = maxDim
            } else {
              width = Math.round(width * maxDim / height)
              height = maxDim
            }
          }
          
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          
          // 逐步压缩直到小于500KB（base64会增大约33%，所以目标是<380KB原始大小）
          let quality = 0.7
          let base64 = ''
          
          const compress = () => {
            const dataUrl = canvas.toDataURL('image/jpeg', quality)
            base64 = dataUrl.split(',')[1]
            const sizeKB = (base64.length * 3) / 4 / 1024
            
            console.log('压缩后:', width + 'x' + height, '质量', quality, '大小', sizeKB.toFixed(0), 'KB')
            
            if (sizeKB > 380 && quality > 0.3) {
              quality -= 0.1
              compress()
            }
          }
          compress()
          
          console.log('准备上传, base64大小:', (base64.length * 3 / 4 / 1024).toFixed(0), 'KB')
          
          try {
            const res = await callCloudFunction('adminuploadimage', { file: base64, filename: file.name }, token)
            resolve(res)
          } catch (err) {
            reject(err)
          }
        }
        img.src = e.target.result
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
}

export default api
export { api }
