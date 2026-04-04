// pages/recharge/recharge.js
const app = getApp()

Page({
  data: {
    type: 'personal', // personal / enterprise
    amounts: [50, 100, 200, 500, 1000],
    selectedAmount: 100,
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
          success: () => {
            wx.showToast({ title: '充值成功', icon: 'success' })
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
