// pages/product-select/product-select.js
const app = getApp()

Page({
  data: {
    templateId: '',
    templateName: '',
    templateCover: '',
    templateDesc: '',
    // 素材库类型切换
    materialLibType: 'personal', // personal / enterprise
    hasEnterpriseLib: false, // 是否有企业素材库权限
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
    // 获取传递的模板信息
    this.setData({
      templateId: options.templateId || '',
      templateName: decodeURIComponent(options.templateName || ''),
      templateCover: decodeURIComponent(options.templateCover || ''),
      templateDesc: decodeURIComponent(options.templateDesc || '')
    })

    wx.setNavigationBarTitle({
      title: '选择产品'
    })

    // 先同步更新本地 enterprise_id，然后检查权限
    this.syncEnterpriseId()
    console.log('========== onLoad END ==========')
  },

  // 同步企业ID到本地存储
  syncEnterpriseId() {
    const userInfo = wx.getStorageSync('userInfo')
    console.log('syncEnterpriseId - before:', userInfo)
    // 如果 enterprise_id 为空，设置默认值
    if (userInfo && (!userInfo.enterprise_id || userInfo.enterprise_id === '')) {
      userInfo.enterprise_id = 'eecf6b8e69cbd0b10021171643b7cec2'
      wx.setStorageSync('userInfo', userInfo)
      console.log('syncEnterpriseId - updated:', userInfo)
    }
    // 确保 isLogin 为 true
    if (!wx.getStorageSync('isLogin')) {
      wx.setStorageSync('isLogin', true)
      console.log('syncEnterpriseId - set isLogin: true')
    }
    // 检查用户是否有企业素材库权限
    this.checkEnterpriseLibPermission()
  },

  // 检查用户是否有企业素材库权限
  checkEnterpriseLibPermission() {
    const userInfo = wx.getStorageSync('userInfo')
    const isLogin = wx.getStorageSync('isLogin')

    console.log('checkEnterpriseLibPermission - userInfo:', userInfo)
    console.log('checkEnterpriseLibPermission - isLogin:', isLogin)

    if (!isLogin || !userInfo) {
      console.log('checkEnterpriseLibPermission - early return due to !isLogin or !userInfo')
      this.setData({
        hasEnterpriseLib: false,
        materialLibType: 'personal'
      })
      this.loadCategories()
      return
    }

    // 判断是否有企业素材库权限
    // 企业管理员或企业成员都有权限
    const hasEnterpriseLib = userInfo.user_type === 'enterprise' && userInfo.enterprise_id && userInfo.enterprise_id !== ''
    console.log('checkEnterpriseLibPermission - hasEnterpriseLib:', hasEnterpriseLib)

    this.setData({
      hasEnterpriseLib: !!hasEnterpriseLib,
      materialLibType: hasEnterpriseLib ? 'enterprise' : 'personal' // 企业用户默认企业素材库，个人用户默认个人素材库
    })

    this.loadCategories()
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

      // 根据素材库类型确定owner_id
      let ownerId = userId
      if (this.data.materialLibType === 'enterprise') {
        ownerId = userInfo.enterprise_id
      }

      // 加载所有一级分类
      const primaryRes = await db.collection('material_categories')
        .where({
          owner_type: this.data.materialLibType,
          owner_id: ownerId,
          parent_id: '' // 一级分类parent_id为空
        })
        .orderBy('sort_order', 'asc')
        .get()

      const primaryCategories = primaryRes.data || []

      // 加载所有二级分类
      const secondaryRes = await db.collection('material_categories')
        .where({
          owner_type: this.data.materialLibType,
          owner_id: ownerId,
          parent_id: db.command.neq('')
        })
        .orderBy('sort_order', 'asc')
        .get()

      const secondaryCategories = secondaryRes.data || []

      // 构建分类映射：一级分类名 -> 二级分类ID数组
      const subCategoryMap = {}
      primaryCategories.forEach(cat => {
        subCategoryMap[cat.name] = secondaryCategories
          .filter(sub => sub.parent_id === cat._id)
          .map(sub => sub._id)
      })

      this.setData({
        primaryCategories,
        secondaryCategories,
        subCategoryMap
      })

      // 默认选中第一个一级分类（如果有的话）
      if (primaryCategories.length > 0) {
        this.selectPrimaryCategory({ currentTarget: { dataset: { name: primaryCategories[0].name, id: primaryCategories[0]._id } } })
      } else {
        this.loadProducts()
      }
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
    const name = e.currentTarget.dataset.name || ''
    const id = e.currentTarget.dataset.id || ''

    // 筛选当前一级分类下的二级分类
    const filteredSecondaryCategories = this.data.secondaryCategories.filter(
      sub => sub.parent_id === id
    )

    this.setData({
      currentPrimaryCategory: name,
      currentPrimaryId: id,
      filteredSecondaryCategories,
      currentSecondaryCategory: '',
      products: [],
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
      page: 1,
      hasMore: true
    })

    this.loadProducts()
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

      // 根据素材库类型确定owner_id
      let ownerId = userId
      if (this.data.materialLibType === 'enterprise') {
        ownerId = userInfo.enterprise_id
      }

      let whereCondition = {
        owner_type: this.data.materialLibType,
        owner_id: ownerId
      }

      // 如果选择了二级分类，按二级分类筛选
      if (this.data.currentSecondaryCategory) {
        whereCondition.category_id = this.data.currentSecondaryCategory
      } else if (this.data.currentPrimaryId && this.data.subCategoryMap[this.data.currentPrimaryCategory]) {
        // 如果选择了一级分类，按该分类下的所有二级分类筛选
        whereCondition.category_id = db.command.in(this.data.subCategoryMap[this.data.currentPrimaryCategory])
      }

      const res = await db.collection('materials')
        .where(whereCondition)
        .orderBy('create_time', 'desc')
        .skip((this.data.page - 1) * this.data.pageSize)
        .limit(this.data.pageSize)
        .get()

      let newProducts = res.data || []

      // 获取云存储临时URL
      if (newProducts.length > 0) {
        const fileList = newProducts
          .filter(item => item.url && !item.url.startsWith('http'))
          .map(item => item.url)

        if (fileList.length > 0) {
          try {
            const tempResult = await wx.cloud.getTempFileURL({
              fileList: fileList
            })
            const urlMap = {}
            tempResult.fileList.forEach(item => {
              if (item.tempFileURL) {
                urlMap[item.fileID] = item.tempFileURL
              }
            })

            // 替换URL
            newProducts = newProducts.map(item => {
              if (item.url && !item.url.startsWith('http') && urlMap[item.url]) {
                return { ...item, displayUrl: urlMap[item.url] }
              }
              return { ...item, displayUrl: item.url }
            })
          } catch (err) {
            console.error('getTempFileURL error:', err)
          }
        } else {
          newProducts = newProducts.map(item => ({ ...item, displayUrl: item.url }))
        }
      }

      const allProducts = this.data.page === 1 ? newProducts : [...this.data.products, ...newProducts]

      this.setData({
        products: allProducts,
        hasMore: newProducts.length >= this.data.pageSize,
        loading: false
      })
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
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 })
      this.loadProducts()
    }
  },

  // 触底加载
  onReachBottom() {
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

  // 跳转到生成页面
  goToGenerate() {
    if (!this.data.selectedProductId) {
      wx.showToast({
        title: '请选择产品',
        icon: 'none'
      })
      return
    }

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
