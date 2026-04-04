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
    let userId = wx.getStorageSync('userId')
    let userInfo = wx.getStorageSync('userInfo')

    console.log('checkLogin - userId:', userId)
    console.log('checkLogin - userInfo:', userInfo)

    // 如果有 userId 但没有 userInfo，创建默认测试用户
    if (userId && !userInfo) {
      userInfo = {
        nickname: '测试用户',
        avatar: '',
        user_type: 'personal',
        balance: 5000 // 50元 = 5000分
      }
      wx.setStorageSync('userInfo', userInfo)
    }

    if (userId) {
      // 读取保存的模式
      const savedMode = wx.getStorageSync('currentMode') || 'personal'
      this.setData({
        isLogin: true,
        userInfo: userInfo,
        currentMode: savedMode
      })

      // 设置余额
      this.setBalances(userInfo, savedMode)
    } else {
      // 测试模式：如果未登录，显示登录状态为 false
      this.setData({ isLogin: false })
    }
  },

  async getUserInfo() {
    const userId = wx.getStorageSync('userId')

    console.log('getUserInfo - userId:', userId)

    if (!userId) {
      return
    }

    try {
      // 测试模式：如果 userId 以 test_user 开头，直接使用 storage 中的数据
      if (userId.startsWith('test_user')) {
        const userInfo = wx.getStorageSync('userInfo')
        console.log('getUserInfo - test mode, userInfo:', userInfo)
        if (userInfo) {
          this.setData({
            userInfo: userInfo,
            isLogin: true
          })
          this.setBalances(userInfo, this.data.currentMode)
        }
        return
      }

      // 正常模式：从数据库查询
      const db = wx.cloud.database()
      const res = await db.collection('users')
        .where({ _openid: '{openid}' })
        .get()

      if (res.data && res.data.length > 0) {
        const user = res.data[0]

        this.setData({
          userInfo: user,
          isLogin: true
        })

        this.setBalances(user, this.data.currentMode)

        // 保存到 storage
        wx.setStorageSync('userInfo', user)
      }
    } catch (err) {
      console.error('getUserInfo error:', err)
    }
  },

  // 设置余额显示
  setBalances(userInfo, mode) {
    if (!userInfo) return

    const enterpriseBalance = userInfo.balance || 0
    // 个人余额可以单独存储，这里暂时使用 enterpriseBalance 的一部分或固定值
    const personalBalance = userInfo.personal_balance || 0

    this.setData({
      enterpriseBalance: (enterpriseBalance / 100).toFixed(2),
      personalBalance: (personalBalance / 100).toFixed(2)
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

  // 微信登录
  async wxLogin() {
    wx.showLoading({ title: '登录中...' })

    try {
      const loginRes = await wx.login()

      // 测试模式：直接使用测试用户
      const testUserId = 'test_user_' + Date.now()
      const testUserInfo = {
        nickname: '测试用户',
        avatar: '',
        user_type: 'personal',
        balance: 5000 // 50元 = 5000分
      }

      wx.setStorageSync('userId', testUserId)
      wx.setStorageSync('userInfo', testUserInfo)

      this.setData({
        isLogin: true,
        userInfo: testUserInfo,
        balance: 5000,
        displayBalance: '50.00'
      })

      wx.showToast({ title: '登录成功', icon: 'success' })
    } catch (err) {
      console.error('wxLogin error:', err)
      wx.showToast({ title: '登录失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
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

          wx.showToast({ title: '已退出登录', icon: 'success' })
        }
      }
    })
  }
})

