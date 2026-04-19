// pages/product-select/product-select.js
const app = getApp()

Page({
  data: {
    templateId: '',
    templateName: '',
    templateCover: '',
    templateDesc: '',
    // 登录提示
    showLoginTip: false,
    // 素材库类型切换
    materialLibType: 'personal', // personal / enterprise
    hasEnterpriseLib: false, // 是否有企业素材库权限
    enterpriseName: '企业', // 企业简称
    // 一级分类
    primaryCategories: [],
    currentPrimaryCategory: '',
    currentPrimaryId: '',
    // 二级分类
    secondaryCategories: [],
    filteredSecondaryCategories: [],
    currentSecondaryCategory: '',
    subCategoryMap: {},
    // 产品数据（素材）
    products: [],
    // 瀑布流分列
    column0: [],
    column1: [],
    column2: [],
    selectedProductId: '',
    selectedProductName: '',
    selectedProductImage: '',
    selectedProductDesc: '',
    loading: false,
    page: 1,
    pageSize: 30,
    hasMore: true
  },

  onLoad(options) {
    console.log('========== onLoad START ==========')
    console.log('options:', options)

    // 获取传递的模板信息
    this.setData({
      templateId: options.templateId || '',
      templateName: decodeURIComponent(options.templateName || ''),
      templateCover: decodeURIComponent(options.templateCover || ''),
      templateDesc: decodeURIComponent(options.templateDesc || '')
    })

    // 读取素材库类型参数（personal / enterprise）
    // 如果没有传，默认使用个人素材库
    const materialLibType = options.type === 'enterprise' ? 'enterprise' : 'personal'
    this.setData({ materialLibType })

    // 保存功能参数
    if (options.functionId) {
      this.functionId = options.functionId
      this.functionName = decodeURIComponent(options.functionName || '')

      // 设置标题为功能名称
      wx.setNavigationBarTitle({
        title: this.functionName || '选择产品'
      })
    } else {
      wx.setNavigationBarTitle({
        title: '选择产品'
      })
    }

    // 保存 redirect 参数，用于回调模式
    if (options.redirect === 'generate-flow') {
      this.redirectTo = 'generate-flow'
    } else {
      this.redirectTo = null
    }

    // 先同步更新本地 enterprise_id，然后检查权限
    this.syncEnterpriseId(options)
    console.log('========== onLoad END ==========')
  },

  // 同步企业ID到本地存储
  async syncEnterpriseId(options) {
    const userInfo = wx.getStorageSync('userInfo')
    const userId = wx.getStorageSync('userId')
    console.log('syncEnterpriseId - before:', userInfo)
    
    // 检查用户是否有企业身份
    const isEnterprise = userInfo && userInfo.user_type === 'enterprise'
    
    // 如果是企业用户且 enterprise_id 为空，通过 enterprise_sub_accounts 查询
    if (isEnterprise && userInfo && (!userInfo.enterprise_id || userInfo.enterprise_id === '')) {
      try {
        const db = wx.cloud.database()
        const subRes = await db.collection('enterprise_sub_accounts')
          .where({
            user_id: userId,
            status: 'active'
          })
          .limit(1)
          .get()
        
        if (subRes.data && subRes.data.length > 0) {
          userInfo.enterprise_id = subRes.data[0].enterprise_id
          wx.setStorageSync('userInfo', userInfo)
          console.log('syncEnterpriseId - found from sub_accounts:', userInfo.enterprise_id)
        } else {
          // 尝试通过 users 表查询最新的 enterprise_id
          const userRes = await db.collection('users').doc(userId).get()
          if (userRes.data && userRes.data.enterprise_id) {
            userInfo.enterprise_id = userRes.data.enterprise_id
            wx.setStorageSync('userInfo', userInfo)
            console.log('syncEnterpriseId - found from users:', userInfo.enterprise_id)
          }
        }
      } catch (e) {
        console.log('syncEnterpriseId - query failed:', e)
      }
    }
    
    // 确保 isLogin 为 true
    if (!wx.getStorageSync('isLogin')) {
      wx.setStorageSync('isLogin', true)
      console.log('syncEnterpriseId - set isLogin: true')
    }
    
    // 检查用户是否有企业素材库权限
    this.checkEnterpriseLibPermission(options)
  },

  // 检查用户是否有企业素材库权限
  checkEnterpriseLibPermission(options) {
    const userInfo = wx.getStorageSync('userInfo')
    const isLogin = wx.getStorageSync('isLogin')

    console.log('checkEnterpriseLibPermission - userInfo:', userInfo)
    console.log('checkEnterpriseLibPermission - isLogin:', isLogin)

    // 未登录，显示提示
    if (!isLogin || !userInfo) {
      console.log('checkEnterpriseLibPermission - show login tip')
      this.setData({
        hasEnterpriseLib: false,
        materialLibType: 'personal',
        showLoginTip: true
      })
      return
    }

    // 已登录，隐藏提示并加载分类
    this.setData({
      showLoginTip: false
    })

    // 判断是否有企业素材库权限
    // 企业管理员或企业成员都有权限
    const hasEnterpriseLib = userInfo.user_type === 'enterprise' && userInfo.enterprise_id && userInfo.enterprise_id !== ''
    console.log('checkEnterpriseLibPermission - hasEnterpriseLib:', hasEnterpriseLib)

    // 获取企业简称
    const enterpriseName = userInfo.company_short_name || userInfo.company_name || '企业'

    // 如果有企业身份，默认选中企业素材库；否则默认选中个人素材库
    let defaultMaterialType = 'personal'
    if (hasEnterpriseLib) {
      defaultMaterialType = 'enterprise' // 有企业身份，默认选中企业素材库
    }

    this.setData({
      hasEnterpriseLib: !!hasEnterpriseLib,
      materialLibType: defaultMaterialType,
      enterpriseName
    })

    this.loadCategories()
  },

  // 跳转到登录页
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login?redirect=/pages/profile/profile'
    })
  },

  // 切换素材库类型
  switchMaterialLib(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      materialLibType: type,
      primaryCategories: [],
      secondaryCategories: [],
      filteredSecondaryCategories: [],
      currentPrimaryCategory: '',
      currentPrimaryId: '',
      currentSecondaryCategory: '',
      products: [],
      column0: [],
      column1: [],
      column2: [],
      selectedProductId: '',
      selectedProductName: '',
      selectedProductImage: '',
      selectedProductDesc: '',
      page: 1,
      hasMore: true
    })

    this.loadCategories()
  },

  // 加载分类
  async loadCategories() {
    const db = wx.cloud.database()

    try {
      const userInfo = wx.getStorageSync('userInfo')
      const userId = wx.getStorageSync('userId')

      console.log('loadCategories - userId:', userId)
      console.log('loadCategories - userInfo:', userInfo)
      console.log('loadCategories - materialLibType:', this.data.materialLibType)

      // 根据素材库类型确定查询条件
      // 企业分类优先用 enterprise_id 查询（兼容：同时用 user_id），个人分类用 user_id 查询
      let userType = 'personal'
      let enterpriseId = null
      let queryConditions = { parent_id: null }
      
      if (this.data.materialLibType === 'enterprise' && userInfo.enterprise_id) {
        userType = 'enterprise'
        enterpriseId = userInfo.enterprise_id
        // 企业分类：优先用 enterprise_id，也兼容只有 user_id 的旧数据
        queryConditions = {
          user_type: 'enterprise',
          $or: [
            { enterprise_id: enterpriseId },
            { user_id: userId }  // 兼容旧数据
          ],
          parent_id: null
        }
      } else if (this.data.materialLibType === 'personal') {
        queryConditions = {
          user_type: 'personal',
          user_id: userId,
          parent_id: null
        }
      }

      console.log('loadCategories - userType:', userType, 'enterpriseId:', enterpriseId)

      // 加载所有一级分类
      const primaryRes = await db.collection('user_material_categories')
        .where(queryConditions)
        .orderBy('order', 'asc')
        .get()

      const primaryCategories = primaryRes.data || []
      console.log('loadCategories - primaryCategories:', primaryCategories.length)

      // 构建二级分类查询条件
      let secondaryConditions = { parent_id: db.command.neq(null) }
      if (this.data.materialLibType === 'enterprise' && enterpriseId) {
        secondaryConditions = {
          user_type: 'enterprise',
          $or: [
            { enterprise_id: enterpriseId },
            { user_id: userId }  // 兼容旧数据
          ],
          parent_id: db.command.neq(null)
        }
      } else if (this.data.materialLibType === 'personal') {
        secondaryConditions = {
          user_type: 'personal',
          user_id: userId,
          parent_id: db.command.neq(null)
        }
      }

      // 加载所有二级分类
      const secondaryRes = await db.collection('user_material_categories')
        .where(secondaryConditions)
        .orderBy('order', 'asc')
        .get()

      const secondaryCategories = secondaryRes.data || []

      // 构建分类映射：一级分类ID -> 二级分类数组
      const subCategoryMap = {}
      primaryCategories.forEach(cat => {
        subCategoryMap[cat._id] = secondaryCategories
          .filter(sub => sub.parent_id === cat._id)
      })

      this.setData({
        primaryCategories,
        secondaryCategories,
        subCategoryMap
      })

      // 默认不自动选中第一个分类，而是选中"全部"（空值）
      this.loadProducts()
    } catch (err) {
      console.error('loadCategories error:', err)
      wx.showToast({
        title: '加载分类失败',
        icon: 'none'
      })
      this.loadProducts()
    }
  },

  // 选择一级分类
  selectPrimaryCategory(e) {
    const id = e.currentTarget.dataset.id || ''
    const name = e.currentTarget.dataset.name || ''

    // 筛选当前一级分类下的二级分类
    const filteredSecondaryCategories = id ? (this.data.subCategoryMap[id] || []) : []

    this.setData({
      currentPrimaryCategory: id, // 使用ID
      currentPrimaryId: id,
      filteredSecondaryCategories,
      currentSecondaryCategory: '',
      products: [],
      column0: [],
      column1: [],
      column2: [],
      page: 1,
      hasMore: true
    })

    this.loadProducts()
  },

  // 选择二级分类
  selectSecondaryCategory(e) {
    const id = e.currentTarget.dataset.id || ''
    this.setData({
      currentSecondaryCategory: id,
      products: [],
      column0: [],
      column1: [],
      column2: [],
      page: 1,
      hasMore: true
    })

    this.loadProducts()
  },

  // 将产品列表分列到3列瀑布流
  distributeToColumns(products) {
    const column0 = []
    const column1 = []
    const column2 = []
    
    products.forEach((item, index) => {
      const columnIndex = index % 3
      if (columnIndex === 0) {
        column0.push(item)
      } else if (columnIndex === 1) {
        column1.push(item)
      } else {
        column2.push(item)
      }
    })
    
    return { column0, column1, column2 }
  },

  // 加载产品列表（从素材库获取）
  async loadProducts() {
    if (this.data.loading) return

    if (this.data.page === 1) {
      this.setData({ loading: true })
    }

    const db = wx.cloud.database()

    try {
      const userInfo = wx.getStorageSync('userInfo')
      const userId = wx.getStorageSync('userId')

      // 根据素材库类型确定查询条件
      // 企业素材优先用 enterprise_id 查询（兼容：同时用 user_id）
      let whereCondition = {}
      if (this.data.materialLibType === 'enterprise') {
        const enterpriseId = userInfo.enterprise_id
        console.log('loadProducts - enterpriseId:', enterpriseId)
        if (enterpriseId) {
          // 企业素材：优先用 enterprise_id，也兼容只有 user_id 的旧数据
          whereCondition = {
            user_type: 'enterprise',
            $or: [
              { enterprise_id: enterpriseId },
              { user_id: userId }  // 兼容旧数据
            ]
          }
        } else {
          // 兼容旧数据：用 user_id 查询
          whereCondition = {
            user_type: 'enterprise',
            user_id: userId
          }
        }
      } else {
        // 个人素材
        whereCondition = {
          user_type: 'personal',
          user_id: userId
        }
      }

      console.log('loadProducts - whereCondition:', JSON.stringify(whereCondition))

      // 如果选择了二级分类，按二级分类筛选
      if (this.data.currentSecondaryCategory) {
        whereCondition.category2_id = this.data.currentSecondaryCategory
      } else if (this.data.currentPrimaryId && this.data.subCategoryMap[this.data.currentPrimaryId]) {
        // 如果选择了一级分类，按该分类下的所有二级分类筛选
        const subIds = this.data.subCategoryMap[this.data.currentPrimaryId].map(c => c._id)
        whereCondition.category2_id = db.command.in(subIds)
      }

      console.log('loadProducts query:', { 
        page: this.data.page, 
        skip: (this.data.page - 1) * this.data.pageSize,
        pageSize: this.data.pageSize,
        materialLibType: this.data.materialLibType
      })
      
      // 先查询总数
      const countRes = await db.collection('materials')
        .where(whereCondition)
        .count()
      console.log('Total count:', countRes.total)
      
      const res = await db.collection('materials')
        .where(whereCondition)
        .orderBy('create_time', 'desc')
        .skip((this.data.page - 1) * this.data.pageSize)
        .limit(this.data.pageSize)
        .get()

      let newProducts = res.data || []
      console.log('loadProducts result:', { 
        newCount: newProducts.length,
        totalProducts: this.data.products.length + newProducts.length,
        hasMore: newProducts.length >= this.data.pageSize
      })

      // 获取云存储临时URL（同时获取原图和缩略图）
      if (newProducts.length > 0) {
        // 收集原图和缩略图的 cloud:// URL
        const fileList = []
        newProducts.forEach(item => {
          // 原图 URL
          if (item.url && !item.url.startsWith('http')) {
            fileList.push({ id: item._id, type: 'url', fileId: item.url })
          }
          // 缩略图 URL（如果与原图不同）
          if (item.thumbnail_url && !item.thumbnail_url.startsWith('http') && item.thumbnail_url !== item.url) {
            fileList.push({ id: item._id, type: 'thumbnail', fileId: item.thumbnail_url })
          }
        })

        if (fileList.length > 0) {
          try {
            const cloudFileIds = fileList.map(f => f.fileId)
            const tempResult = await wx.cloud.getTempFileURL({
              fileList: cloudFileIds
            })
            const urlMap = {}
            tempResult.fileList.forEach(item => {
              if (item.tempFileURL) {
                urlMap[item.fileID] = item.tempFileURL
              }
            })

            // 替换URL：displayUrl 用于列表显示（缩略图），originalUrl 用于传给 Coze（原图）
            newProducts = newProducts.map(item => {
              const thumbUrl = item.thumbnail_url || ''
              const origUrl = item.url || ''
              const displayUrl = thumbUrl && !thumbUrl.startsWith('http') && urlMap[thumbUrl]
                ? urlMap[thumbUrl]
                : (thumbUrl.startsWith('http') ? thumbUrl : origUrl)
              const originalUrl = origUrl && !origUrl.startsWith('http') && urlMap[origUrl]
                ? urlMap[origUrl]
                : (origUrl.startsWith('http') ? origUrl : '')
              return { ...item, displayUrl, originalUrl }
            })
          } catch (err) {
            console.error('getTempFileURL error:', err)
            newProducts = newProducts.map(item => ({
              ...item,
              displayUrl: item.thumbnail_url || item.url,
              originalUrl: item.url || ''
            }))
          }
        } else {
          newProducts = newProducts.map(item => ({
            ...item,
            displayUrl: item.thumbnail_url || item.url,
            originalUrl: item.url || ''
          }))
        }
      }

      const allProducts = this.data.page === 1 ? newProducts : [...this.data.products, ...newProducts]
      
      // 分列到瀑布流
      const columns = this.distributeToColumns(allProducts)

      this.setData({
        products: allProducts,
        ...columns,
        hasMore: newProducts.length >= this.data.pageSize,
        loading: false
      })
      console.log('hasMore set to:', newProducts.length >= this.data.pageSize)
    } catch (err) {
      console.error('loadProducts error:', err)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 加载更多
  loadMore() {
    console.log('loadMore called:', { 
      hasMore: this.data.hasMore, 
      loading: this.data.loading,
      page: this.data.page,
      productCount: this.data.products.length
    })
    if (this.data.hasMore && !this.data.loading) {
      console.log('loading next page:', this.data.page + 1)
      this.setData({ page: this.data.page + 1 })
      this.loadProducts()
    }
  },

  // 触底加载
  onReachBottom() {
    console.log('onReachBottom triggered')
    this.loadMore()
  },

  // 选择产品
  selectProduct(e) {
    const { id, name, image, description } = e.currentTarget.dataset

    this.setData({
      selectedProductId: id,
      selectedProductName: name,
      selectedProductImage: image,
      selectedProductDesc: description || ''
    })
  },

  // 确认选择产品
  confirmSelect() {
    if (!this.data.selectedProductId) {
      wx.showToast({
        title: '请选择产品',
        icon: 'none'
      })
      return
    }

    // 如果是回调模式，保存选中产品并返回
    if (this.redirectTo === 'generate-flow') {
      const flowData = wx.getStorageSync('generateFlowData') || {}
      
      flowData.materials = [{
        _id: this.data.selectedProductId,
        name: this.data.selectedProductName,
        displayName: this.data.selectedProductName,
        image: this.data.selectedProductImage
      }]
      flowData.step = 2
      
      wx.setStorageSync('generateFlowData', flowData)
      wx.navigateBack()
      return
    }

    // 如果有功能ID，跳转到生成页
    if (this.functionId) {
      // 将图片数据存到 storage，避免 URL 过长
      wx.setStorageSync('generatePageData', {
        templateCover: this.data.templateCover,
        templateDesc: this.data.templateDesc,
        productImage: this.data.selectedProductImage,
        productDesc: this.data.selectedProductDesc
      })
      
      const params = {
        functionId: this.functionId,
        functionName: this.functionName || '',
        templateId: this.data.templateId,
        templateName: this.data.templateName,
        productId: this.data.selectedProductId,
        productName: this.data.selectedProductName
      }
      
      const url = '/pages/generate/generate?' + Object.keys(params)
        .map(k => `${k}=${encodeURIComponent(params[k])}`)
        .join('&')
      
      console.log('跳转生成页，URL长度:', url.length)
      wx.navigateTo({ url })
      return
    }

    // 原有逻辑，跳转到生成页面
    this.goToGenerate()
  },

  // 跳转到生成页面（原有逻辑）
  goToGenerate() {
    const params = {
      templateId: this.data.templateId,
      templateName: encodeURIComponent(this.data.templateName),
      templateCover: encodeURIComponent(this.data.templateCover),
      templateDesc: encodeURIComponent(this.data.templateDesc),
      productId: this.data.selectedProductId,
      productName: encodeURIComponent(this.data.selectedProductName),
      productImage: encodeURIComponent(this.data.selectedProductImage),
      productDesc: encodeURIComponent(this.data.selectedProductDesc)
    }

    wx.navigateTo({
      url: `/pages/generate/generate?${Object.keys(params).map(key => `${key}=${params[key]}`).join('&')}`
    })
  }
})
