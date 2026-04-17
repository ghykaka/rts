const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 格式化时间戳
function formatTimestamp(timestamp) {
  if (!timestamp) return '-'
  const date = new Date(timestamp * 1000)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * 统一代理云函数
 * 接收 action 参数，转发到相应的云函数
 */
exports.main = async (event, context) => {
  // 处理 HTTP 访问服务的请求格式
  let body = event.body || event
  
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch (e) {
      body = {}
    }
  }
  
  const { action, data, adminToken } = body
  
  console.log('=== adminproxy 收到请求 ===')
  console.log('action:', action)
  console.log('adminToken存在:', !!adminToken, adminToken ? adminToken.substring(0, 20) + '...' : 'null')
  console.log('数据keys:', Object.keys(body))

  // 验证管理员 token（登录和初始化管理员接口不需要）
  if (action !== 'login' && action !== 'initadmin') {
    if (!adminToken) {
      console.log('错误: adminToken为空')
      return { success: false, error: '未登录或登录已过期' }
    }
    if (adminToken.length < 10) {
      console.log('错误: adminToken长度不足')
      return { success: false, error: '无效的 token' }
    }
  }
  console.log('token验证通过')

  const cloudBaseApp = cloud
  const db = cloud.database()

  try {
    switch (action) {
      // 管理员登录
      case 'login': {
        const { username, password } = data || {}
        if (!username || !password) {
          return { success: false, error: '用户名和密码不能为空' }
        }
        
        const users = db.collection('admin_users')
        const result = await users.where({ username }).get()
        
        if (result.data.length === 0) {
          return { success: false, error: '用户名或密码错误' }
        }
        
        const user = result.data[0]
        if (user.password !== password) {
          return { success: false, error: '用户名或密码错误' }
        }
        
        // 生成简单的 token
        const token = Buffer.from(`${username}:${Date.now()}`).toString('base64')
        
        return {
          success: true,
          token,
          user: { id: user._id, username: user.username, role: user.role }
        }
      }

      // 初始化管理员（仅当没有管理员时可用）
      case 'initadmin': {
        const { username, password } = data || {}
        if (!username || !password) {
          return { success: false, error: '用户名和密码不能为空' }
        }
        
        // 检查是否已有管理员
        const existing = await db.collection('admin_users').count()
        if (existing.total > 0) {
          return { success: false, error: '管理员已存在，请直接登录' }
        }
        
        // 创建第一个管理员
        const result = await db.collection('admin_users').add({
          data: {
            username,
            password, // 直接存储明文密码（实际项目应该加密）
            role: 'admin',
            createTime: new Date()
          }
        })
        
        return {
          success: true,
          message: '管理员创建成功，请登录',
          id: result._id
        }
      }

      // 获取用户列表（企业+个人）
      case 'admingetusers': {
        const { page = 1, pageSize = 20, userId, phone, userType, enterpriseName, includeStats } = data || {}
        
        const collectionName = userType === 'personal' ? 'users' : 'enterprises'
        let query = db.collection(collectionName)
        
        if (phone) {
          query = query.where({ phone: db.RegExp({ regexp: phone, options: 'i' }) })
        }
        if (enterpriseName && userType === 'enterprise') {
          query = query.where({ 
            company_name: db.RegExp({ regexp: enterpriseName, options: 'i' }) 
          })
        }
        
        // 获取总数
        const countResult = await query.count()
        const total = countResult.total
        
        // 分页查询
        const skip = (page - 1) * pageSize
        const listResult = await query
          .orderBy('create_time', 'desc')
          .skip(skip)
          .limit(pageSize)
          .get()
        
        let list = listResult.data || []
        
        // 补充子账号统计（仅企业用户）
        if (userType !== 'personal' && includeStats !== false) {
          const userIds = list.map(u => u.user_id).filter(Boolean)
          if (userIds.length > 0) {
            const subAccounts = await db.collection('users')
              .where({
                parent_user_id: db.RegExp({ regexp: '.*', options: 'i' })
              })
              .field({ phone: true, user_id: true, parent_user_id: true, balance: true })
              .get()
            
            const subAccountMap = {}
            subAccounts.data.forEach(sub => {
              if (sub.parent_user_id) {
                if (!subAccountMap[sub.parent_user_id]) {
                  subAccountMap[sub.parent_user_id] = []
                }
                subAccountMap[sub.parent_user_id].push({
                  phone: sub.phone,
                  balance: sub.balance || 0
                })
              }
            })
            
            list = list.map(item => ({
              ...item,
              subAccountCount: subAccountMap[item.user_id]?.length || 0,
              subAccounts: subAccountMap[item.user_id] || []
            }))
          }
        }
        
        return {
          success: true,
          data: list,
          total,
          page,
          pageSize
        }
      }

      // 更新用户余额
      case 'adminupdateuser': {
        const { id, balance, phone } = data || {}
        
        if (!id && !phone) {
          return { success: false, error: '用户ID或手机号不能为空' }
        }
        
        let query = db.collection('users')
        if (phone) {
          query = query.where({ phone })
        } else {
          query = query.doc(id)
        }
        
        await query.update({
          data: {
            balance: parseFloat(balance),
            update_time: new Date()
          }
        })
        
        return { success: true }
      }

      // 更新企业余额
      case 'updateEnterpriseBalance': {
        const { id, balance } = data || {}
        
        if (!id) {
          return { success: false, error: '企业ID不能为空' }
        }
        
        await db.collection('enterprises').doc(id).update({
          data: {
            balance: parseFloat(balance),
            update_time: new Date()
          }
        })
        
        return { success: true }
      }

      // 获取充值记录
      case 'admingetrecharges': {
        const { page = 1, pageSize = 20, phone, outTradeNo, transactionId, status, startDate, endDate } = data || {}
        
        let query = db.collection('recharges')
        
        if (phone) {
          query = query.where({ phone: db.RegExp({ regexp: phone, options: 'i' }) })
        }
        if (outTradeNo) {
          query = query.where({ out_trade_no: db.RegExp({ regexp: outTradeNo, options: 'i' }) })
        }
        if (transactionId) {
          query = query.where({ transaction_id: db.RegExp({ regexp: transactionId, options: 'i' }) })
        }
        if (status !== undefined && status !== '') {
          query = query.where({ status: status })
        }
        if (startDate || endDate) {
          const andConditions = []
          if (startDate) {
            andConditions.push({ create_time: db.RegExp({ regexp: `^${startDate}`, options: 'i' }) })
          }
          if (endDate) {
            andConditions.push({ create_time: db.RegExp({ regexp: `^${endDate}`, options: 'i' }) })
          }
          if (andConditions.length > 0) {
            query = query.where(db.command.and(andConditions))
          }
        }
        
        const countResult = await query.count()
        const total = countResult.total
        
        const skip = (page - 1) * pageSize
        const listResult = await query
          .orderBy('created_at', 'desc')
          .skip(skip)
          .limit(pageSize)
          .get()
        
        // 关联查询用户手机号和企业简称
        let list = listResult.data || []
        const userIds = [...new Set(list.map(item => item.user_id).filter(Boolean))]
        if (userIds.length > 0) {
          // 查询 users 表获取手机号
          const usersResult = await db.collection('users')
            .where({
              user_id: db.command.in(userIds)
            })
            .field({ user_id: true, phone: true })
            .get()
          
          // 查询 enterprises 表获取手机号和企业简称
          const enterprisesResult = await db.collection('enterprises')
            .where({
              admin_user_id: db.command.in(userIds)
            })
            .field({ admin_user_id: true, admin_phone: true, company_short_name: true })
            .get()
          
          const phoneMap = {}
          const companyMap = {}
          usersResult.data.forEach(user => {
            phoneMap[user.user_id] = user.phone || '-'
          })
          enterprisesResult.data.forEach(user => {
            phoneMap[user.admin_user_id] = user.admin_phone || '-'
            companyMap[user.admin_user_id] = user.company_short_name || ''
          })
          
          list = list.map(item => ({
            ...item,
            user_phone: phoneMap[item.user_id] || '-',
            company_short_name: companyMap[item.user_id] || ''
          }))
        }
        
        // 手动按时间降序排序
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        
        return {
          success: true,
          data: list,
          total,
          page,
          pageSize
        }
      }

      // 获取素材列表
      case 'admingetmaterials': {
        const { page = 1, pageSize = 20 } = data || {}
        
        const countResult = await db.collection('materials').count()
        const total = countResult.total
        
        const skip = (page - 1) * pageSize
        const listResult = await db.collection('materials')
          .orderBy('create_time', 'desc')
          .skip(skip)
          .limit(pageSize)
          .get()
        
        return {
          success: true,
          data: listResult.data || [],
          total,
          page,
          pageSize
        }
      }

      // 添加素材
      case 'adminaddmaterial': {
        const { title, content, type, url } = data || {}
        
        if (!title) {
          return { success: false, error: '素材标题不能为空' }
        }
        
        const result = await db.collection('materials').add({
          data: {
            title,
            content: content || '',
            type: type || 'text',
            url: url || '',
            create_time: new Date(),
            update_time: new Date()
          }
        })
        
        return { success: true, id: result.id }
      }

      // 删除素材
      case 'admindeletematerial': {
        const { id } = data || {}
        
        if (!id) {
          return { success: false, error: '素材ID不能为空' }
        }
        
        await db.collection('materials').doc(id).remove()
        
        return { success: true }
      }

      // 获取 Coze 工作流列表
      case 'getcozeworkflows': {
        const https = require('https')
        const COZE_TOKEN = 'pat_Roqj7UcU5clYdyjZ1XXGxu7mIsabPDNnVx8jckw7QtEbfak6Y8tVWaX4IWk8nytU'
        const WORKSPACE_ID = '7611606798268891178'
        
        const { pageNum = 1, pageSize = 10, name, description, status = 'published' } = data || {}
        
        // 构建 API URL，默认只查询已发布的工作流，Coze API 最大 page_size=30
        let url = `https://api.coze.cn/v1/workflows?workspace_id=${WORKSPACE_ID}&page_num=1&page_size=30&publish_status=published_online`
        
        // 使用 Promise 封装 https 请求
        const cozeRequest = (requestUrl) => {
          return new Promise((resolve, reject) => {
            const req = https.request(requestUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${COZE_TOKEN}`,
                'Content-Type': 'application/json'
              }
            }, (res) => {
              let responseData = ''
              res.on('data', chunk => responseData += chunk)
              res.on('end', () => {
                try {
                  resolve(JSON.parse(responseData))
                } catch (e) {
                  resolve({ code: 1, msg: '解析响应失败', data: null })
                }
              })
            })
            req.on('error', reject)
            req.end()
          })
        }
        
        const response = await cozeRequest(url)
        
        if (response.code === 0 && response.data) {
          let items = response.data.items || []
          
          // 名称模糊搜索
          if (name) {
            items = items.filter(item => 
              item.workflow_name && item.workflow_name.toLowerCase().includes(name.toLowerCase())
            )
          }
          
          // 描述模糊搜索
          if (description) {
            items = items.filter(item => 
              item.description && item.description.toLowerCase().includes(description.toLowerCase())
            )
          }
          
          // 过滤已发布状态（API 已经用 publish_status=published_online 过滤了，无需再过滤）
          // 但需要处理返回数据中 publish_status 可能为 null 的情况（表示已发布）
          
          // 按时间降序排序
          items.sort((a, b) => b.created_at - a.created_at)
          
          // 转换时间戳
          items = items.map(item => ({
            ...item,
            workflow_mode_name: '工作流',
            publish_status_name: '已发布',
            created_at_str: formatTimestamp(item.created_at),
            updated_at_str: formatTimestamp(item.updated_at)
          }))
          
          // 分页
          const total = items.length
          const start = (pageNum - 1) * pageSize
          const pagedItems = items.slice(start, start + pageSize)
          
          return {
            success: true,
            data: pagedItems,
            total,
            page: pageNum,
            pageSize,
            has_more: start + pageSize < total
          }
        } else {
          return { success: false, error: response.msg || '获取工作流列表失败' }
        }
      }
      
      // 获取 Coze 工作流详情
      case 'getcozeworkflowdetail': {
        const https = require('https')
        const COZE_TOKEN = 'pat_Roqj7UcU5clYdyjZ1XXGxu7mIsabPDNnVx8jckw7QtEbfak6Y8tVWaX4IWk8nytU'
        const { workflow_id } = data || {}
        
        if (!workflow_id) {
          return { success: false, error: '工作流ID不能为空' }
        }
        
        const cozeRequest = (requestUrl, method = 'GET', requestBody = null) => {
          return new Promise((resolve, reject) => {
            const options = {
              method,
              headers: {
                'Authorization': `Bearer ${COZE_TOKEN}`,
                'Content-Type': 'application/json'
              }
            }
            const req = https.request(requestUrl, options, (res) => {
              let responseData = ''
              res.on('data', chunk => responseData += chunk)
              res.on('end', () => {
                try {
                  resolve(JSON.parse(responseData))
                } catch (e) {
                  resolve({ code: 1, msg: '解析响应失败' })
                }
              })
            })
            req.on('error', reject)
            if (requestBody) {
              req.write(JSON.stringify(requestBody))
            }
            req.end()
          })
        }
        
        // 获取工作流基本信息
        const listUrl = `https://api.coze.cn/v1/workflows?workspace_id=7611606798268891178&page_num=1&page_size=100&publish_status=published_online`
        const listResponse = await cozeRequest(listUrl)
        
        let workflowInfo = null
        if (listResponse.code === 0 && listResponse.data) {
          workflowInfo = listResponse.data.items.find(item => item.workflow_id === workflow_id)
        }
        
        // 尝试获取工作流详情（包括输入参数）
        // Coze API: GET /v1/workflows/{workflow_id}?include_input_output=true 返回包含 input/output 结构体的详情
        let detailInfo = null
        try {
          // 必须添加 include_input_output=true 参数才能获取 input 结构体
          const detailUrl = `https://api.coze.cn/v1/workflows/${workflow_id}?include_input_output=true`
          const detailResponse = await cozeRequest(detailUrl)
          console.log('工作流详情响应:', JSON.stringify(detailResponse))
          if (detailResponse.code === 0 && detailResponse.data) {
            detailInfo = detailResponse.data
          }
        } catch (e) {
          console.log('获取工作流详情失败:', e.message)
        }
        
        return {
          success: true,
          data: {
            ...workflowInfo,
            detail: detailInfo
          }
        }
      }

      // ============ 工作流产品管理 ============

      // 获取工作流产品列表
      case 'getworkflowproducts': {
        const { page = 1, pageSize = 20, name, isActive } = data || {}
        
        let query = db.collection('workflow_products')
        
        if (name) {
          query = query.where({ name: db.RegExp({ regexp: name, options: 'i' }) })
        }
        if (isActive !== undefined && isActive !== '') {
          query = query.where({ is_active: isActive === true || isActive === 'true' })
        }
        
        const countResult = await query.count()
        const total = countResult.total
        
        const skip = (page - 1) * pageSize
        const listResult = await query
          .orderBy('sort', 'asc')
          .orderBy('created_at', 'desc')
          .skip(skip)
          .limit(pageSize)
          .get()
        
        return {
          success: true,
          data: listResult.data || [],
          total,
          page,
          pageSize
        }
      }

      // 获取工作流产品详情
      case 'getworkflowproductdetail': {
        const { id } = data || {}
        
        if (!id) {
          return { success: false, error: '产品ID不能为空' }
        }
        
        const result = await db.collection('workflow_products').doc(id).get()
        
        if (result.data.length === 0) {
          return { success: false, error: '产品不存在' }
        }
        
        return {
          success: true,
          data: result.data[0]
        }
      }

      // 创建工作流产品
      case 'createworkflowproduct': {
        const { name, cozeWorkflowId, cozeWorkflowName, inputFields, flowSteps, sort = 0 } = data || {}
        
        if (!name) {
          return { success: false, error: '产品名称不能为空' }
        }
        if (!cozeWorkflowId) {
          return { success: false, error: '请选择关联工作流' }
        }
        
        const result = await db.collection('workflow_products').add({
          data: {
            name,
            coze_workflow_id: cozeWorkflowId,
            coze_workflow_name: cozeWorkflowName || '',
            input_fields: inputFields || [],
            flow_steps: flowSteps || {
              step1_select_style: false,
              step2_materials: false,
              step2_materials_type: 'personal',
              step3_input: true,
              step4_resize: false
            },
            is_active: true,
            sort: parseInt(sort) || 0,
            created_at: new Date(),
            updated_at: new Date()
          }
        })
        
        return { success: true, id: result.id }
      }

      // 更新工作流产品
      case 'updateworkflowproduct': {
        const { id, name, cozeWorkflowId, cozeWorkflowName, inputFields, flowSteps, isActive, sort } = data || {}
        
        if (!id) {
          return { success: false, error: '产品ID不能为空' }
        }
        
        const updateData = { updated_at: new Date() }
        
        if (name !== undefined) updateData.name = name
        if (cozeWorkflowId !== undefined) updateData.coze_workflow_id = cozeWorkflowId
        if (cozeWorkflowName !== undefined) updateData.coze_workflow_name = cozeWorkflowName
        if (inputFields !== undefined) updateData.input_fields = inputFields
        if (flowSteps !== undefined) updateData.flow_steps = flowSteps
        if (isActive !== undefined) updateData.is_active = isActive
        if (sort !== undefined) updateData.sort = parseInt(sort)
        
        await db.collection('workflow_products').doc(id).update({ data: updateData })
        
        return { success: true }
      }

      // 删除工作流产品
      case 'deleteworkflowproduct': {
        const { id } = data || {}

        if (!id) {
          return { success: false, error: '产品ID不能为空' }
        }

        await db.collection('workflow_products').doc(id).remove()

        return { success: true }
      }

      // ============ 功能管理 ============

      // 获取功能列表
      case 'getworkflowfunctions': {
        const { page = 1, pageSize = 20, name, workflowProductId, industry, isActive } = data || {}

        let query = db.collection('workflow_functions')

        if (name) {
          query = query.where({ name: db.RegExp({ regexp: name, options: 'i' }) })
        }
        if (workflowProductId) {
          query = query.where({ workflow_product_id: workflowProductId })
        }
        if (industry) {
          query = query.where({ industries: db.RegExp({ regexp: industry, options: 'i' }) })
        }
        if (isActive !== undefined && isActive !== '') {
          query = query.where({ is_active: isActive === true || isActive === 'true' })
        }

        const countResult = await query.count()
        const total = countResult.total

        const skip = (page - 1) * pageSize
        const listResult = await query
          .orderBy('created_at', 'desc')
          .skip(skip)
          .limit(pageSize)
          .get()

        return {
          success: true,
          data: listResult.data || [],
          total,
          page,
          pageSize
        }
      }

      // 获取功能详情
      case 'getworkflowfunctiondetail': {
        const { id } = data || {}

        if (!id) {
          return { success: false, error: '功能ID不能为空' }
        }

        const result = await db.collection('workflow_functions').doc(id).get()

        if (result.data.length === 0) {
          return { success: false, error: '功能不存在' }
        }

        return {
          success: true,
          data: result.data[0]
        }
      }

      // 创建功能
      case 'createworkflowfunction': {
        const {
          name,
          description,
          workflowProductId,
          workflowProductName,
          industries,
          generatePrice,
          expandPrice,
          images,
          referenceImages,
          selectedSizes,
          isActive = true
        } = data || {}

        if (!name) {
          return { success: false, error: '功能名称不能为空' }
        }
        if (!workflowProductId) {
          return { success: false, error: '请选择对应的工作流产品' }
        }

        const result = await db.collection('workflow_functions').add({
          data: {
            name,
            description: description || '',
            workflow_product_id: workflowProductId,
            workflow_product_name: workflowProductName || '',
            industries: industries || [],
            generate_price: generatePrice || { cash_price: 0, balance_price: 0 },
            expand_price: expandPrice || { enabled: false, cash_price: 0, balance_price: 0 },
            images: images || { thumbnail: '', fullsize: '' },
            reference_images: referenceImages || [],
            selected_sizes: selectedSizes || [],
            is_active: isActive,
            created_at: new Date(),
            updated_at: new Date()
          }
        })

        return { success: true, id: result.id }
      }

      // 更新功能
      case 'updateworkflowfunction': {
        const {
          id,
          name,
          description,
          workflowProductId,
          workflowProductName,
          industries,
          generatePrice,
          expandPrice,
          images,
          referenceImages,
          selectedSizes,
          isActive
        } = data || {}

        if (!id) {
          return { success: false, error: '功能ID不能为空' }
        }

        const updateData = { updated_at: new Date() }

        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description
        if (workflowProductId !== undefined) updateData.workflow_product_id = workflowProductId
        if (workflowProductName !== undefined) updateData.workflow_product_name = workflowProductName
        if (industries !== undefined) updateData.industries = industries
        if (generatePrice !== undefined) updateData.generate_price = generatePrice
        if (expandPrice !== undefined) updateData.expand_price = expandPrice
        if (images !== undefined) updateData.images = images
        if (referenceImages !== undefined) updateData.reference_images = referenceImages
        if (selectedSizes !== undefined) updateData.selected_sizes = selectedSizes
        if (isActive !== undefined) updateData.is_active = isActive

        await db.collection('workflow_functions').doc(id).update({ data: updateData })

        return { success: true }
      }

      // 删除功能
      case 'deleteworkflowfunction': {
        const { id } = data || {}

        if (!id) {
          return { success: false, error: '功能ID不能为空' }
        }

        await db.collection('workflow_functions').doc(id).remove()

        return { success: true }
      }

      // ============ 生成物尺寸管理 ============

      // 获取尺寸列表
      case 'getgeneratesizes': {
        const { page = 1, pageSize = 20, category, name, isEnabled } = data || {}

        let query = db.collection('generate_sizes')

        if (category) {
          query = query.where({ category })
        }
        if (name) {
          query = query.where({ name: db.RegExp({ regexp: name, options: 'i' }) })
        }
        if (isEnabled !== undefined && isEnabled !== '') {
          query = query.where({ is_enabled: isEnabled === true || isEnabled === 'true' })
        }

        const countResult = await query.count()
        const total = countResult.total

        const skip = (page - 1) * pageSize
        const listResult = await query
          .orderBy('category', 'asc')
          .orderBy('created_at', 'desc')
          .skip(skip)
          .limit(pageSize)
          .get()

        return {
          success: true,
          data: listResult.data || [],
          total,
          page,
          pageSize
        }
      }

      // 创建尺寸
      case 'creategeneratesize': {
        const { category, name, description, sizeValue, isEnabled = true } = data || {}

        if (!category) {
          return { success: false, error: '请选择分类' }
        }
        if (!name) {
          return { success: false, error: '尺寸名称不能为空' }
        }
        if (!sizeValue) {
          return { success: false, error: '尺寸值不能为空' }
        }

        const result = await db.collection('generate_sizes').add({
          data: {
            category,
            name,
            description: description || '',
            size_value: sizeValue,
            is_enabled: isEnabled,
            created_at: new Date(),
            updated_at: new Date()
          }
        })

        return { success: true, id: result.id }
      }

      // 更新尺寸
      case 'updategeneratesize': {
        const { id, category, name, description, sizeValue, isEnabled } = data || {}

        if (!id) {
          return { success: false, error: '尺寸ID不能为空' }
        }

        const updateData = { updated_at: new Date() }

        if (category !== undefined) updateData.category = category
        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description
        if (sizeValue !== undefined) updateData.size_value = sizeValue
        if (isEnabled !== undefined) updateData.is_enabled = isEnabled

        await db.collection('generate_sizes').doc(id).update({ data: updateData })

        return { success: true }
      }

      // 删除尺寸
      case 'deletegeneratesize': {
        const { id } = data || {}

        if (!id) {
          return { success: false, error: '尺寸ID不能为空' }
        }

        await db.collection('generate_sizes').doc(id).remove()

        return { success: true }
      }

      // ============ 行业管理 ============
      case 'adminindustry': {
        const { action: op, data: opData } = data || {}
        console.log('adminindustry op:', op, 'opData:', opData)
        switch (op) {
          case 'list': {
            const result = await db.collection('industries')
              .orderBy('order', 'asc')
              .orderBy('createTime', 'desc')
              .get()
            console.log('行业列表查询结果:', result.data.length, '条')
            return { success: true, list: result.data }
          }
          case 'add': {
            const { name, order = 0, status = 'enabled' } = opData || {}
            if (!name) return { success: false, error: '请输入行业名称' }
            const exist = await db.collection('industries').where({ name }).count()
            if (exist.total > 0) return { success: false, error: '行业名称已存在' }
            const result = await db.collection('industries').add({
              data: { name, order, status, createTime: new Date() }
            })
            return { success: true, id: result._id }
          }
          case 'update': {
            const { id, name, order, status } = opData || {}
            if (!id) return { success: false, error: '缺少ID' }
            if (!name) return { success: false, error: '请输入行业名称' }
            await db.collection('industries').doc(id).update({ data: { name, order, status } })
            return { success: true }
          }
          case 'delete': {
            const { id } = opData || {}
            if (!id) return { success: false, error: '缺少ID' }
            await db.collection('industries').doc(id).remove()
            return { success: true }
          }
          default:
            return { success: false, error: `未知操作: ${op}` }
        }
      }

      // ============ 分类管理 ============
      case 'admincategory': {
        const { action: op, data: opData } = data || {}
        console.log('admincategory op:', op, 'opData:', opData)
        switch (op) {
          case 'list': {
            const result = await db.collection('categories')
              .orderBy('level', 'asc')
              .orderBy('order', 'asc')
              .orderBy('createTime', 'desc')
              .get()
            console.log('分类列表查询结果:', result.data.length, '条')
            return { success: true, list: result.data }
          }
          case 'add': {
            const { name, level = 1, parentId = null, order = 0, status = 'enabled' } = opData || {}
            if (!name) return { success: false, error: '请输入分类名称' }
            const result = await db.collection('categories').add({
              data: { name, level, parentId, order, status, createTime: new Date() }
            })
            return { success: true, id: result._id }
          }
          case 'update': {
            const { id, name, order, status } = opData || {}
            if (!id) return { success: false, error: '缺少ID' }
            if (!name) return { success: false, error: '请输入分类名称' }
            await db.collection('categories').doc(id).update({ data: { name, order, status } })
            return { success: true }
          }
          case 'delete': {
            const { id } = opData || {}
            if (!id) return { success: false, error: '缺少ID' }
            // 检查是否有子分类
            const children = await db.collection('categories').where({ parentId: id }).count()
            if (children.total > 0) return { success: false, error: '请先删除子分类' }
            await db.collection('categories').doc(id).remove()
            return { success: true }
          }
          default:
            return { success: false, error: `未知操作: ${op}` }
        }
      }

      // ============ 文章管理 ============
      case 'adminarticle': {
        const { action: op, data: opData } = data || {}
        console.log('adminarticle op:', op, 'opData:', opData)
        switch (op) {
          case 'list': {
            const { page = 1, pageSize = 20, keyword, status } = opData || {}
            let query = db.collection('articles')
            if (keyword) {
              query = query.where({ title: db.RegExp({ regexp: keyword, options: 'i' }) })
            }
            if (status !== undefined && status !== '') {
              query = query.where({ status })
            }
            const countResult = await query.count()
            const total = countResult.total
            const skip = (page - 1) * pageSize
            const result = await query
              .orderBy('createTime', 'desc')
              .skip(skip)
              .limit(pageSize)
              .get()
            return { success: true, list: result.data, total, page, pageSize }
          }
          case 'add': {
            const { title, path, content = '', status = 'enabled' } = opData || {}
            if (!title) return { success: false, error: '请输入文章标题' }
            // 路径可选，不提供则自动生成
            const finalPath = path || ''
            const insertData = { title, content, status, createTime: new Date(), updateTime: new Date() }
            if (finalPath) {
              insertData.path = finalPath
              // 检查路径唯一性（仅当提供了路径时才检查）
              const exist = await db.collection('articles').where({ path: finalPath }).count()
              if (exist.total > 0) return { success: false, error: '页面路径已存在' }
            }
            const result = await db.collection('articles').add({
              data: insertData
            })
            return { success: true, id: result._id }
          }
          case 'update': {
            const { id, title, path, content, status } = opData || {}
            if (!id) return { success: false, error: '缺少ID' }
            if (!title) return { success: false, error: '请输入文章标题' }
            // 路径可选更新
            const updateData = { title, content, status, updateTime: new Date() }
            if (path !== undefined) {
              updateData.path = path
            }
            await db.collection('articles').doc(id).update({
              data: updateData
            })
            return { success: true }
          }
          case 'delete': {
            const { id } = opData || {}
            if (!id) return { success: false, error: '缺少ID' }
            await db.collection('articles').doc(id).remove()
            return { success: true }
          }
          default:
            return { success: false, error: `未知操作: ${op}` }
        }
      }

      // ============ 模板管理 ============
      case 'admintemplate': {
        console.log('admintemplate 处理, data:', JSON.stringify(data))
        const { action: op, data: opData } = data || {}
        console.log('admintemplate op:', op, 'opData:', JSON.stringify(opData))
        
        switch (op) {
          case 'list': {
            console.log('list case, opData:', JSON.stringify(opData))
            const { page = 1, pageSize = 20, keyword, templateType, status, category1 } = opData || {}
            let query = db.collection('templates')
            // 注意：模板表字段名是 templateName 而不是 name
            if (keyword) {
              query = query.where({ templateName: db.RegExp({ regexp: keyword, options: 'i' }) })
            }
            if (templateType) query = query.where({ templateType })
            if (status !== undefined && status !== '') query = query.where({ status })
            if (category1) query = query.where({ category1 })
            const countResult = await query.count()
            const total = countResult.total
            const skip = (page - 1) * pageSize
            const result = await query
              .orderBy('createTime', 'desc')
              .skip(skip)
              .limit(pageSize)
              .get()
            return { success: true, list: result.data, total, page, pageSize }
          }
          case 'detail': {
            const { id } = opData || {}
            if (!id) return { success: false, error: '缺少ID' }
            const result = await db.collection('templates').doc(id).get()
            if (result.data.length === 0) return { success: false, error: '模板不存在' }
            return { success: true, data: result.data[0] }
          }
          case 'add': {
            console.log('add case, opData:', JSON.stringify(opData))
            // add 接口传入的 data 是扁平结构，直接用 opData
            const data = opData || {}
            console.log('add case 解构后的 data:', JSON.stringify(data))
            const { 
              templateName, templateType, templateDesc = '', category1 = '', category2 = '',
              tags = [], prompt = '', thumbnail = '', originalImage = '', status = 'enabled',
              industry = []
            } = data
            if (!templateName) return { success: false, error: '请输入模板名称' }
            if (!templateType) return { success: false, error: '请选择模板类型' }
            const result = await db.collection('templates').add({
              data: {
                templateName, templateType, templateDesc, category1, category2,
                tags, prompt, thumbnail, originalImage, status, industry,
                createTime: new Date(), updateTime: new Date()
              }
            })
            return { success: true, id: result._id }
          }
          case 'update': {
            const data = opData || {}
            const { id, ...updateData } = data
            if (!id) return { success: false, error: '缺少ID' }
            delete updateData._id
            updateData.updateTime = new Date()
            await db.collection('templates').doc(id).update({ data: updateData })
            return { success: true }
          }
          case 'delete': {
            const { id } = opData || {}
            if (!id) return { success: false, error: '缺少ID' }
            await db.collection('templates').doc(id).remove()
            return { success: true }
          }
          default:
            return { success: false, error: `未知操作: ${op}` }
        }
      }

      // 上传图片
      case 'adminuploadimage': {
        const { file, filename } = data || {}
        console.log('上传图片: filename=', filename, 'file长度=', file ? file.length : 0)
        
        if (!file) {
          console.log('错误: file为空')
          return { success: false, error: '文件内容不能为空' }
        }

        try {
          // 解码 base64 文件内容
          const buffer = Buffer.from(file, 'base64')
          console.log('buffer大小:', buffer.length)

          // 生成文件名
          const ext = filename?.split('.').pop() || 'jpg'
          const key = `function-images/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`

          // 上传到云存储
          const uploadResult = await cloud.uploadFile({
            cloudPath: key,
            fileContent: buffer
          })
          console.log('上传成功: fileID=', uploadResult.fileID)

          // 获取文件访问链接
          const getUrlResult = await cloud.getTempFileURL({
            fileList: [uploadResult.fileID]
          })

          return {
            success: true,
            fileID: uploadResult.fileID,
            url: getUrlResult.fileList[0]?.tempFileURL || ''
          }
        } catch (err) {
          console.error('上传图片失败:', err)
          return { success: false, error: err.message || '上传失败' }
        }
      }

      default:
        return { success: false, error: `未知操作: ${action}` }
    }
  } catch (err) {
    console.error('adminproxy 错误:', err)
    return { success: false, error: err.message || '服务器错误' }
  }
}
