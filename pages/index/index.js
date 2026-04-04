// pages/index/index.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    isLogin: false,
    isDebug: true, // 开发调试模式（临时开启用于测试）
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
    if (app.globalData.userId) {
      this.getUserInfo()
    }
  },

  checkLogin() {
    const userId = wx.getStorageSync('userId')
    const userInfo = wx.getStorageSync('userInfo')

    if (userId) {
      this.setData({
        userInfo: userInfo,
        isLogin: true
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
    if (!userId) return

    try {
      const res = await wx.cloud.callFunction({
        name: 'getUserInfo',
        data: { userId }
      })

      if (res.result.success) {
        this.setData({
          userInfo: res.result.data,
          isLogin: true
        })
      }
    } catch (err) {
      console.error('getUserInfo error:', err)
    }
  },

  async wxLogin() {
    wx.showLoading({ title: '登录中...' })

    try {
      const loginRes = await wx.login()
      const userInfoRes = await wx.getUserProfile({ desc: '用于完善用户资料' })

      const res = await wx.cloud.callFunction({
        name: 'login',
        data: {
          code: loginRes.code,
          userInfo: userInfoRes.userInfo
        }
      })

      if (res.result.success) {
        app.setUserInfo(userInfoRes.userInfo, res.result.data.userId)

        this.setData({
          userInfo: userInfoRes.userInfo,
          isLogin: true
        })

        wx.showToast({
          title: res.result.data.isNewUser ? '欢迎新用户，赠送5元余额！' : '登录成功',
          icon: 'success'
        })

        this.getUserInfo()
      }
    } catch (err) {
      console.error('wxLogin error:', err)
      wx.showToast({ title: '登录失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
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

