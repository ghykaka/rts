// pages/order-detail/order-detail.js
Page({
  data: {
    orderId: '',
    detail: null,
    loading: false
  },

  onLoad(options) {
    console.log('order-detail onLoad:', options)
    if (options.orderId) {
      this.setData({ orderId: options.orderId })
      this.loadOrderDetail()
    }
  },

  onShow() {
    // 如果订单在生成中，刷新状态
    if (this.data.detail && (this.data.detail.status === 'processing' || this.data.detail.status === 'pending')) {
      this.loadOrderDetail()
    }
  },

  async loadOrderDetail() {
    const userId = wx.getStorageSync('userId')
    
    if (!userId || !this.data.orderId) {
      wx.showToast({ title: '参数错误', icon: 'none' })
      return
    }

    this.setData({ loading: true })

    try {
      const res = await wx.cloud.callFunction({
        name: 'getOrderDetail',
        data: {
          orderId: this.data.orderId,
          userId
        }
      })

      const result = res.result || {}

      if (result.success) {
        // 调试：打印返回的时间数据
        console.log('订单详情返回数据:', JSON.stringify(result.data, null, 2))
        console.log('createdAtRaw:', result.data.createdAtRaw)
        console.log('completedAtRaw:', result.data.completedAtRaw)
        console.log('createdAt:', result.data.createdAt)
        console.log('completedAt:', result.data.completedAt)
        // 直接使用云函数返回的数据（已包含过滤后的 inputParamsArray）
        this.setData({ detail: result.data })
      } else {
        wx.showToast({ title: result.error || '获取详情失败', icon: 'none' })
      }
    } catch (err) {
      console.error('loadOrderDetail error:', err)
      wx.showToast({ title: '获取详情失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 预览图片
  previewImage(e) {
    const { url } = e.currentTarget.dataset
    if (!url) return

    wx.previewImage({
      current: url,
      urls: [url]
    })
  },

  // 下载图片或视频
  downloadImage(e) {
    const { url, type } = e.currentTarget.dataset
    if (!url) {
      wx.showToast({ title: '暂无文件', icon: 'none' })
      return
    }

    const isVideo = type === 'video' || /\.(mp4|avi|mov|wmv|flv|mkv|webm|3gp)\?*/i.test(url)

    wx.showLoading({ title: '下载中...' })

    wx.downloadFile({
      url: url,
      success: res => {
        if (res.statusCode !== 200) {
          wx.hideLoading()
          wx.showToast({ title: '下载失败', icon: 'none' })
          return
        }

        if (isVideo) {
          // 保存视频到相册
          wx.saveVideoToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.showToast({ title: '已保存到相册', icon: 'success' })
            },
            fail: err => {
              if (err.errMsg.includes('auth deny')) {
                wx.showModal({
                  title: '提示',
                  content: '需要授权保存视频到相册',
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
        } else {
          // 保存图片到相册
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
        }
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

  // 计算累计用时（支持原始时间戳或格式化时间字符串）
  getDuration(startTime, endTime) {
    console.log('getDuration 被调用:', { startTime, endTime })
    
    // 如果没有传参数，尝试从 detail 中获取
    if (!startTime || !endTime) {
      const detail = this.data.detail
      startTime = detail?.createdAtRaw || detail?.createdAt
      endTime = detail?.completedAtRaw || detail?.completedAt
      console.log('从 detail 获取时间:', { startTime, endTime })
    }
    
    if (!startTime || !endTime) {
      console.log('时间参数为空')
      return ''
    }
    
    try {
      // 尝试直接解析为时间戳
      let start = new Date(startTime)
      let end = new Date(endTime)
      
      // 如果解析失败，尝试替换分隔符
      if (isNaN(start.getTime())) {
        start = new Date(String(startTime).replace(/\//g, '-'))
      }
      if (isNaN(end.getTime())) {
        end = new Date(String(endTime).replace(/\//g, '-'))
      }
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.log('时间解析失败')
        return ''
      }
      
      const diff = end.getTime() - start.getTime()
      console.log('时间差(毫秒):', diff)
      
      return this.formatDuration(diff)
    } catch (e) {
      console.error('计算用时出错:', e)
      return ''
    }
  },
  
  // 格式化毫秒为人类可读时间
  formatDuration(diffMs) {
    console.log('formatDuration 输入:', diffMs)
    if (!diffMs || diffMs <= 0) return ''
    const seconds = Math.floor(diffMs / 1000)
    if (seconds < 60) return `${seconds}秒`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes < 60) return `${minutes}分${remainingSeconds}秒`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}时${remainingMinutes}分`
  }
})
