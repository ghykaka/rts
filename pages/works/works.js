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
    pageSize: 10,
    hasMore: true
  },

  onLoad() {
    this.loadOrders()
  },

  onShow() {
    this.refreshOrders()
  },

  // 刷新订单
  async refreshOrders() {
    this.setData({ page: 1, orderList: [] })
    await this.loadOrders()

    // 如果有生成中的订单，定时刷新
    if (this.data.pendingCount > 0) {
      this.startAutoRefresh()
    }
  },

  // 开始自动刷新
  startAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }

    this.refreshTimer = setInterval(() => {
      if (this.data.pendingCount > 0) {
        this.refreshOrders()
      } else {
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
    this.stopAutoRefresh()
  },

  // 解析输出结果获取所有图片
  parseOutputImages(outputResult, workflowProductId) {
    if (!outputResult) return []
    
    let data = outputResult
    // 如果是字符串，尝试解析
    if (typeof outputResult === 'string') {
      try {
        data = JSON.parse(outputResult)
      } catch (e) {
        // 如果是直接URL
        if (outputResult.startsWith('http')) {
          return [outputResult]
        }
        return []
      }
    }
    
    const imageUrls = []
    
    // 优先从 data 字段获取（Coze API 返回格式）
    const resultData = data.data || data
    
    // 如果是对象，遍历所有值
    if (typeof resultData === 'object' && resultData !== null) {
      for (const key of Object.keys(resultData)) {
        const value = resultData[key]
        // 收集所有 http 开头的值
        if (value && typeof value === 'string' && value.startsWith('http')) {
          imageUrls.push(value)
        }
      }
    }
    
    return imageUrls
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

    if (!userId) {
      this.setData({ orderList: [] })
      return
    }

    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const res = await wx.cloud.callFunction({
        name: 'getUserOrders',
        data: {
          userId,
          page: this.data.page,
          pageSize: this.data.pageSize,
          status: this.getStatusFilter()
        }
      })

      const result = res.result || {}

      if (result.success) {
        const orders = result.data || []
        
        // 格式化订单数据
        const formattedOrders = orders.map(order => {
          // 解析 outputResult 获取图片列表
          const imageUrls = this.parseOutputImages(order.outputResult, order.outputResult)
          
          return {
            ...order,
            costAmount: order.costAmount,  // 单位已是元
            statusClass: this.getStatusClass(order.status),
            statusText: this.getStatusText(order.status),
            previewImages: imageUrls,  // 图片列表
            previewCount: imageUrls.length  // 图片数量
          }
        })

        // 统计各状态数量（全部时）
        if (this.data.currentTab === 0) {
          this.countOrders(orders)
        }

        // 合并数据（分页）
        const newList = this.data.page === 1 
          ? formattedOrders 
          : [...this.data.orderList, ...formattedOrders]

        this.setData({
          orderList: newList,
          hasMore: result.hasMore
        })
      }
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
      if (order.status === 'pending' || order.status === 'processing') pending++
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
      1: 'processing', // 生成中
      2: 'completed', // 已完成
      3: 'failed' // 失败
    }
    return map[this.data.currentTab]
  },

  // 获取状态样式
  getStatusClass(status) {
    const map = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'completed': 'status-completed',
      'failed': 'status-failed'
    }
    return map[status] || 'status-default'
  },

  // 获取状态文本
  getStatusText(status) {
    const map = {
      'pending': '等待处理',
      'processing': '生成中',
      'completed': '已完成',
      'failed': '生成失败'
    }
    return map[status] || '未知'
  },

  // 查看订单详情
  viewOrderDetail(e) {
    const { orderid } = e.currentTarget.dataset

    wx.navigateTo({
      url: `/pages/order-detail/order-detail?orderId=${orderid}`
    })
  },

  // 下载作品
  downloadFile(e) {
    const { url } = e.currentTarget.dataset
    if (!url) {
      wx.showToast({ title: '暂无作品', icon: 'none' })
      return
    }

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

  // 复制文案
  copyText(e) {
    const { text } = e.currentTarget.dataset
    if (!text) {
      wx.showToast({ title: '暂无文案', icon: 'none' })
      return
    }

    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' })
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
