// pages/recharge-records/recharge-records.js
const app = getApp()

Page({
  data: {
    records: [],
    loading: true
  },

  onLoad() {
    this.loadRecords()
  },

  onShow() {
    // 每次进入页面都刷新
    this.loadRecords()
  },

  async loadRecords() {
    const userId = wx.getStorageSync('userId')
    if (!userId) {
      this.setData({ loading: false })
      return
    }

    this.setData({ loading: true })

    try {
      const res = await wx.cloud.callFunction({
        name: 'getRechargeRecords',
        data: { userId }
      })

      if (res.result && res.result.success) {
        this.setData({
          records: res.result.data || []
        })
      } else {
        console.error('获取充值记录失败:', res.result?.error)
      }
    } catch (err) {
      console.error('loadRecords error:', err)
    } finally {
      this.setData({ loading: false })
    }
  }
})
