// pages/recharge-records/recharge-records.js
const app = getApp()

Page({
  data: {
    records: [],
    loading: true,
    loadingMore: false,
    hasMore: true,
    page: 1,
    pageSize: 20
  },

  onLoad() {
    this.loadRecords(true)
  },

  onShow() {
    // 每次进入页面都刷新
    this.loadRecords(true)
  },

  async loadRecords(reset = false) {
    const userId = wx.getStorageSync('userId')
    if (!userId) {
      this.setData({ loading: false, loadingMore: false })
      return
    }

    const page = reset ? 1 : this.data.page

    if (reset) {
      this.setData({ loading: true, records: [], page: 1, hasMore: true })
    } else {
      if (this.data.loadingMore || !this.data.hasMore) return
      this.setData({ loadingMore: true })
    }

    try {
      const res = await wx.cloud.callFunction({
        name: 'getRechargeRecords',
        data: { userId, page, pageSize: this.data.pageSize }
      })

      if (res.result && res.result.success) {
        const newRecords = res.result.data || []
        const allRecords = reset ? newRecords : [...this.data.records, ...newRecords]
        
        this.setData({
          records: allRecords,
          hasMore: res.result.hasMore,
          page: page + 1
        })
      } else {
        console.error('获取充值记录失败:', res.result?.error)
      }
    } catch (err) {
      console.error('loadRecords error:', err)
    } finally {
      this.setData({ loading: false, loadingMore: false })
    }
  },

  // 触底加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadRecords(false)
    }
  },

  // 复制微信单号
  copyTradeNo(e) {
    const tradeNo = e.currentTarget.dataset.no
    wx.setClipboardData({
      data: tradeNo,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'none' })
      }
    })
  }
})
