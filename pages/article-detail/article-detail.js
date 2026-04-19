// pages/article-detail/article-detail.js
Page({
  data: {
    article: null,
    loading: true,
    error: '',
    contentImages: []
  },

  onLoad(options) {
    const { id } = options
    if (id) {
      this.loadArticle(id)
    } else {
      this.setData({
        loading: false,
        error: '文章ID不存在'
      })
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  },

  // 提取内容中的图片
  extractImages(content) {
    if (!content) return []
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
    const images = []
    let match
    while ((match = imgRegex.exec(content)) !== null) {
      images.push(match[1])
    }
    return images
  },

  // 预览图片
  previewImage(e) {
    const { index } = e.currentTarget.dataset
    const images = this.data.contentImages
    if (images.length > 0) {
      wx.previewImage({
        current: images[index],
        urls: images
      })
    }
  },

  async loadArticle(id) {
    wx.showLoading({ title: '加载中...' })

    try {
      const res = await wx.cloud.callFunction({
        name: 'getArticle',
        data: { id }
      })

      wx.hideLoading()

      if (res.result && res.result.success) {
        const article = res.result.data
        const contentImages = this.extractImages(article.content)

        this.setData({
          article,
          contentImages,
          loading: false
        })

        // 用文章标题设置导航栏
        if (article.title) {
          wx.setNavigationBarTitle({ title: article.title })
        }
      } else {
        this.setData({
          loading: false,
          error: res.result?.error || '获取文章失败'
        })
      }
    } catch (err) {
      console.error('loadArticle error:', err)
      wx.hideLoading()
      this.setData({
        loading: false,
        error: '网络错误，请稍后重试'
      })
    }
  }
})
