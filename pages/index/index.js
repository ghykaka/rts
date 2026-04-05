// pages/index/index.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    isLogin: false,
    displayBalance: '0.00',
    bannerList: [
      { id: 1, url: '/assets/banners/banner1.png' },
      { id: 2, url: '/assets/banners/banner2.png' }
    ],
    categories: [],
    hotTemplates: [],
    loading: false
  },

  onLoad() {
    this.checkLogin()
    this.loadCategories()
    this.loadTemplates()
  },

  onShow() {
    // 每次显示页面时检查登录状态
    const userId = wx.getStorageSync('userId')
    if (userId) {
      this.getUserInfo()
    } else {
      // 未登录，重置状态
      this.setData({
        isLogin: false,
        userInfo: null,
        displayBalance: '0.00'
      })
    }
  },

  checkLogin() {
    const userId = wx.getStorageSync('userId')
    const userInfo = wx.getStorageSync('userInfo')

    if (userId && userInfo) {
      this.setData({
        userInfo: userInfo,
        isLogin: true,
        displayBalance: ((userInfo.balance || 0) / 100).toFixed(2)
      })
    }
  },

  async loadTemplates() {
    this.setData({ loading: true })

    try {
      const db = wx.cloud.database()
      const res = await db.collection('templates')
        .where({ is_active: true })
        .orderBy('sort', 'asc')
        .orderBy('created_at', 'desc')
        .limit(10)
        .get()

      const templates = res.data || []
      // 为每个模板添加显示价格
      const templatesWithPrice = templates.map(t => ({
        ...t,
        displayPrice: ((t.min_price || 80) / 100).toFixed(2)
      }))

      this.setData({
        hotTemplates: templatesWithPrice
      })
    } catch (err) {
      console.error('loadTemplates error:', err)
    } finally {
      this.setData({ loading: false })
    }
  },

  async loadCategories() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getTemplateCategories'
      })

      if (res.result.success) {
        const categories = res.result.data || []

        this.setData({
          categories: categories.slice(0, 5) // 显示前5个分类
        })
      }
    } catch (err) {
      console.error('loadCategories error:', err)
    }
  },

  async getUserInfo() {
    const userId = wx.getStorageSync('userId')
    if (!userId) {
      // 双重检查：storage 里没有就重置状态
      this.setData({
        isLogin: false,
        userInfo: null,
        displayBalance: '0.00'
      })
      return
    }

    try {
      const res = await wx.cloud.callFunction({
        name: 'getUserInfo',
        data: { userId }
      })

      if (res.result && res.result.success) {
        const userInfo = res.result.data
        // 更新 storage 中的用户信息
        wx.setStorageSync('userInfo', userInfo)
        // 同时更新全局数据
        app.globalData.userInfo = userInfo
        
        this.setData({
          userInfo: userInfo,
          isLogin: true,
          displayBalance: ((userInfo.balance || 0) / 100).toFixed(2)
        })
      } else {
        // 接口返回失败，可能用户已被删除，重置状态
        this.setData({
          isLogin: false,
          userInfo: null,
          displayBalance: '0.00'
        })
      }
    } catch (err) {
      console.error('getUserInfo error:', err)
    }
  },

  wxLogin() {
    // 跳转到登录页面
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 跳转模板详情
  goTemplateDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/template-detail/template-detail?id=${id}`
    })
  },

  // 跳转创意海报模板列表
  goPosterTemplates() {
    wx.navigateTo({
      url: '/pages/template-list/template-list?name=创意海报'
    })
  },

  // 跳转视频生成模板列表
  goVideoTemplates() {
    wx.navigateTo({
      url: '/pages/template-list/template-list?name=视频生成'
    })
  },

  // 跳转分类页
  goCategory(e) {
    const { id, name } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/template-list/template-list?categoryId=${id}&name=${encodeURIComponent(name)}`
    })
  },

  // 跳转我的
  goProfile() {
    wx.switchTab({
      url: '/pages/profile/profile'
    })
  },

  // 跳转充值
  goRecharge() {
    wx.navigateTo({
      url: '/pages/recharge/recharge'
    })
  },

  // 跳转初始化数据页(开发用)
  goInitData() {
    wx.navigateTo({
      url: '/pages/init-data/init-data'
    })
  },

  // 跳转添加模板页(开发用)
  goAddTemplates() {
    wx.navigateTo({
      url: '/pages/add-templates/add-templates'
    })
  }
})

