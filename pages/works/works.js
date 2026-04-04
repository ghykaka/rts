// pages/works/works.js
const app = getApp()

Page({
  data: {
    tabs: ['全部', '生成中', '已完成', '失败'],
    currentTab: 0,
    orderList: [],
    pendingCount: 0,
    completedCount: 0,
    failedCount: 0,
    loading: false,
    page: 1,
    hasMore: true
  },

  onLoad() {
    this.loadOrders()
  },

  onShow() {
    // 每次显示都刷新订单,特别是生成中的任务
    this.refreshOrders()
  },

  // 刷新订单
  async refreshOrders() {
    this.setData({ page: 1, orderList: [] })
    await this.loadOrders()

    // 如果有生成中的订单,定时刷新
    if (this.data.pendingCount > 0) {
      this.startAutoRefresh()
    }
  },

  // 开始自动刷新
  startAutoRefresh() {
    // 清除之前的定时器
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }

    // 每5秒刷新一次
    this.refreshTimer = setInterval(() => {
      if (this.data.pendingCount > 0) {
        this.refreshOrders()
      } else {
        // 没有生成中的订单了,停止刷新
        this.stopAutoRefresh()
      }
    }, 5000)
  },

  // 停止自动刷新
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  },

  onUnload() {
    // 页面卸载时清除定时器
    this.stopAutoRefresh()
  },

  // 切换Tab
  switchTab(e) {
    const { index } = e.currentTarget.dataset
    this.setData({
      currentTab: index,
      page: 1,
      orderList: []
    })
    this.loadOrders()
  },

  // 加载订单
  async loadOrders() {
    const userId = wx.getStorageSync('userId')
    console.log('loadOrders - userId:', userId)

    if (!userId) {
      this.setData({ orderList: [] })
      return
    }

    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const db = wx.cloud.database()
      const statusFilter = this.getStatusFilter()

      console.log('loadOrders - statusFilter:', statusFilter)

      // 构建查询条件
      const query = {
        user_id: userId
      }

      // 如果有状态筛选,添加状态条件
      if (statusFilter) {
        query.status = statusFilter
      }

      console.log('loadOrders - query:', query)

      // 查询订单
      const res = await db.collection('orders')
        .where(query)
        .orderBy('create_time', 'desc')
        .limit(20)
        .get()

      const orders = res.data || []
      console.log('loadOrders - 查询到订单数量:', orders.length)
      console.log('loadOrders - 订单数据:', orders)

      // 格式化订单数据
      const formattedOrders = orders.map(order => {
        return {
          ...order,
          displayPrice: ((order.balance_price || 0) / 100).toFixed(2),
          displayTime: this.formatTime(order.create_time)
        }
      })

      // 统计各状态数量
      this.countOrders(formattedOrders)

      this.setData({
        orderList: formattedOrders,
        hasMore: false
      })
    } catch (err) {
      console.error('loadOrders error:', err)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 统计订单数量
  countOrders(orders) {
    let pending = 0, completed = 0, failed = 0
    orders.forEach(order => {
      if (order.status === 'generating') pending++
      else if (order.status === 'completed') completed++
      else if (order.status === 'failed') failed++
    })
    this.setData({
      pendingCount: pending,
      completedCount: completed,
      failedCount: failed
    })
  },

  // 获取状态筛选
  getStatusFilter() {
    const map = {
      0: '', // 全部
      1: 'generating', // 生成中
      2: 'completed', // 已完成
      3: 'failed' // 失败
    }
    return map[this.data.currentTab]
  },

  // 获取Tab徽章数量
  getTabBadge(index) {
    if (index === 1) return this.data.pendingCount
    if (index === 2) return this.data.completedCount
    if (index === 3) return this.data.failedCount
    return 0
  },

  // 格式化时间
  formatTime(timeStr) {
    if (!timeStr) return ''

    console.log('formatTime - timeStr:', timeStr)

    // 如果是 Date 对象或服务器时间对象
    let date
    if (timeStr.$date) {
      date = new Date(timeStr.$date)
    } else {
      date = new Date(timeStr)
    }

    console.log('formatTime - date:', date)

    const now = new Date()

    // 如果是今天
    if (date.toDateString() === now.toDateString()) {
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const result = `今天 ${hours}:${minutes}`
      console.log('formatTime - result:', result)
      return result
    }

    // 如果是昨天
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `昨天 ${hours}:${minutes}`
    }

    // 其他日期
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${month}-${day}`
  },

  // 查看订单详情
  viewOrderDetail(e) {
    const item = e.currentTarget.dataset.item

    // 如果是已完成且有输出URL,可以预览图片
    if (item.status === 'completed' && item.output_url) {
      wx.previewImage({
        current: item.output_url,
        urls: [item.output_url]
      })
    }
  },

  // 下载作品
  downloadFile(url) {
    if (!url) return

    wx.showLoading({ title: '下载中...' })

    wx.downloadFile({
      url: url,
      success: res => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            wx.showToast({ title: '已保存到相册', icon: 'success' })
          },
          fail: err => {
            if (err.errMsg.includes('auth deny')) {
              wx.showModal({
                title: '提示',
                content: '需要授权保存到相册',
                success: modalRes => {
                  if (modalRes.confirm) {
                    wx.openSetting()
                  }
                }
              })
            } else {
              wx.showToast({ title: '保存失败', icon: 'none' })
            }
          }
        })
      },
      fail: () => {
        wx.showToast({ title: '下载失败', icon: 'none' })
      }
    })
  },

  // 去首页创作
  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 上拉加载
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 })
      this.loadOrders()
    }
  }
})
