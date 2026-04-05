// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    isLogin: false,
    userInfo: null,
    balance: 0,
    displayBalance: '0.00',
    currentMode: 'personal', // 当前模式：personal 或 enterprise
    personalBalance: '0.00', // 个人余额
    enterpriseBalance: '0.00' // 企业余额
  },

  onLoad() {
    this.checkLogin()
  },

  onShow() {
    this.getUserInfo()
  },

  checkLogin() {
    const userId = wx.getStorageSync('userId')
    const userInfo = wx.getStorageSync('userInfo')

    if (userId && userInfo) {
      const savedMode = wx.getStorageSync('currentMode') || 'personal'
      this.setData({
        isLogin: true,
        userInfo: userInfo,
        currentMode: savedMode
      })
      this.setBalances(userInfo, savedMode)
    } else {
      this.setData({ isLogin: false })
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

      if (res.result && res.result.success) {
        const user = res.result.data
        // 更新 storage 和全局数据
        wx.setStorageSync('userInfo', user)
        app.globalData.userInfo = user
        
        this.setData({
          userInfo: user,
          isLogin: true
        })
        this.setBalances(user, this.data.currentMode)
      }
    } catch (err) {
      console.error('getUserInfo error:', err)
    }
  },

  // 设置余额显示
  setBalances(userInfo, mode) {
    if (!userInfo) return

    // 统一使用 balance 字段
    const balance = userInfo.balance || 0

    this.setData({
      balance: balance,
      displayBalance: (balance / 100).toFixed(2),
      enterpriseBalance: (balance / 100).toFixed(2),
      personalBalance: (balance / 100).toFixed(2)
    })
  },

  // 切换到企业模式
  switchToEnterprise() {
    if (!this.data.userInfo || this.data.userInfo.user_type !== 'enterprise') {
      wx.showToast({ title: '请先注册企业', icon: 'none' })
      return
    }

    this.setData({ currentMode: 'enterprise' })
    wx.setStorageSync('currentMode', 'enterprise')
  },

  // 切换到个人模式
  switchToPersonal() {
    this.setData({ currentMode: 'personal' })
    wx.setStorageSync('currentMode', 'personal')
  },

  // 跳转登录页面
  goLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 跳转充值
  goRecharge() {
    wx.navigateTo({
      url: `/pages/recharge/recharge`
    })
  },

  // 跳转个人素材库
  goPersonalMaterials() {
    wx.navigateTo({ url: '/pages/materials/materials?type=personal' })
  },

  // 跳转企业素材库
  goEnterpriseMaterials() {
    wx.navigateTo({ url: '/pages/materials/materials?type=enterprise' })
  },

  // 跳转企业注册
  goEnterpriseRegister() {
    wx.navigateTo({ url: '/pages/enterprise-register/enterprise-register' })
  },

  // 跳转管理子账号
  goManageSubAccounts() {
    wx.navigateTo({ url: '/pages/sub-accounts/sub-accounts' })
  },

  // 临时方法：更新企业账号余额为50元
  async updateBalanceTo50() {
    try {
      const db = wx.cloud.database()
      const userId = wx.getStorageSync('userId')
      const userInfo = wx.getStorageSync('userInfo')

      if (!userId) {
        wx.showToast({ title: '未找到用户信息', icon: 'none' })
        return
      }

      wx.showLoading({ title: '更新中...' })

      // 使用 _id 查询并更新
      await db.collection('users').doc(userId).update({
        data: {
          balance: 5000,
          update_time: db.serverDate()
        }
      })

      wx.setStorageSync('userInfo', {
        ...userInfo,
        balance: 5000
      })

      this.setData({
        balance: 5000,
        displayBalance: '50.00'
      })

      wx.hideLoading()
      wx.showToast({ title: '余额已更新为50元', icon: 'success' })
    } catch (err) {
      console.error('更新余额失败:', err)
      wx.hideLoading()
      wx.showToast({ title: '更新失败', icon: 'none' })
    }
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录信息
          wx.removeStorageSync('userId')
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('currentMode')
          wx.removeStorageSync('isLogin')

          // 重置页面状态
          this.setData({
            isLogin: false,
            userInfo: null,
            currentMode: 'personal'
          })

          // 通知首页刷新为未登录状态
          const pages = getCurrentPages()
          const prevPage = pages[pages.length - 2]
          if (prevPage && prevPage.route === 'pages/index/index') {
            prevPage.setData({
              isLogin: false,
              userInfo: null,
              displayBalance: '0.00'
            })
          }

          wx.showToast({ title: '已退出登录', icon: 'success' })
        }
      }
    })
  }
})

