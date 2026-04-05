// pages/recharge/recharge.js
const app = getApp()

Page({
  data: {
    type: 'personal', // personal / enterprise
    amounts: [0.01, 1, 10, 50, 100, 200, 500, 1000],
    selectedAmount: 0.01,
    loading: false
  },

  onLoad(options) {
    const { type } = options
    if (type) {
      this.setData({ type })
    }
  },

  selectAmount(e) {
    const { amount } = e.currentTarget.dataset
    this.setData({ selectedAmount: amount })
  },

  async recharge() {
    if (!app.globalData.userId) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    this.setData({ loading: true })

    try {
      // 调用微信支付
      const res = await wx.cloud.callFunction({
        name: 'createRecharge',
        data: {
          userId: app.globalData.userId,
          amount: this.data.selectedAmount,
          type: this.data.type
        }
      })

      if (res.result.success) {
        // 调用微信支付
        await wx.requestPayment({
          timeStamp: res.result.data.timeStamp,
          nonceStr: res.result.data.nonceStr,
          package: res.result.data.package,
          signType: 'MD5',
          paySign: res.result.data.paySign,
          success: async () => {
            // 支付成功后，主动更新余额
            wx.showLoading({ title: '处理中...' })
            try {
              const result = await wx.cloud.callFunction({
                name: 'confirmRecharge',
                data: {
                  outTradeNo: res.result.outTradeNo
                }
              })
              wx.hideLoading()
              
              // 如果充值成功，更新全局用户数据和本地缓存
              if (result.result.success && app.globalData.userInfo) {
                // 获取最新余额
                const userRes = await wx.cloud.callFunction({
                  name: 'getUserInfo',
                  data: {
                    userId: app.globalData.userId
                  }
                })
                if (userRes.result.success) {
                  // 更新内存中的数据
                  app.globalData.userInfo.balance = userRes.result.data.balance
                  // 更新本地缓存（重要！其他页面从缓存读取余额）
                  wx.setStorageSync('userInfo', app.globalData.userInfo)
                }
              }
              
              wx.showToast({ title: '充值成功', icon: 'success' })
            } catch (err) {
              wx.hideLoading()
              console.error('确认充值失败:', err)
              wx.showToast({ title: '充值成功，余额稍后更新', icon: 'none' })
            }
            setTimeout(() => {
              wx.navigateBack()
            }, 1500)
          },
          fail: err => {
            if (err.errMsg.includes('cancel')) {
              wx.showToast({ title: '已取消支付', icon: 'none' })
            } else {
              wx.showToast({ title: '支付失败', icon: 'none' })
            }
          }
        })
      } else {
        wx.showToast({ title: res.result.error, icon: 'none' })
      }
    } catch (err) {
      console.error('recharge error:', err)
      wx.showToast({ title: '充值失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  }
})
