const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const COS = require('cos-nodejs-sdk-v5')

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

// 兼容格式化和日期对象
function formatTime(time) {
  if (!time) return '-'
  const date = time instanceof Date ? time : new Date(time)
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

  // 验证管理员 token（登录、初始化管理员、首页客户端获取、COS签名生成、行业列表获取不需要）
  const isPublicAction = action === 'login' || action === 'initadmin' || 
    (action === 'adminhomeconfig' && data?.action === 'getClient') ||
    action === 'generateCosSignature' ||
    action === 'getIndustries'
  
  if (!isPublicAction) {
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
      // 生成COS上传签名（无需登录）- 返回预签名URL
      case 'generateCosSignature': {
        const crypto = require('crypto')
        const bucket = process.env.COS_BUCKET || '6c69-liandaofutou-2gdayw0068d938b3-1417102114'
        const region = process.env.COS_REGION || 'ap-shanghai'
        const secretId = process.env.TENCENT_SECRET_ID || ''
        const secretKey = process.env.TENCENT_SECRET_KEY || ''

        if (!secretId || !secretKey) {
          return { success: false, error: 'COS凭证未配置' }
        }

        // 生成唯一文件名
        const cosPath = `articles/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.jpg`

        // 使用 COS SDK 生成预签名 URL
        const cos = new COS({
          SecretId: secretId,
          SecretKey: secretKey
        })

        const uploadUrl = cos.getObjectUrl({
          Bucket: bucket,
          Region: region,
          Key: cosPath,
          Method: 'PUT',
          Expires: 1800, // 30分钟
          Sign: true
        })

        return {
          success: true,
          data: {
            uploadUrl,
            cosPath,
            bucket,
            region,
            url: `https://${bucket}.cos.${region}.myqcloud.com/${cosPath}`,
            expires: Math.floor(Date.now() / 1000) + 1800
          }
        }
      }

      // 获取行业列表（无需登录）
      case 'getIndustries': {
        const result = await db.collection('industries')
          .where({ status: 'enabled' })
          .orderBy('order', 'asc')
          .get()
        return { success: true, list: result.data }
      }

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

      // ============ 初始化数据库集合 ============
      case 'initCollections': {
        const requiredCollections = [
          'recharge_configs',
          'generate_sizes',
          'industries',
          'categories',
          'articles',
          'workflow_functions',
          'workflow_products'
        ]
        
        const results = []
        for (const collName of requiredCollections) {
          try {
            // 检查集合是否存在
            const count = await db.collection(collName).count()
            results.push({ name: collName, status: 'exists' })
          } catch (e) {
            // 集合不存在，创建它
            try {
              await db.createCollection(collName)
              results.push({ name: collName, status: 'created' })
            } catch (createErr) {
              results.push({ name: collName, status: 'error', error: createErr.message })
            }
          }
        }
        
        return { success: true, results }
      }

      // 获取用户列表（企业+个人）
      case 'admingetusers': {
        const { page = 1, pageSize = 20, userId, phone, userType, enterpriseName, includeStats } = data || {}
        
        let list = []
        let total = 0
        
        if (userType === 'personal') {
          // 个人用户：手机号模糊匹配
          let query = db.collection('users')
          
          if (phone) {
            query = query.where({ phone: db.RegExp({ regexp: phone, options: 'i' }) })
          }
          
          const countResult = await query.count()
          total = countResult.total
          
          const skip = (page - 1) * pageSize
          const listResult = await query
            .orderBy('create_time', 'desc')
            .skip(skip)
            .limit(pageSize)
            .get()
          list = listResult.data || []
          
        } else if (userType === 'enterprise') {
          // 企业用户：名称模糊匹配 company_name 和 company_short_name
          const enterpriseQuery = db.collection('enterprises')
          
          // 构建查询条件
          let query = enterpriseQuery
          if (enterpriseName) {
            // 有名称时，OR 匹配全称或简称
            query = query.where(
              db.command.or(
                { company_name: db.RegExp({ regexp: enterpriseName, options: 'i' }) },
                { company_short_name: db.RegExp({ regexp: enterpriseName, options: 'i' }) }
              )
            )
          }
          // 无名称时，查询所有企业
          
          const countResult = await query.count()
          total = countResult.total
          
          const skip = (page - 1) * pageSize
          const listResult = await query
            .orderBy('create_time', 'desc')
            .skip(skip)
            .limit(pageSize)
            .get()
          list = listResult.data || []
        }
        
        // 企业用户：关联管理员手机号（通过 admin_user_id 查询 users 表）
        if (userType === 'enterprise' && list.length > 0) {
          const adminUserIds = list.map(e => e.admin_user_id).filter(Boolean)
          if (adminUserIds.length > 0) {
            try {
              const usersResult = await db.collection('users')
                .where({
                  user_id: db.command.in(adminUserIds)
                })
                .field({ user_id: true, phone: true })
                .get()
              
              const phoneMap = {}
              usersResult.data.forEach(u => {
                phoneMap[u.user_id] = u.phone
              })
              
              list = list.map(item => ({
                ...item,
                phone: phoneMap[item.admin_user_id] || item.admin_phone || ''
              }))
            } catch (e) {
              console.log('查询管理员手机号失败:', e.message)
            }
          }
        }
        
        // 补充子账号统计（仅企业用户，从 enterprise_sub_accounts 表查询）
        if (userType === 'enterprise' && includeStats !== false) {
          const enterpriseIds = list.map(e => e._id).filter(Boolean)
          if (enterpriseIds.length > 0) {
            try {
              const subAccountsResult = await db.collection('enterprise_sub_accounts')
                .where({
                  enterprise_id: db.command.in(enterpriseIds)
                })
                .field({ enterprise_id: true, balance: true })
                .get()
              
              const subAccountMap = {}
              subAccountsResult.data.forEach(sub => {
                if (!subAccountMap[sub.enterprise_id]) {
                  subAccountMap[sub.enterprise_id] = []
                }
                subAccountMap[sub.enterprise_id].push({
                  phone: sub.phone,
                  balance: sub.balance || 0
                })
              })
              
              list = list.map(item => ({
                ...item,
                subAccountCount: subAccountMap[item._id]?.length || 0,
                subAccounts: subAccountMap[item._id] || []
              }))
            } catch (e) {
              console.log('查询子账号失败:', e.message)
              // 集合不存在时返回空统计
              list = list.map(item => ({
                ...item,
                subAccountCount: 0,
                subAccounts: []
              }))
            }
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

      // ============ 充值配置管理 ============
      case 'adminRechargeConfig': {
        const { action: op, data: opData } = data || {}
        console.log('adminRechargeConfig op:', op, 'opData:', opData)
        switch (op) {
          case 'list': {
            const { page = 1, pageSize = 20 } = opData || {}
            let query = db.collection('recharge_configs')
            const countResult = await query.count()
            const total = countResult.total
            const skip = (page - 1) * pageSize
            const result = await query
              .orderBy('amount', 'asc')
              .skip(skip)
              .limit(pageSize)
              .get()
            return { success: true, list: result.data, total, page, pageSize }
          }
          case 'add': {
            const { amount, bonus = 0, enabled = true } = opData || {}
            if (!amount || amount <= 0) return { success: false, error: '请输入正确的充值金额' }
            const result = await db.collection('recharge_configs').add({
              data: { amount, bonus, enabled, createTime: new Date(), updateTime: new Date() }
            })
            return { success: true, id: result._id }
          }
          case 'update': {
            const { id, amount, bonus, enabled } = opData || {}
            if (!id) return { success: false, error: '缺少ID' }
            const updateData = { updateTime: new Date() }
            if (amount !== undefined) updateData.amount = amount
            if (bonus !== undefined) updateData.bonus = bonus
            if (enabled !== undefined) updateData.enabled = enabled
            await db.collection('recharge_configs').doc(id).update({ data: updateData })
            return { success: true }
          }
          case 'delete': {
            const { id } = opData || {}
            if (!id) return { success: false, error: '缺少ID' }
            await db.collection('recharge_configs').doc(id).remove()
            return { success: true }
          }
          case 'toggle': {
            const { id, enabled } = opData || {}
            if (!id) return { success: false, error: '缺少ID' }
            await db.collection('recharge_configs').doc(id).update({
              data: { enabled, updateTime: new Date() }
            })
            return { success: true }
          }
          default:
            return { success: false, error: `未知操作: ${op}` }
        }
      }

      // 获取素材列表
      case 'admingetmaterials': {
        const { page = 1, pageSize = 20, phone, userType, category1Id, category2Id, keyword } = data || {}
        
        // 如果提供了手机号，先查询用户
        let targetUserId
        if (phone) {
          const userResult = await db.collection('users').where({ 
            phone: db.RegExp({ regexp: phone, options: 'i' }) 
          }).get()
          if (userResult.data && userResult.data.length > 0) {
            targetUserId = userResult.data[0].user_id
          }
        }
        
        // 构建查询条件（累积 where）
        let query = db.collection('materials')
        const conditions = {}
        
        if (targetUserId) {
          conditions.user_id = targetUserId
        }
        if (userType) {
          conditions.user_type = userType
        }
        if (category1Id) {
          conditions.category1_id = category1Id
        }
        if (category2Id) {
          conditions.category2_id = category2Id
        }
        if (keyword) {
          conditions.title = db.RegExp({ regexp: keyword, options: 'i' })
        }
        
        if (Object.keys(conditions).length > 0) {
          query = query.where(conditions)
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
        
        // 转换 cloud:// URL 为临时链接
        const cloudUrls = list.flatMap(item => [item.url, item.thumbnail_url].filter(url => url && url.startsWith('cloud://')))
        const uniqueCloudUrls = [...new Set(cloudUrls)]
        
        const urlMap = {}
        if (uniqueCloudUrls.length > 0) {
          try {
            const urlResult = await cloud.getTempFileURL({
              fileList: uniqueCloudUrls
            })
            if (urlResult.fileList) {
              urlResult.fileList.forEach(item => {
                if (item.tempFileURL) {
                  urlMap[item.fileID] = item.tempFileURL
                }
              })
            }
          } catch (err) {
            console.error('转换临时链接失败:', err)
          }
        }
        
        // 关联用户信息（手机号和企业名称）
        const userIds = [...new Set(list.map(item => item.user_id).filter(Boolean))]
        if (userIds.length > 0) {
          // 查询 users 表（用 _id 字段，users 表的主键是 _id）
          const usersResult = await db.collection('users')
            .where({
              _id: db.command.in(userIds)
            })
            .field({ _id: true, phone: true, user_type: true })
            .get()
          
          // 查询 enterprises 表
          const enterprisesResult = await db.collection('enterprises')
            .where({ admin_user_id: db.command.in(userIds) })
            .field({ admin_user_id: true, company_name: true, company_short_name: true })
            .get()
          
          // 构建企业信息映射
          const enterpriseMap = {}
          enterprisesResult.data.forEach(e => {
            enterpriseMap[e.admin_user_id] = {
              company_name: e.company_name || '',
              company_short_name: e.company_short_name || e.company_name || ''
            }
          })
          
          // 构建用户信息映射（users 表的主键是 _id）
          const userMap = {}
          usersResult.data.forEach(u => {
            userMap[u._id] = {
              phone: u.phone || '-',
              user_type: u.user_type || 'personal'
            }
          })
          
          list = list.map(item => {
            const enterpriseInfo = enterpriseMap[item.user_id]
            const userInfo = userMap[item.user_id]
            
            // 判断用户是否有企业身份（用于显示企业信息）
            const hasEnterprise = !!enterpriseInfo
            const phone = userInfo?.phone || '-'
            const companyName = enterpriseInfo?.company_name || ''
            const companyShortName = enterpriseInfo?.company_short_name || ''
            
            // 素材的 user_type 保持原值，不被企业记录覆盖
            // 因为同一个用户可能既是个人用户也是企业管理员，上传素材时已区分了 user_type
            const materialUserType = item.user_type || 'personal'
            
            // 转换 cloud:// URL
            const url = item.url && urlMap[item.url] ? urlMap[item.url] : item.url
            const thumbnail_url = item.thumbnail_url && urlMap[item.thumbnail_url] ? urlMap[item.thumbnail_url] : item.thumbnail_url
            
            return {
              ...item,
              url,
              thumbnail_url,
              user_phone: phone,
              user_type: materialUserType,  // 保持素材原有的 user_type
              company_name: companyName,
              company_short_name: companyShortName
            }
          })
        }
        
        // 关联分类名称（分类属于各自企业或个人用户）
        // 收集所有需要查询的user_id和分类id组合
        const category1Ids = [...new Set(list.map(item => item.category1_id).filter(Boolean))]
        const category2Ids = [...new Set(list.map(item => item.category2_id).filter(Boolean))]
        
        // 按user_id分组查询各自的分类
        const userCategoryMap = {}
        for (const userId of userIds) {
          const userType = list.find(item => item.user_id === userId)?.user_type || 'personal'
          const catResult = await db.collection('user_material_categories')
            .where({ 
              user_id: userId,
              user_type: userType,
              _id: db.command.in([...category1Ids, ...category2Ids].filter(Boolean))
            })
            .field({ _id: true, name: true })
            .get()
          
          catResult.data.forEach(c => {
            userCategoryMap[`${userId}_${c._id}`] = c.name
          })
        }
        
        list = list.map(item => ({
          ...item,
          category1_name: item.category1_id ? (userCategoryMap[`${item.user_id}_${item.category1_id}`] || '') : '',
          category2_name: item.category2_id ? (userCategoryMap[`${item.user_id}_${item.category2_id}`] || '') : ''
        }))
        
        return {
          success: true,
          data: list,
          total,
          page,
          pageSize
        }
      }

      // 添加素材
      case 'adminaddmaterial': {
        const { title, content, type, url, user_id, user_type, category1_id, category2_id, enterprise_id } = data || {}
        
        if (!title) {
          return { success: false, error: '素材标题不能为空' }
        }
        
        // 如果是企业素材且没有传入 enterprise_id，通过 user_id 查询企业
        let finalEnterpriseId = enterprise_id
        if (user_type === 'enterprise' && !finalEnterpriseId && user_id) {
          try {
            const entRes = await db.collection('enterprises')
              .where({ admin_user_id: user_id })
              .limit(1)
              .get()
            if (entRes.data && entRes.data.length > 0) {
              finalEnterpriseId = entRes.data[0]._id
            }
          } catch (e) {
            console.log('查询企业失败:', e.message)
          }
        }
        
        const result = await db.collection('materials').add({
          data: {
            title: title || content?.name || '未命名素材',
            content: content || '',
            type: type || 'image',
            url: url || '',
            thumbnail_url: url || '',
            user_id: user_id || '',
            user_type: user_type || 'personal',
            enterprise_id: finalEnterpriseId || '',
            // 兼容小程序字段
            owner_id: user_id || '',
            owner_type: user_type || 'personal',
            category1_id: category1_id || null,
            category2_id: category2_id || null,
            create_time: new Date(),
            update_time: new Date()
          }
        })
        
        return { success: true, id: result.id }
      }
      
      // 批量添加素材
      case 'adminbatchaddmaterials': {
        const { items, user_id, user_type, category1_id, category2_id, enterprise_id } = data || {}
        
        if (!items || items.length === 0) {
          return { success: false, error: '没有要上传的素材' }
        }
        if (!user_id) {
          return { success: false, error: '请选择目标用户' }
        }
        
        // 如果是企业素材且没有传入 enterprise_id，通过 user_id 查询企业
        let finalEnterpriseId = enterprise_id
        if (user_type === 'enterprise' && !finalEnterpriseId && user_id) {
          try {
            const entRes = await db.collection('enterprises')
              .where({ admin_user_id: user_id })
              .limit(1)
              .get()
            if (entRes.data && entRes.data.length > 0) {
              finalEnterpriseId = entRes.data[0]._id
            }
          } catch (e) {
            console.log('查询企业失败:', e.message)
          }
        }
        
        const addPromises = items.map(item => 
          db.collection('materials').add({
            data: {
              title: item.title || item.name || '未命名素材',
              content: item.content || '',
              type: item.type || 'image',
              url: item.url || '',              // 原始大图URL（用于coze工作流）
              thumbnail_url: item.thumbnail_url || item.url || '',  // 压缩小图URL（用于小程序列表）
              size: item.size || 0,
              user_id,
              user_type: user_type || 'personal',
              enterprise_id: finalEnterpriseId || '',
              // 兼容小程序字段
              owner_id: user_id,
              owner_type: user_type || 'personal',
              category1_id: category1_id || null,
              category2_id: category2_id || null,
              create_time: new Date(),
              update_time: new Date()
            }
          })
        )
        
        await Promise.all(addPromises)
        
        return { success: true, count: items.length }
      }
      
      // 更新素材
      case 'adminupdatematerial': {
        const { id, title, category1_id, category2_id } = data || {}
        
        if (!id) {
          return { success: false, error: '素材ID不能为空' }
        }
        
        const updateData = { update_time: new Date() }
        if (title !== undefined) updateData.title = title
        if (category1_id !== undefined) updateData.category1_id = category1_id
        if (category2_id !== undefined) updateData.category2_id = category2_id
        
        await db.collection('materials').doc(id).update({ data: updateData })
        
        return { success: true }
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

      // 批量删除素材
      case 'adminbatchdeletematerials': {
        const { ids } = data || {}
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          return { success: false, error: '请选择要删除的素材' }
        }
        
        // 逐个删除
        for (const id of ids) {
          await db.collection('materials').doc(id).remove()
        }
        
        return { success: true, deleted: ids.length }
      }

      // ============ 用户素材分类管理 ============
      
      // 获取用户素材分类列表
      case 'admingetusermaterials': {
        const { userType, userId, phone } = data || {}
        
        // 如果提供了手机号，先查询用户
        let targetUserId = userId
        if (phone && !targetUserId) {
          const userWhere = { phone: db.RegExp({ regexp: phone, options: 'i' }) }
          if (userType) {
            userWhere.user_type = userType
          }
          const userResult = await db.collection('users').where(userWhere).get()
          if (userResult.data && userResult.data.length > 0) {
            targetUserId = userResult.data[0].user_id || userResult.data[0]._id
          }
        }
        
        // 获取用户的分类
        let query = db.collection('user_material_categories')
        const where = {}
        if (targetUserId) {
          where.user_id = targetUserId
        }
        if (userType) {
          where.user_type = userType
        }
        if (Object.keys(where).length > 0) {
          query = query.where(where)
        }
        
        const result = await query.orderBy('level', 'asc').orderBy('order', 'asc').get()
        
        return {
          success: true,
          data: result.data || []
        }
      }
      
      // 创建/更新用户素材分类
      case 'adminupsertusermaterialcategory': {
        const { id, userId, userType, name, level, parent_id, order = 0, enterprise_id } = data || {}
        const user_id = userId  // 兼容两种参数名
        
        if (!name) {
          return { success: false, error: '分类名称不能为空' }
        }
        if (!user_id) {
          return { success: false, error: '用户ID不能为空' }
        }
        
        // 如果是企业分类，自动获取 enterprise_id
        let finalEnterpriseId = enterprise_id || ''
        if ((userType === 'enterprise' || userType === 'subaccount') && !finalEnterpriseId && user_id) {
          try {
            const entRes = await db.collection('enterprises')
              .where({ admin_user_id: user_id })
              .limit(1)
              .get()
            if (entRes.data && entRes.data.length > 0) {
              finalEnterpriseId = entRes.data[0]._id
            }
          } catch (e) {
            console.log('查询企业失败:', e.message)
          }
        }
        
        if (id) {
          // 更新
          const updateData = { name, order: parseInt(order) || 0 }
          if (finalEnterpriseId) updateData.enterprise_id = finalEnterpriseId
          await db.collection('user_material_categories').doc(id).update({
            data: updateData
          })
          return { success: true }
        } else {
          // 创建
          const addData = {
            user_id,
            user_type: userType || 'personal',
            name,
            level: parseInt(level) || 1,
            parent_id: level == 2 ? parent_id : null,
            order: parseInt(order) || 0,
            create_time: new Date()
          }
          if (finalEnterpriseId) addData.enterprise_id = finalEnterpriseId
          const result = await db.collection('user_material_categories').add({
            data: addData
          })
          return { success: true, id: result.id }
        }
      }
      
      // 删除用户素材分类
      case 'admindeleteusermaterialcategory': {
        const { id } = data || {}
        if (!id) {
          return { success: false, error: '分类ID不能为空' }
        }
        
        // 先删除该分类下的子分类
        await db.collection('user_material_categories').where({ parent_id: id }).remove()
        // 再删除该分类
        await db.collection('user_material_categories').doc(id).remove()
        
        return { success: true }
      }
      
      // ============ 用户管理（手机号查询） ============
      
      // 根据手机号查询用户
      case 'admingetusertypes': {
        // 返回用户类型列表用于筛选
        return {
          success: true,
          data: [
            { value: 'personal', label: '个人用户' },
            { value: 'enterprise', label: '企业用户' }
          ]
        }
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
        const { name, cozeWorkflowId, cozeWorkflowName, fixedFieldMappings, inputFields, outputFields, flowSteps, sort = 0 } = data || {}
        
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
            fixed_field_mappings: fixedFieldMappings || [],
            input_fields: inputFields || [],
            output_fields: outputFields || [],
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
        const { id, name, cozeWorkflowId, cozeWorkflowName, fixedFieldMappings, inputFields, outputFields, flowSteps, isActive, sort } = data || {}
        
        if (!id) {
          return { success: false, error: '产品ID不能为空' }
        }
        
        const updateData = { updated_at: new Date() }
        
        if (name !== undefined) updateData.name = name
        if (cozeWorkflowId !== undefined) updateData.coze_workflow_id = cozeWorkflowId
        if (cozeWorkflowName !== undefined) updateData.coze_workflow_name = cozeWorkflowName
        if (fixedFieldMappings !== undefined) updateData.fixed_field_mappings = fixedFieldMappings
        if (inputFields !== undefined) updateData.input_fields = inputFields
        if (outputFields !== undefined) updateData.output_fields = outputFields
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
        const { category, name, description, sizeValue, exampleImage, sort = 0, isEnabled = true } = data || {}

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
            example_image: exampleImage || '',
            sort: sort || 0,
            is_enabled: isEnabled,
            created_at: new Date(),
            updated_at: new Date()
          }
        })

        return { success: true, id: result.id }
      }

      // 更新尺寸
      case 'updategeneratesize': {
        const { id, category, name, description, sizeValue, exampleImage, sort, isEnabled } = data || {}

        if (!id) {
          return { success: false, error: '尺寸ID不能为空' }
        }

        const updateData = { updated_at: new Date() }

        if (category !== undefined) updateData.category = category
        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description
        if (sizeValue !== undefined) updateData.size_value = sizeValue
        if (exampleImage !== undefined) updateData.example_image = exampleImage
        if (sort !== undefined) updateData.sort = sort
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
            const { page = 1, pageSize = 20, keyword, templateType, status, recommendHome, category1 } = opData || {}
            let query = db.collection('templates')
            // 注意：模板表字段名是 templateName 而不是 name
            if (keyword) {
              query = query.where({ templateName: db.RegExp({ regexp: keyword, options: 'i' }) })
            }
            if (templateType) query = query.where({ templateType })
            if (status !== undefined && status !== '') query = query.where({ status })
            if (recommendHome === 'true') query = query.where({ recommendHome: true })
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
            
            // 生成模板编号：图片类型从 10001 开始，视频类型从 20001 开始
            const prefix = templateType === 'image' ? 10001 : 20001
            let templateCode = prefix
            
            // 统计该类型已有多少条
            const countResult = await db.collection('templates')
              .where({ templateType })
              .count()
            
            if (countResult.total > 0) {
              const allTemplates = await db.collection('templates')
                .where({ templateType })
                .field({ templateCode: true })
                .limit(countResult.total)
                .get()
              
              let maxCode = prefix - 1
              for (const item of allTemplates.data) {
                if (item.templateCode !== undefined && item.templateCode !== null) {
                  const code = Number(item.templateCode)
                  if (!isNaN(code) && code >= prefix) {
                    maxCode = code
                  }
                }
              }
              templateCode = maxCode + 1
            }
            
            const result = await db.collection('templates').add({
              data: {
                templateName, templateType, templateDesc, category1, category2,
                tags, prompt, thumbnail, originalImage, status, industry,
                templateCode,
                createTime: new Date(), updateTime: new Date()
              }
            })
            return { success: true, id: result._id, templateCode }
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

      // ============ 首页配置 ============
      case 'adminhomeconfig': {
        const { action: homeAction, data: homeData = {} } = data || {}
        
        // 组件类型映射
        const COMPONENT_TYPES = {
          userInfo: { name: '用户信息' },
          banner: { name: '轮播图' },
          iconGrid: { name: '金刚区' },
          imageGrid: { name: '图片网格' },
          waterfall: { name: '瀑布流' }
        }
        
        // 确保集合存在
        try {
          await db.createCollection('home_configs')
        } catch (e) {
          // 集合已存在或创建失败，忽略
        }
        
        switch (homeAction) {
          case 'list': {
            const { page = 1, pageSize = 50 } = homeData
            const result = await db.collection('home_configs')
              .orderBy('order', 'asc')
              .skip((page - 1) * pageSize)
              .limit(pageSize)
              .get()
            
            const list = result.data.map(item => ({
              ...item,
              typeName: COMPONENT_TYPES[item.componentType]?.name || item.componentType,
              itemsCount: item.items?.length || 0
            }))
            
            const countResult = await db.collection('home_configs').count()
            return { success: true, list, total: countResult.total }
          }
          
          case 'add': {
            const { componentType, title = '', params = {}, items = [], enabled = true } = homeData
            
            if (!componentType || !COMPONENT_TYPES[componentType]) {
              return { success: false, error: '请选择组件类型' }
            }
            
            const maxOrder = await db.collection('home_configs')
              .orderBy('order', 'desc')
              .limit(1)
              .get()
            
            const order = maxOrder.data.length > 0 ? (maxOrder.data[0].order || 0) + 1 : 1
            
            const result = await db.collection('home_configs').add({
              data: {
                componentType, title, params, items, enabled, order,
                createTime: new Date(), updateTime: new Date()
              }
            })
            
            return { success: true, id: result._id }
          }
          
          case 'update': {
            const { id, ...updateData } = homeData
            if (!id) return { success: false, error: '缺少配置ID' }
            
            delete updateData._id
            delete updateData.createTime
            
            await db.collection('home_configs').doc(id).update({
              data: { ...updateData, updateTime: new Date() }
            })
            
            return { success: true }
          }
          
          case 'delete': {
            const { id } = homeData
            if (!id) return { success: false, error: '缺少配置ID' }
            await db.collection('home_configs').doc(id).remove()
            return { success: true }
          }
          
          case 'updateOrder': {
            const { orders } = homeData
            if (!Array.isArray(orders)) return { success: false, error: '参数格式错误' }
            
            for (const item of orders) {
              await db.collection('home_configs').doc(item.id).update({
                data: { order: item.order, updateTime: new Date() }
              })
            }
            return { success: true }
          }
          
          case 'getClient': {
            const result = await db.collection('home_configs')
              .where({ enabled: true })
              .orderBy('order', 'asc')
              .get()
            
            // 处理瀑布流组件
            for (const item of result.data) {
              if (item.componentType === 'waterfall') {
                const templates = await db.collection('templates')
                  .where({ status: 'enabled', recommendHome: true })
                  .limit(20)
                  .orderBy('updateTime', 'desc')
                  .get()
                
                // 关联查询功能名称
                const funcIds = [...new Set(templates.data.map(t => t.functionId).filter(Boolean))]
                const funcMap = {}
                if (funcIds.length > 0) {
                  const funcs = await db.collection('workflow_functions')
                    .where({ _id: db.command.in(funcIds) })
                    .field({ _id: true, name: true })
                    .get()
                  funcs.data.forEach(f => { funcMap[f._id] = f.name })
                }
                
                item.templates = templates.data.map(t => ({
                  ...t,
                  functionName: funcMap[t.functionId] || ''
                }))
              }
            }
            
            return { success: true, data: result.data }
          }
          
          default:
            return { success: false, error: `未知操作: ${homeAction}` }
        }
      }

      // 上传图片（使用COS永久链接）
      case 'adminuploadimage': {
        const crypto = require('crypto')
        const https = require('https')

        const { file, filename } = data || {}
        console.log('上传图片: filename=', filename, 'file长度=', file ? file.length : 0)

        if (!file) {
          console.log('错误: file为空')
          return { success: false, error: '文件内容不能为空' }
        }

        // 从环境变量获取 COS 配置
        const bucket = process.env.COS_BUCKET || '6c69-liandaofutou-2gdayw0068d938b3-1417102114'
        const region = process.env.COS_REGION || 'ap-shanghai'
        const secretId = process.env.TENCENT_SECRET_ID || ''
        const secretKey = process.env.TENCENT_SECRET_KEY || ''

        if (!secretId || !secretKey) {
          console.error('COS凭证未配置')
          return { success: false, error: 'COS凭证未配置，请联系管理员' }
        }

        try {
          // 解码 base64 文件内容
          let base64Data = file
          if (file.includes(',')) {
            base64Data = file.split(',')[1]
          }
          const buffer = Buffer.from(base64Data, 'base64')
          console.log('buffer大小:', buffer.length)

          // 检查文件大小：不超过5M
          const MAX_SIZE = 5 * 1024 * 1024  // 5MB
          if (buffer.length > MAX_SIZE) {
            console.log('错误: 文件超过5M限制')
            return { success: false, error: '文件大小不能超过5MB' }
          }

          // 生成唯一文件名
          const ext = filename?.split('.').pop() || 'jpg'
          const cosPath = `articles/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`

          // 计算签名过期时间（30分钟）
          const startTime = Math.floor(Date.now() / 1000)
          const expiredTime = startTime + 1800

          // TC3-HMAC-SHA256 签名算法
          const objectKey = cosPath
          const httpString = [
            'PUT',
            `/${objectKey}`,
            '',
            'content-type=image/jpeg',
            `host=${bucket}.cos.${region}.myqcloud.com`,
            ''
          ].join('\n')

          const signTime = `${startTime};${expiredTime}`
          const httpStringEncoded = crypto.createHash('sha256').update(httpString).digest('hex')
          const stringToSign = ['sha256', signTime, httpStringEncoded, ''].join('\n')

          const secretDate = crypto.createHmac('sha256', `cos3api ${startTime.toString().slice(0, 8)}`).update(secretKey).digest()
          const secretSign = crypto.createHmac('sha256', secretDate).update(stringToSign).digest('hex')
          const authorization = `q-sign-algorithm=sha256&q-ak=${secretId}&q-sign-time=${signTime}&q-key-time=${signTime}&q-header-list=content-type;host&q-url-param-list=&q-signature=${secretSign}`

          // 上传文件到 COS
          const uploadUrl = `https://${bucket}.cos.${region}.myqcloud.com/${objectKey}`

          // 同步上传到COS
          const uploadResult = await new Promise((resolve, reject) => {
            const urlObj = new URL(uploadUrl)
            const options = {
              hostname: urlObj.hostname,
              path: urlObj.pathname,
              method: 'PUT',
              headers: {
                'Authorization': authorization,
                'Content-Type': 'image/jpeg',
                'Content-Length': buffer.length,
                'Host': `${bucket}.cos.${region}.myqcloud.com`
              }
            }

            const req = https.request(options, (res) => {
              let responseData = ''
              res.on('data', chunk => responseData += chunk)
              res.on('end', () => {
                console.log('COS上传响应状态:', res.statusCode)
                if (res.statusCode === 200 || res.statusCode === 201) {
                  resolve({ success: true })
                } else {
                  reject(new Error(`上传失败: ${res.statusCode}`))
                }
              })
            })

            req.on('error', (err) => {
              reject(err)
            })

            req.write(buffer)
            req.end()
          })

          // 生成缩略图
          let thumbnailUrl = uploadUrl
          try {
            const sharp = require('sharp')
            const metadata = await sharp(buffer).metadata()
            console.log('图片元数据:', { width: metadata.width, height: metadata.height })

            const { width, height } = metadata
            let pipeline = sharp(buffer).jpeg({ quality: 70 })

            let thumbBuffer
            if (width >= height) {
              thumbBuffer = await pipeline.resize(250, null, { withoutEnlargement: true }).toBuffer()
            } else {
              thumbBuffer = await pipeline.resize(null, 250, { withoutEnlargement: true }).toBuffer()
            }

            // 上传缩略图到COS
            const thumbCosPath = `articles/thumbs/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.jpg`
            const thumbUploadUrl = `https://${bucket}.cos.${region}.myqcloud.com/${thumbCosPath}`

            // 生成缩略图签名
            const thumbHttpString = [
              'PUT',
              `/${thumbCosPath}`,
              '',
              'content-type=image/jpeg',
              `host=${bucket}.cos.${region}.myqcloud.com`,
              ''
            ].join('\n')
            const thumbHttpStringEncoded = crypto.createHash('sha256').update(thumbHttpString).digest('hex')
            const thumbStringToSign = ['sha256', signTime, thumbHttpStringEncoded, ''].join('\n')
            const thumbSecretDate = crypto.createHmac('sha256', `cos3api ${startTime.toString().slice(0, 8)}`).update(secretKey).digest()
            const thumbSecretSign = crypto.createHmac('sha256', thumbSecretDate).update(thumbStringToSign).digest('hex')
            const thumbAuth = `q-sign-algorithm=sha256&q-ak=${secretId}&q-sign-time=${signTime}&q-key-time=${signTime}&q-header-list=content-type;host&q-url-param-list=&q-signature=${thumbSecretSign}`

            await new Promise((resolve, reject) => {
              const urlObj = new URL(thumbUploadUrl)
              const options = {
                hostname: urlObj.hostname,
                path: urlObj.pathname,
                method: 'PUT',
                headers: {
                  'Authorization': thumbAuth,
                  'Content-Type': 'image/jpeg',
                  'Content-Length': thumbBuffer.length,
                  'Host': `${bucket}.cos.${region}.myqcloud.com`
                }
              }

              const req = https.request(options, (res) => {
                let responseData = ''
                res.on('data', chunk => responseData += chunk)
                res.on('end', () => {
                  if (res.statusCode === 200 || res.statusCode === 201) {
                    resolve({ success: true })
                  } else {
                    reject(new Error(`缩略图上传失败: ${res.statusCode}`))
                  }
                })
              })

              req.on('error', reject)
              req.write(thumbBuffer)
              req.end()
            })

            thumbnailUrl = thumbUploadUrl
            console.log('缩略图上传成功:', thumbnailUrl)
          } catch (sharpErr) {
            console.error('生成/上传缩略图失败:', sharpErr.message)
          }

          console.log('图片上传成功:', uploadUrl)
          return {
            success: true,
            url: uploadUrl,
            thumbnailUrl: thumbnailUrl,
            cosPath: cosPath
          }
        } catch (err) {
          console.error('上传图片失败:', err)
          return { success: false, error: err.message || '上传失败' }
        }
      }

      // 兼容：上传图片（新格式）
      case 'adminupload': {
        const { base64, path } = data || {}
        console.log('上传图片: path=', path, 'base64长度=', base64 ? base64.length : 0)
        
        if (!base64) {
          return { success: false, error: '文件内容不能为空' }
        }

        try {
          // 解码 base64 文件内容（处理 data:image/xxx;base64, 前缀）
          let base64Data = base64
          if (base64.includes(',')) {
            base64Data = base64.split(',')[1]
          }
          
          const buffer = Buffer.from(base64Data, 'base64')
          
          // 生成文件名
          const ext = path?.split('.').pop() || 'jpg'
          const filename = path || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`
          const key = filename.startsWith('/') ? filename.slice(1) : filename

          // 上传到云存储
          const uploadResult = await cloud.uploadFile({
            cloudPath: key,
            fileContent: buffer
          })

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

      // ============ 企业管理 ============

      // 获取企业详情
      case 'getenterprise': {
        const { id } = data || {}

        if (!id) {
          return { success: false, error: '企业ID不能为空' }
        }

        const result = await db.collection('enterprises').doc(id).get()

        if (result.data.length === 0) {
          return { success: false, error: '企业不存在' }
        }

        return {
          success: true,
          data: result.data[0]
        }
      }

      // 更新企业信息
      case 'updateenterprise': {
        const { id, company_name, company_short_name, industries, balance } = data || {}

        if (!id) {
          return { success: false, error: '企业ID不能为空' }
        }

        const updateData = { update_time: new Date() }

        if (company_name !== undefined) updateData.company_name = company_name
        if (company_short_name !== undefined) updateData.company_short_name = company_short_name
        if (industries !== undefined) updateData.industries = industries
        if (balance !== undefined) updateData.balance = balance

        await db.collection('enterprises').doc(id).update({ data: updateData })

        return { success: true }
      }

      // ============ 企业子账号管理 ============

      // 获取企业子账号列表
      case 'getsubaccounts': {
        const { enterpriseId } = data || {}

        if (!enterpriseId) {
          return { success: false, error: '企业ID不能为空' }
        }

        let result
        try {
          result = await db.collection('enterprise_sub_accounts')
            .where({ enterprise_id: enterpriseId })
            .orderBy('create_time', 'desc')
            .get()
        } catch (e) {
          console.log('查询子账号失败:', e.message)
          return { success: true, data: [] }
        }

        // 关联查询已激活用户的昵称
        const userIds = result.data
          .map(item => item.user_id)
          .filter(Boolean)

        let userMap = {}
        if (userIds.length > 0) {
          try {
            const users = await db.collection('users')
              .where({
                user_id: db.command.in(userIds)
              })
              .field({ user_id: true, nickname: true })
              .get()

            users.data.forEach(user => {
              userMap[user.user_id] = user.nickname || ''
            })
          } catch (e) {
            console.log('查询用户昵称失败:', e.message)
          }
        }

        const list = result.data.map(item => ({
          ...item,
          nickname: userMap[item.user_id] || ''
        }))

        return {
          success: true,
          data: list
        }
      }

      // 添加子账号
      case 'addsubaccount': {
        const { enterprise_id, phone, remark = '', balance = 0 } = data || {}

        if (!enterprise_id) {
          return { success: false, error: '企业ID不能为空' }
        }
        if (!phone) {
          return { success: false, error: '手机号不能为空' }
        }

        // 查询企业余额
        let enterpriseBalance = 0
        try {
          console.log('查询企业, enterprise_id:', enterprise_id)
          
          // 直接用 where 查询
          let enterpriseResult = await db.collection('enterprises')
            .where({ _id: enterprise_id })
            .get()
          console.log('查询结果数量:', enterpriseResult.data?.length || 0)
          
          if (enterpriseResult.data && enterpriseResult.data.length > 0) {
            const rawBalance = parseFloat(enterpriseResult.data[0].balance) || 0
            console.log('企业原始余额(数据库):', rawBalance, '类型:', typeof rawBalance)
            // 兼容处理：如果余额值 < 100，说明存的是"元"，转换为"分"
            if (rawBalance < 100) {
              enterpriseBalance = Math.round(rawBalance * 100)
              console.log('企业余额自动转换:', rawBalance, '元 ->', enterpriseBalance, '分')
            } else {
              enterpriseBalance = rawBalance
              console.log('企业余额直接使用(分):', enterpriseBalance)
            }
          } else {
            return { success: false, error: '企业不存在' }
          }
        } catch (e) {
          console.log('查询企业余额失败:', e.message)
          return { success: false, error: '查询企业信息失败: ' + e.message }
        }

        // 前端传来的 balance 单位是"分"（通过 Math.round(value * 100) 转换）
        const allocateBalance = parseFloat(balance) || 0
        console.log('前端传入分配余额:', allocateBalance, '企业余额:', enterpriseBalance)
        
        // 校验分配余额不能超过企业余额（单位都是"分"）
        if (allocateBalance > enterpriseBalance) {
          console.log('余额校验失败:', allocateBalance, '>', enterpriseBalance)
          return {
            success: false,
            error: `分配余额不能超过企业当前余额 ¥${(enterpriseBalance / 100).toFixed(2)}`
          }
        }

        // 检查手机号是否已被其他企业添加
        let existResult
        try {
          existResult = await db.collection('enterprise_sub_accounts')
            .where({ phone })
            .get()
        } catch (e) {
          // 集合不存在，不需要检查
          existResult = { data: [] }
        }

        if (existResult.data.length > 0) {
          const exist = existResult.data[0]
          if (exist.enterprise_id !== enterprise_id) {
            return {
              success: false,
              error: `该手机号已被其他企业添加为子账号，无法重复添加`
            }
          }
          // 同一个企业已存在该手机号，直接返回
          return {
            success: true,
            data: exist,
            message: '该子账号已存在'
          }
        }

        // 检查手机号是否已注册
        let userId = null
        let status = 'pending'
        try {
          const userResult = await db.collection('users')
            .where({ phone })
            .field({ user_id: true })
            .get()

          if (userResult.data.length > 0) {
            userId = userResult.data[0].user_id
            status = 'active'
          }
        } catch (e) {
          console.log('查询用户失败:', e.message)
        }

        // 添加子账号
        let result
        try {
          result = await db.collection('enterprise_sub_accounts').add({
            data: {
              enterprise_id,
              phone,
              remark,
              balance: allocateBalance,
              status,
              user_id: userId,
              create_time: new Date(),
              update_time: new Date()
            }
          })
        } catch (e) {
          console.log('添加子账号失败:', e.message)
          // 如果集合不存在，尝试创建
          if (e.message && e.message.includes('collection not exists')) {
            return { success: false, error: '子账号表不存在，请联系管理员创建 enterprise_sub_accounts 集合' }
          }
          return { success: false, error: '添加失败: ' + e.message }
        }

        return {
          success: true,
          id: result._id,
          status
        }
      }

      // 更新子账号
      case 'updatesubaccount': {
        const { id, remark, balance } = data || {}

        if (!id) {
          return { success: false, error: '子账号ID不能为空' }
        }

        // 如果修改余额，需要校验
        if (balance !== undefined) {
          // 查询子账号信息获取企业ID
          // 注意：doc().get() 返回的 data 是对象，不是数组
          const subResult = await db.collection('enterprise_sub_accounts').doc(id).get()
          if (!subResult.data || !subResult.data._id) {
            return { success: false, error: '子账号不存在' }
          }
          const subAccount = subResult.data  // 直接是对象

          // 查询企业余额
          let enterpriseBalance = 0
          try {
            const enterpriseResult = await db.collection('enterprises').where({_id: subAccount.enterprise_id}).get()
            if (enterpriseResult.data && enterpriseResult.data.length > 0) {
              const rawBalance = parseFloat(enterpriseResult.data[0].balance) || 0
              // 兼容处理：如果余额值 < 100，说明存的是"元"，转换为"分"
              if (rawBalance < 100) {
                enterpriseBalance = Math.round(rawBalance * 100)
              } else {
                enterpriseBalance = rawBalance
              }
            }
          } catch (e) {
            console.log('查询企业余额失败:', e.message)
          }
          
          // 校验分配余额不能超过企业余额
          if (balance > enterpriseBalance) {
            return {
              success: false,
              error: `分配余额不能超过企业当前余额 ¥${(enterpriseBalance / 100).toFixed(2)}`
            }
          }
        }

        const updateData = { update_time: new Date() }

        if (remark !== undefined) updateData.remark = remark
        if (balance !== undefined) updateData.balance = parseFloat(balance) || 0

        await db.collection('enterprise_sub_accounts').doc(id).update({ data: updateData })

        return { success: true }
      }

      // 删除子账号
      case 'deletesubaccount': {
        const { id } = data || {}

        if (!id) {
          return { success: false, error: '子账号ID不能为空' }
        }

        await db.collection('enterprise_sub_accounts').doc(id).remove()

        return { success: true }
      }

      // ============ 分片上传 ============
      case 'chunkedupload': {
        const { action: subAction, data: subData } = data || {}
        
        // 引入分片上传所需的依赖
        const fs = require('fs')
        const path = require('path')
        const os = require('os')
        const crypto = require('crypto')
        
        // 缓存目录
        const TEMP_DIR = path.join(os.tmpdir(), 'uploads')
        if (!fs.existsSync(TEMP_DIR)) {
          fs.mkdirSync(TEMP_DIR, { recursive: true })
        }
        
        // 初始化上传会话
        if (subAction === 'init') {
          const uploadId = crypto.randomBytes(16).toString('hex')
          global.uploadSessions = global.uploadSessions || {}
          global.uploadSessions[uploadId] = {
            uploadId,
            filename: subData.filename,
            fileSize: subData.fileSize,
            chunkCount: subData.chunkCount,
            chunks: [],
            createdAt: Date.now()
          }
          console.log('初始化分片上传:', uploadId, '分片数:', subData.chunkCount)
          return { success: true, uploadId }
        }
        
        // 上传分片
        if (subAction === 'uploadChunk') {
          const { uploadId, chunkIndex, chunk } = subData
          const session = global.uploadSessions?.[uploadId]
          
          if (!session) {
            return { success: false, error: '上传会话不存在' }
          }
          
          try {
            const chunkBuffer = Buffer.from(chunk, 'base64')
            const chunkPath = path.join(TEMP_DIR, `${uploadId}_${chunkIndex}`)
            fs.writeFileSync(chunkPath, chunkBuffer)
            
            session.chunks[chunkIndex] = { index: chunkIndex, path: chunkPath }
            const uploadedCount = session.chunks.filter(c => c).length
            
            console.log('分片上传完成:', chunkIndex + 1, '/', session.chunkCount)
            
            return {
              success: true,
              uploadedCount,
              totalChunks: session.chunkCount,
              isComplete: uploadedCount === session.chunkCount
            }
          } catch (err) {
            console.error('分片上传失败:', err)
            return { success: false, error: err.message }
          }
        }
        
        // 完成上传
        if (subAction === 'complete') {
          const { uploadId } = subData
          const session = global.uploadSessions?.[uploadId]
          
          if (!session) {
            return { success: false, error: '上传会话不存在' }
          }
          
          try {
            // 合并分片
            const buffers = []
            for (let i = 0; i < session.chunkCount; i++) {
              if (!session.chunks[i]) {
                return { success: false, error: `缺少分片 ${i}` }
              }
              buffers.push(fs.readFileSync(session.chunks[i].path))
            }
            
            const fullBuffer = Buffer.concat(buffers)
            console.log('分片合并完成, 大小:', fullBuffer.length)
            
            // 上传到云存储
            const ext = session.filename?.split('.').pop() || 'jpg'
            const key = `function-images/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`
            
            const uploadResult = await cloud.uploadFile({
              cloudPath: key,
              fileContent: fullBuffer
            })
            
            // 获取访问链接
            const urlResult = await cloud.getTempFileURL({
              fileList: [uploadResult.fileID]
            })
            
            const url = urlResult.fileList[0]?.tempFileURL || ''
            
            // 生成缩略图
            let thumbnailUrl = url
            try {
              const sharp = require('sharp')
              const thumbBuffer = await sharp(fullBuffer)
                .resize(250, 250, { withoutEnlargement: true })
                .jpeg({ quality: 70 })
                .toBuffer()
              
              const thumbKey = key.replace(/\.(.+)$/, '_thumb.$1')
              const thumbUploadResult = await cloud.uploadFile({
                cloudPath: thumbKey,
                fileContent: thumbBuffer
              })
              
              const thumbUrlResult = await cloud.getTempFileURL({
                fileList: [thumbUploadResult.fileID]
              })
              thumbnailUrl = thumbUrlResult.fileList[0]?.tempFileURL || url
            } catch (err) {
              console.error('生成缩略图失败:', err.message)
            }
            
            // 清理
            for (const chunk of session.chunks) {
              if (chunk && chunk.path && fs.existsSync(chunk.path)) {
                fs.unlinkSync(chunk.path)
              }
            }
            delete global.uploadSessions[uploadId]
            
            console.log('上传完成, URL:', url)
            return {
              success: true,
              data: { url, thumbnailUrl, fileID: uploadResult.fileID }
            }
          } catch (err) {
            console.error('完成上传失败:', err)
            return { success: false, error: err.message }
          }
        }
        
        return { success: false, error: '未知分片操作' }
      }

      // ============ 处理已上传到 COS 的图片（生成缩略图）===========
      case 'processuploadedimage': {
        const { cosPath } = data || {}
        
        if (!cosPath) {
          return { success: false, error: 'COS路径不能为空' }
        }
        
        // COS 公开访问 URL
        const bucket = process.env.COS_BUCKET || '6c69-liandaofutou-2gdayw0068d938b3-1417102114'
        const region = process.env.COS_REGION || 'ap-shanghai'
        const originalUrl = `https://${bucket}.cos.${region}.myqcloud.com/${cosPath}`
        
        // 缩略图 URL（使用 COS 图片处理参数，宽度300px，等比缩放）
        // !300x 表示宽度300，高度按比例自动计算
        const thumbnailUrl = `${originalUrl}?imageMogr2/thumbnail/!300x/interlace/1/quality/80`
        
        return {
          success: true,
          data: {
            url: originalUrl,
            thumbnailUrl: thumbnailUrl,
            cloudPath: cosPath
          }
        }
      }

      // ============ COS 预签名 URL 上传（客户端直传）===========
      case 'getcosuploadurl': {
        const crypto = require('crypto')
        const { filename, fileSize, contentType } = data || {}
        
        // 从环境变量获取 COS 配置
        const bucket = process.env.COS_BUCKET || '6c69-liandaofutou-2gdayw0068d938b3-1417102114'
        const region = process.env.COS_REGION || 'ap-shanghai'
        const secretId = process.env.TENCENT_SECRET_ID || ''
        const secretKey = process.env.TENCENT_SECRET_KEY || ''
        
        if (!secretId || !secretKey) {
          console.error('COS凭证未配置: secretId=', !!secretId, 'secretKey=', !!secretKey)
          return { success: false, error: 'COS凭证未配置' }
        }
        
        // 生成唯一文件名
        const ext = filename?.split('.').pop() || 'jpg'
        const cosPath = `function-images/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`
        
        // 使用 COS SDK 生成预签名 URL
        const cos = new COS({
          SecretId: secretId,
          SecretKey: secretKey
        })
        
        // 使用 getObjectUrl 方法生成预签名 URL
        const uploadUrl = cos.getObjectUrl({
          Bucket: bucket,
          Region: region,
          Key: cosPath,
          Method: 'PUT',
          Expires: 1800, // 30分钟
          Sign: true
        })
        
        console.log('生成COS预签名URL成功, bucket:', bucket, 'path:', cosPath)
        
        return {
          success: true,
          data: {
            uploadUrl,
            cosPath,
            bucket,
            region,
            expires: Math.floor(Date.now() / 1000) + 1800
          }
        }
      }

      // ============ COS 中转上传（云函数接收文件后上传到COS）===========
      case 'cosupload': {
        const crypto = require('crypto')
        const https = require('https')
        
        const { file, filename, contentType } = data || {}
        
        if (!file) {
          return { success: false, error: '文件内容不能为空' }
        }
        
        // 从环境变量获取 COS 配置
        const bucket = process.env.COS_BUCKET || '6c69-liandaofutou-2gdayw0068d938b3-1417102114'
        const region = process.env.COS_REGION || 'ap-shanghai'
        const secretId = process.env.TENCENT_SECRET_ID || ''
        const secretKey = process.env.TENCENT_SECRET_KEY || ''
        
        if (!secretId || !secretKey) {
          console.error('COS凭证未配置')
          return { success: false, error: 'COS凭证未配置' }
        }
        
        // 解码 base64 文件内容
        let base64Data = file
        if (file.includes(',')) {
          base64Data = file.split(',')[1]
        }
        const buffer = Buffer.from(base64Data, 'base64')
        
        // 检查文件大小：不超过5M
        const MAX_SIZE = 5 * 1024 * 1024
        if (buffer.length > MAX_SIZE) {
          return { success: false, error: '文件大小不能超过5MB' }
        }
        
        // 生成唯一文件名
        const ext = filename?.split('.').pop() || 'jpg'
        const cosPath = `function-images/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`
        
        // 计算签名过期时间（30分钟）
        const startTime = Math.floor(Date.now() / 1000)
        const expiredTime = startTime + 1800
        
        // TC3-HMAC-SHA256 签名算法
        const objectKey = cosPath
        const httpString = [
          'PUT',
          `/${objectKey}`,
          '',
          `content-type=${contentType || 'image/jpeg'}`,
          `host=${bucket}.cos.${region}.myqcloud.com`,
          ''
        ].join('\n')
        
        const signTime = `${startTime};${expiredTime}`
        const httpStringEncoded = crypto.createHash('sha256').update(httpString).digest('hex')
        const stringToSign = ['sha256', signTime, httpStringEncoded, ''].join('\n')
        
        const secretDate = crypto.createHmac('sha256', `cos3api ${startTime.toString().slice(0, 8)}`).update(secretKey).digest()
        const secretSign = crypto.createHmac('sha256', secretDate).update(stringToSign).digest('hex')
        const authorization = `q-sign-algorithm=sha256&q-ak=${secretId}&q-sign-time=${signTime}&q-key-time=${signTime}&q-header-list=content-type;host&q-url-param-list=&q-signature=${secretSign}`
        
        // 上传文件到 COS
        const uploadUrl = `https://${bucket}.cos.${region}.myqcloud.com/${objectKey}`
        
        return new Promise((resolve, reject) => {
          const urlObj = new URL(uploadUrl)
          const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname,
            method: 'PUT',
            headers: {
              'Authorization': authorization,
              'Content-Type': contentType || 'image/jpeg',
              'Content-Length': buffer.length,
              'Host': `${bucket}.cos.${region}.myqcloud.com`
            }
          }
          
          const req = https.request(options, (res) => {
            let responseData = ''
            res.on('data', chunk => responseData += chunk)
            res.on('end', () => {
              console.log('COS上传响应状态:', res.statusCode)
              if (res.statusCode === 200 || res.statusCode === 201) {
                const originalUrl = uploadUrl
                const thumbnailUrl = `${originalUrl}?imageMogr2/thumbnail/250x250`
                resolve({
                  success: true,
                  data: {
                    url: originalUrl,
                    thumbnailUrl: thumbnailUrl,
                    cosPath: cosPath
                  }
                })
              } else {
                console.error('COS上传失败:', responseData)
                resolve({ success: false, error: `上传失败: ${res.statusCode}` })
              }
            })
          })
          
          req.on('error', (err) => {
            console.error('COS上传请求错误:', err)
            resolve({ success: false, error: err.message })
          })
          
          req.write(buffer)
          req.end()
        })
      }

      // ============ 订单管理 ============
      case 'adminOrder': {
        return await handleAdminOrder(db, data)
      }

      default:
        return { success: false, error: `未知操作: ${action}` }
    }
  } catch (err) {
    console.error('adminproxy 错误:', err)
    return { success: false, error: err.message || '服务器错误' }
  }
}

/**
 * 后台订单管理
 */
async function handleAdminOrder(db, data) {
  const { action, data: params } = data || {}
  
  switch (action) {
    case 'list':
      return await getOrderList(db, params)
    case 'detail':
      return await getOrderDetail(db, params)
    case 'retry':
      return await retryWorkflow(db, params)
    default:
      return { success: false, error: '未知操作' }
  }
}

/**
 * 获取订单列表
 */
async function getOrderList(db, params) {
  const { page = 1, pageSize = 20, status, userId, functionId } = params || {}

  const where = {}
  if (status) {
    where.status = status
  }
  if (userId) {
    where.user_id = userId
  }
  if (functionId) {
    where.function_id = functionId
  }

  const skip = (page - 1) * pageSize

  // 查询总数
  const countResult = await db.collection('orders').where(where).count()
  const total = countResult.total

  // 查询列表
  const ordersRes = await db.collection('orders')
    .where(where)
    .orderBy('created_at', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get()

  // 获取用户信息
  const userIds = [...new Set((ordersRes.data || []).map(o => o.user_id))]
  let userMap = {}
  
  if (userIds.length > 0) {
    const usersRes = await db.collection('users')
      .where({ _id: db.command.in(userIds) })
      .field({ _id: true, phone: true, nickname: true })
      .get()
    
    userMap = (usersRes.data || []).reduce((map, u) => {
      map[u._id] = u
      return map
    }, {})
  }

  // 格式化数据
  const orders = (ordersRes.data || []).map(order => {
    const user = userMap[order.user_id] || {}
    return {
      _id: order._id,
      userId: order.user_id,
      userPhone: user.phone || '',
      userNickname: user.nickname || '',
      functionName: order.function_name || '',
      templateName: order.template_name || '',
      status: order.status,
      costAmount: (order.cost_amount || 0) / 100,
      costType: order.cost_type,
      outputType: order.output_type || 'image',
      createdAt: formatTime(order.created_at),
      hasError: order.status === 'failed'
    }
  })

  return {
    success: true,
    data: orders,
    total,
    page,
    pageSize
  }
}

/**
 * 获取订单详情（包含完整的COZE参数追踪）
 */
async function getOrderDetail(db, params) {
  const { orderId } = params || {}

  if (!orderId) {
    return { success: false, error: '订单ID不能为空' }
  }

  // 查询订单
  const orderRes = await db.collection('orders').doc(orderId).get()
  if (!orderRes.data) {
    return { success: false, error: '订单不存在' }
  }

  const order = orderRes.data

  // 获取用户信息
  let user = null
  if (order.user_id) {
    const userRes = await db.collection('users').doc(order.user_id).get()
    user = userRes.data
  }

  // 获取工作流产品信息（包含输入字段配置和固定字段映射）
  let workflowProduct = null
  let inputFieldsConfig = []
  let fixedFieldMappings = []
  if (order.workflow_product_id) {
    const wpRes = await db.collection('workflow_products').doc(order.workflow_product_id).get()
    if (wpRes.data) {
      workflowProduct = wpRes.data
      inputFieldsConfig = wpRes.data.input_fields || []
      fixedFieldMappings = wpRes.data.fixed_field_mappings || []
    }
  }

  // 获取模板信息
  let template = null
  if (order.template_id) {
    const templateRes = await db.collection('templates').doc(order.template_id).get()
    if (templateRes.data) {
      template = templateRes.data
    }
  }

  // 获取素材信息
  let material = null
  // 优先使用 order.material_id 查询，其次使用 order.template_id
  if (order.material_id) {
    const materialRes = await db.collection('materials').doc(order.material_id).get()
    if (materialRes.data) {
      material = materialRes.data
    }
  } else if (order.template_id) {
    const materialsRes = await db.collection('materials')
      .where({ template_id: order.template_id })
      .limit(1)
      .get()
    if (materialsRes.data?.length > 0) {
      material = materialsRes.data[0]
    }
  }

  // 获取尺寸信息
  let size = null
  // 优先使用 order.size_id 查询，其次使用 template.size_id
  if (order.size_id) {
    const sizeRes = await db.collection('generate_sizes').doc(order.size_id).get()
    if (sizeRes.data) {
      size = sizeRes.data
    }
  } else if (template?.size_id) {
    const sizeRes = await db.collection('generate_sizes').doc(template.size_id).get()
    if (sizeRes.data) {
      size = sizeRes.data
    }
  }

  // 解析输出结果（优先使用 output_data，兼容 output_result）
  let outputResult = order.output_data || order.output_result || {}
  if (typeof outputResult === 'string') {
    try {
      outputResult = JSON.parse(outputResult)
    } catch (e) {
      outputResult = { raw: outputResult }
    }
  }

  // 构建发送给COZE的实际参数（用于调试）
  const cozeParamsResult = buildCozeParams(order, template, material, size, inputFieldsConfig, fixedFieldMappings)

  return {
    success: true,
    data: {
      // 订单基本信息
      order: {
        _id: order._id,
        status: order.status,
        costAmount: (order.cost_amount || 0) / 100,
        costType: order.cost_type,
        outputType: order.output_type,
        createdAt: formatTime(order.created_at),
        startedAt: formatTime(order.started_at),
        completedAt: formatTime(order.completed_at),
        errorMsg: order.error_msg || '',
        wxOutTradeNo: order.wx_out_trade_no || ''
      },
      // 用户信息
      user: user ? {
        _id: user._id,
        phone: user.phone || '',
        nickname: user.nickname || '',
        balance: (user.balance || 0) / 100
      } : null,
      // 工作流信息
      workflow: {
        cozeWorkflowId: order.coze_workflow_id,
        conversationId: order.conversation_id,
        chatId: order.chat_id,
        cozeStatus: order.coze_status,
        workflowProductName: workflowProduct?.name || ''
      },
      // 调试信息：工作流产品ID和配置
      workflowProductId: order.workflow_product_id || null,
      workflowProductFixedFieldMappings: fixedFieldMappings,
      // 调试信息：实际获取到的数据
      debugTemplateData: template,
      debugMaterialData: material,
      debugSizeData: size,
      // 输入配置
      inputConfig: inputFieldsConfig,
      // COZE实际发送的参数（包含映射关系）
      cozeInputParams: cozeParamsResult.params,
      cozeFieldMappings: cozeParamsResult.fieldMappings,
      // 模板信息
      template: template ? {
        _id: template._id,
        name: template.templateName || template.name,
        prompt: template.prompt,
        cover: template.thumbnail
      } : null,
      // 素材信息
      material: material ? {
        _id: material._id,
        title: material.title,
        url: material.url
      } : null,
      // 尺寸信息
      size: size ? {
        _id: size._id,
        name: size.name,
        sizeValue: size.size_value
      } : null,
      // 原始用户输入参数
      rawInputParams: order.input_params || {},
      // 输出结果
      outputResult,
      // 工作流产品配置
      workflowProduct: workflowProduct ? {
        name: workflowProduct.name,
        inputFields: inputFieldsConfig,
        outputFields: workflowProduct.output_fields || []
      } : null
    }
  }
}

/**
 * 构建发送给COZE的实际参数（用于调试对比）
 * 返回详细的映射关系
 * 使用数据库配置的 fixed_field_mappings
 */
function buildCozeParams(order, template, material, size, inputFieldsConfig, fixedFieldMappings) {
  const params = {}
  const fieldMappings = []

  // 建立数据源映射
  const dataSources = {
    templates: template,
    materials: material,
    generate_sizes: size
  }

  // 表名称映射
  const tableNames = {
    templates: '模板',
    materials: '素材',
    generate_sizes: '尺寸'
  }

  // 处理固定字段映射（从数据库配置读取）
  for (const mapping of fixedFieldMappings || []) {
    const { source_table, source_field, target_field } = mapping
    if (!source_table || !source_field || !target_field) continue

    const sourceData = dataSources[source_table]
    if (!sourceData) continue

    let value = sourceData[source_field]
    if (value === undefined || value === null) continue

    params[target_field] = value
    fieldMappings.push({
      cozeField: target_field,
      source: 'fixed',
      sourceName: tableNames[source_table] || source_table,
      sourceField: `${source_table}.${source_field}`,
      value: value,
      preview: typeof value === 'string' ? value.substring(0, 50) : JSON.stringify(value),
      isImage: isImageUrl(value)
    })
  }

  // 自定义字段（根据工作流产品的input_fields配置）
  const userInput = order.input_params || {}
  const customFieldsMap = {}
  inputFieldsConfig.forEach(f => {
    if (f.field_key) {
      customFieldsMap[f.field_key] = f.field_name || f.field_key
    }
  })

  // 只显示配置中定义的字段
  Object.keys(customFieldsMap).forEach(key => {
    if (userInput[key] !== undefined && userInput[key] !== '') {
      let value = userInput[key]
      let isCloudUrl = typeof value === 'string' && value.startsWith('cloud://')

      params[key] = value
      fieldMappings.push({
        cozeField: key,
        value: value,
        source: 'custom',
        sourceName: `用户输入(${customFieldsMap[key]})`,
        sourceField: 'input_params.' + key,
        preview: isCloudUrl ? '(cloud://需转换为HTTPS)' : (typeof value === 'string' ? value.substring(0, 50) : JSON.stringify(value).substring(0, 50)),
        isImage: true,
        isCloudUrl: isCloudUrl
      })
    } else {
      // 字段已配置但用户没有输入
      fieldMappings.push({
        cozeField: key,
        value: '',
        source: 'custom',
        sourceName: `用户输入(${customFieldsMap[key]}) - 未填写`,
        sourceField: 'input_params.' + key,
        preview: '(空)',
        isImage: false,
        isCloudUrl: false
      })
    }
  })

  return {
    params,
    fieldMappings
  }
}

// 辅助函数：判断是否为图片URL
function isImageUrl(url) {
  if (!url || typeof url !== 'string') return false
  return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url) || 
         url.includes('cloud://') || 
         url.includes('cos://') ||
         url.startsWith('http')
}

/**
 * 重试执行工作流
 */
async function retryWorkflow(db, params) {
  const { orderId } = params || {}

  if (!orderId) {
    return { success: false, error: '订单ID不能为空' }
  }

  const orderRes = await db.collection('orders').doc(orderId).get()
  if (!orderRes.data) {
    return { success: false, error: '订单不存在' }
  }

  const order = orderRes.data

  if (!order.coze_workflow_id) {
    return { success: false, error: '该订单没有关联工作流' }
  }

  // 更新状态为处理中
  await db.collection('orders').doc(orderId).update({
    data: {
      status: 'processing',
      started_at: new Date(),
      error_msg: ''
    }
  })

  return {
    success: true,
    message: '已重试，请在作品仓库查看结果'
  }
}
