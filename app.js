// app.js
App({
  onLaunch() {
    // 初始化 CloudBase
    if (wx.cloud) {
      wx.cloud.init({
        env: 'liandaofutou-2gdayw0068d938b3'
      })
    }
    
    // 检查登录状态
    this.checkLoginStatus()
    
    // [调试模式] 暂时跳过登录检查
    // if (!this.globalData.isLogin) {
    //   wx.redirectTo({
    //     url: '/pages/login/login'
    //   })
    // }
  },

  globalData: {
    userInfo: null,
    userId: null,
    isLogin: false
  },

  // 检查登录状态
  checkLoginStatus() {
    const userId = wx.getStorageSync('userId')
    if (userId) {
      this.globalData.userId = userId
      this.globalData.isLogin = true
    }
  },

  // 保存用户信息
  setUserInfo(userInfo, userId) {
    this.globalData.userInfo = userInfo
    this.globalData.userId = userId
    this.globalData.isLogin = true
    wx.setStorageSync('userId', userId)
    wx.setStorageSync('userInfo', userInfo)
  },

  // 退出登录
  logout() {
    this.globalData.userInfo = null
    this.globalData.userId = null
    this.globalData.isLogin = false
    wx.removeStorageSync('userId')
    wx.removeStorageSync('userInfo')
  }
})
