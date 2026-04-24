// pages/login/login.js
const app = getApp()

Page({
  data: {
    loading: false,
    phoneLoading: false,
    agreeProtocol: false // 默认不同意服务协议
  },

  // 切换协议勾选状态
  toggleProtocol() {
    this.setData({
      agreeProtocol: !this.data.agreeProtocol
    })
  },

  // 查看服务协议
  viewProtocol() {
    wx.navigateTo({
      url: '/pages/article-detail/article-detail?id=c494286569e3273c000098d547eda5c2'
    })
  },

  onLoad(options) {
    // 保存 redirect 路径
    if (options.redirect) {
      this.redirectPath = decodeURIComponent(options.redirect)
    }
  },

  async getPhoneNumber(e) {
    if (this.data.phoneLoading) return

    // 检查是否同意协议
    if (!this.data.agreeProtocol) {
      wx.showToast({ title: '请阅读并同意服务协议', icon: 'none' })
      return
    }

    console.log('getPhoneNumber:', e.detail)

    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      if (e.detail.errMsg === 'getPhoneNumber:user deny') {
        wx.showToast({ title: '您取消了授权', icon: 'none' })
      } else {
        wx.showToast({ title: '授权失败，请重试', icon: 'none' })
      }
      return
    }

    this.setData({ phoneLoading: true })

    try {
      const loginRes = await wx.login()

      const res = await wx.cloud.callFunction({
        name: 'loginWithPhone',
        data: {
          code: loginRes.code,
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv
        }
      })

      if (res.result && res.result.success) {
        // 保存用户信息
        app.setUserInfo(res.result.data.userInfo, res.result.data.userId)

        // 通知上一页刷新（通过 eventChannel）
        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]
        if (prevPage) {
          prevPage.setData({
            isLogin: true,
            userInfo: res.result.data.userInfo,
            displayBalance: String(res.result.data.userInfo.balance || 0)  // 积分直接显示
          })
        }

        // 如果有 redirect 路径，跳转到指定页面；否则返回上一页
        if (this.redirectPath) {
          wx.reLaunch({ url: this.redirectPath })
        } else {
          wx.navigateBack()
        }
      } else {
        wx.showToast({ title: res.result.error || '登录失败', icon: 'none' })
      }
    } catch (err) {
      console.error('getPhoneNumber error:', err)
      wx.showToast({ title: '登录失败', icon: 'none' })
    } finally {
      this.setData({ phoneLoading: false })
    }
  }
})
