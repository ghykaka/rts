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
    enterpriseBalance: '0.00', // 企业余额
    userTypeText: '登录后享受更多功能', // 用户类型文本
    hasEnterprise: false, // 是否有企业账号
    currentBalance: '0.00', // 当前显示的余额
    rechargeButtonText: '充值', // 充值按钮文字
    isEnterpriseAdmin: false // 是否是企业管理员
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
    console.log('checkLogin:', { userId, userInfo })

    if (userId && userInfo) {
      const savedMode = wx.getStorageSync('currentMode') || 'personal'
      // 同时检查 user_type 和 enterprise_id
      const hasEnterprise = userInfo.user_type === 'enterprise' || userInfo.enterprise_id
      // 企业管理员判断：必须有企业账号且角色是 admin
      const isEnterpriseAdmin = hasEnterprise && userInfo.role === 'admin'
      // 充值按钮文字
      const rechargeButtonText = this.getRechargeButtonText(savedMode, isEnterpriseAdmin)
      
      this.setData({
        isLogin: true,
        userInfo: userInfo,
        currentMode: savedMode,
        hasEnterprise: hasEnterprise,
        isEnterpriseAdmin: isEnterpriseAdmin,
        userTypeText: this.getUserTypeText(userInfo, savedMode),
        currentBalance: ((userInfo.balance || 0) / 100).toFixed(2),
        rechargeButtonText: rechargeButtonText
      })
      this.setBalances(userInfo, savedMode)
    } else {
      this.setData({ isLogin: false, userTypeText: '登录后享受更多功能', rechargeButtonText: '充值' })
    }
  },
  
  // 获取充值按钮文字
  getRechargeButtonText(mode, isAdmin) {
    if (!isAdmin) {
      return '充值'
    }
    return mode === 'enterprise' ? '企业账户充值' : '个人账户充值'
  },
  
  // 获取用户类型文本
  getUserTypeText(userInfo, mode) {
    if (mode === 'enterprise') {
      return userInfo.company_short_name || userInfo.company_name || '企业会员'
    }
    return '普通会员'
  },

  async getUserInfo() {
    const userId = wx.getStorageSync('userId')
    if (!userId) {
      console.log('getUserInfo: no userId')
      return
    }

    try {
      console.log('getUserInfo: calling cloud function...')
      const res = await wx.cloud.callFunction({
        name: 'getUserInfo',
        data: { userId }
      })
      console.log('getUserInfo result:', res)

      if (res.result && res.result.success) {
        const user = res.result.data
        // 更新 storage 和全局数据
        wx.setStorageSync('userInfo', user)
        app.globalData.userInfo = user
        
        // 同时检查 user_type 和 enterprise_id
        const hasEnterprise = user.user_type === 'enterprise' || user.enterprise_id
        const isEnterpriseAdmin = hasEnterprise && user.role === 'admin'
        const rechargeButtonText = this.getRechargeButtonText(this.data.currentMode, isEnterpriseAdmin)
        
        this.setData({
          userInfo: user,
          isLogin: true,
          hasEnterprise: hasEnterprise,
          isEnterpriseAdmin: isEnterpriseAdmin,
          userTypeText: this.getUserTypeText(user, this.data.currentMode),
          currentBalance: ((user.balance || 0) / 100).toFixed(2),
          rechargeButtonText: rechargeButtonText
        })
        this.setBalances(user, this.data.currentMode)
      } else {
        console.log('getUserInfo failed:', res.result?.error)
      }
    } catch (err) {
      console.error('getUserInfo error:', err)
      // 即使出错也不影响页面显示
    }
  },

  // 设置余额显示
  setBalances(userInfo, mode) {
    if (!userInfo) return

    // 区分个人余额和企业余额
    const personalBalance = userInfo.balance || 0
    const enterpriseBalance = userInfo.enterprise_balance || 0
    
    // 根据模式决定显示哪个余额
    const currentBalance = mode === 'enterprise' ? enterpriseBalance : personalBalance
    const displayBalance = (currentBalance / 100).toFixed(2)

    this.setData({
      balance: personalBalance,
      displayBalance: displayBalance,
      enterpriseBalance: (enterpriseBalance / 100).toFixed(2),
      personalBalance: (personalBalance / 100).toFixed(2),
      currentBalance: displayBalance
    })
  },

  // 切换到企业模式
  switchToEnterprise() {
    if (!this.data.userInfo || this.data.userInfo.user_type !== 'enterprise') {
      wx.showToast({ title: '请先注册企业', icon: 'none' })
      return
    }

    const enterpriseBalance = this.data.userInfo.enterprise_balance || 0
    this.setData({ 
      currentMode: 'enterprise',
      userTypeText: this.getUserTypeText(this.data.userInfo, 'enterprise'),
      currentBalance: (enterpriseBalance / 100).toFixed(2),
      rechargeButtonText: this.getRechargeButtonText('enterprise', this.data.isEnterpriseAdmin)
    })
    wx.setStorageSync('currentMode', 'enterprise')
  },

  // 切换到个人模式
  switchToPersonal() {
    const personalBalance = this.data.userInfo.balance || 0
    this.setData({ 
      currentMode: 'personal',
      userTypeText: this.getUserTypeText(this.data.userInfo, 'personal'),
      currentBalance: (personalBalance / 100).toFixed(2),
      rechargeButtonText: this.getRechargeButtonText('personal', this.data.isEnterpriseAdmin)
    })
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
    // 传递当前模式给充值页面
    wx.navigateTo({
      url: `/pages/recharge/recharge?mode=${this.data.currentMode}`
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
            currentMode: 'personal',
            userTypeText: '登录后享受更多功能',
            hasEnterprise: false,
            currentBalance: '0.00'
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

