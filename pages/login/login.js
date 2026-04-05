// pages/login/login.js
const app = getApp()

Page({
  data: {
    loading: false,
    phoneLoading: false,
    agreeProtocol: true // 默认同意服务协议
  },

  // 切换协议勾选状态
  toggleProtocol() {
    this.setData({
      agreeProtocol: !this.data.agreeProtocol
    })
  },

  // 查看服务协议（后续链接到文章页面）
  viewProtocol() {
    // TODO: 后续跳转到文章详情页
    wx.showToast({ title: '服务协议页面开发中', icon: 'none' })
  },

  async getPhoneNumber(e) {
    if (this.data.phoneLoading) return
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

        // 立即返回，不等待 toast
        wx.navigateBack()

        // 通知上一页刷新（通过 eventChannel）
        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]
        if (prevPage) {
          prevPage.setData({
            isLogin: true,
            userInfo: res.result.data.userInfo,
            displayBalance: (res.result.data.userInfo.balance / 100).toFixed(2)
          })
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
