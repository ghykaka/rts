// pages/login/login.js
const app = getApp()

Page({
  data: {
    loading: false,
    phoneLoading: false
  },

  async wxLogin() {
    if (this.data.loading) return
    this.setData({ loading: true })

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
        wx.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        wx.showToast({ title: res.result.error || '登录失败', icon: 'none' })
      }
    } catch (err) {
      console.error('wxLogin error:', err)
      wx.showToast({ title: '登录失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
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

      if (res.result.success) {
        app.setUserInfo(res.result.data.userInfo, res.result.data.userId)
        wx.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
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
