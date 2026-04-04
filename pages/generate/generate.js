// pages/generate/generate.js
const app = getApp()

Page({
  data: {
    // 模板信息
    templateId: '',
    templateName: '',
    templateCover: '',
    templateDesc: '',
    // 产品信息
    productId: '',
    productName: '',
    productImage: '',
    productDesc: '',
    // 表单数据
    selectedSize: '9:16',
    priceText: '',
    customText: '',
    qrCodeUrl: '',
    // 价格信息
    balancePrice: 80, // 默认0.8元,后续从模板定价获取
    displayPrice: '0.80',
    // 用户信息
    userBalance: 0,
    displayBalance: '0.00',
    // 状态
    generating: false,
    showSuccessTip: false,
    orderId: ''
  },

  onLoad(options) {
    // 获取传递的信息
    this.setData({
      templateId: options.templateId || '',
      templateName: decodeURIComponent(options.templateName || ''),
      templateCover: decodeURIComponent(options.templateCover || ''),
      templateDesc: decodeURIComponent(options.templateDesc || ''),
      productId: options.productId || '',
      productName: decodeURIComponent(options.productName || ''),
      productImage: decodeURIComponent(options.productImage || ''),
      productDesc: decodeURIComponent(options.productDesc || '')
    })

    wx.setNavigationBarTitle({
      title: '生成海报'
    })

    // 检查登录状态并获取用户信息
    this.checkLoginAndGetUserInfo()

    // 获取模板定价
    this.loadTemplatePricing()
  },

  // 检查登录并获取用户信息
  async checkLoginAndGetUserInfo() {
    let userId = wx.getStorageSync('userId')

    if (!userId) {
      // 测试模式：跳过登录检查
      console.log('测试模式：未登录，继续执行')
      userId = 'test_user'

      // 保存测试用户信息
      const testUserInfo = {
        nickname: '测试用户',
        avatar: '',
        user_type: 'personal',
        balance: 500
      }

      wx.setStorageSync('userId', userId)
      wx.setStorageSync('userInfo', testUserInfo)

      this.setData({
        userBalance: 500, // 测试余额
        displayBalance: '5.00'
      })
      return
    }

    try {
      const res = await wx.cloud.callFunction({
        name: 'getUserInfo',
        data: { userId }
      })

      if (res.result && res.result.success) {
        const balance = res.result.data.balance || 0
        this.setData({
          userBalance: balance,
          displayBalance: (balance / 100).toFixed(2)
        })
      }
    } catch (err) {
      console.error('getUserInfo error:', err)
    }
  },

  // 获取模板定价
  async loadTemplatePricing() {
    const db = wx.cloud.database()

    try {
      // 根据选择的尺寸查询定价
      const res = await db.collection('template_pricing')
        .where({
          template_id: this.data.templateId,
          aspect_ratio: this.data.selectedSize
        })
        .get()

      let price = this.data.balancePrice
      if (res.data && res.data.length > 0) {
        price = res.data[0].balance_price || 80
      }

      this.setData({
        balancePrice: price,
        displayPrice: (price / 100).toFixed(2)
      })
    } catch (err) {
      console.error('loadTemplatePricing error:', err)
      // 如果查询失败，使用默认价格
      this.setData({
        displayPrice: (this.data.balancePrice / 100).toFixed(2)
      })
    }
  },

  // 选择尺寸
  selectSize(e) {
    const size = e.currentTarget.dataset.size
    this.setData({ selectedSize: size })
    this.loadTemplatePricing()
  },

  // 价格文案输入
  onPriceTextInput(e) {
    this.setData({ priceText: e.detail.value })
  },

  // 自定义文案输入
  onCustomTextInput(e) {
    this.setData({ customText: e.detail.value })
  },

  // 上传二维码
  uploadQrCode() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const filePath = res.tempFilePaths[0]

        wx.showLoading({ title: '上传中...' })

        // 上传到云存储
        const cloudPath = `qrcodes/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`

        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: (uploadRes) => {
            this.setData({
              qrCodeUrl: uploadRes.fileID
            })
            wx.hideLoading()
          },
          fail: (err) => {
            console.error('uploadQrCode error:', err)
            wx.hideLoading()
            wx.showToast({
              title: '上传失败',
              icon: 'none'
            })
          }
        })
      }
    })
  },

  // 生成
  async generate() {
    // 检查登录（测试模式：注释掉）
    // const userId = wx.getStorageSync('userId')
    // if (!userId) {
    //   wx.showToast({
    //     title: '请先登录',
    //     icon: 'none'
    //   })
    //   return
    // }

    // 检查余额（测试模式：注释掉）
    // if (this.data.userBalance < this.data.balancePrice) {
    //   wx.showModal({
    //     title: '余额不足',
    //     content: '请充值后继续',
    //     confirmText: '去充值',
    //     success: (res) => {
    //       if (res.confirm) {
    //         wx.navigateTo({
    //           url: '/pages/recharge/recharge'
    //         })
    //       }
    //     }
    //   })
    //   return
    // }

    this.setData({ generating: true })
    wx.showLoading({ title: '正在生成...' })

    try {
      const db = wx.cloud.database()
      let userId = wx.getStorageSync('userId')

      // 如果没有用户ID,使用测试用户并保存到 storage
      if (!userId) {
        userId = 'test_user'
        wx.setStorageSync('userId', userId)
      }

      console.log('开始创建订单,userId:', userId)

      // 创建订单数据
      const orderData = {
        user_id: userId,
        template_id: this.data.templateId,
        template_name: this.data.templateName,
        template_cover: this.data.templateCover,
        product_id: this.data.productId,
        product_name: this.data.productName,
        product_image: this.data.productImage,
        aspect_ratio: this.data.selectedSize,
        price_text: this.data.priceText,
        custom_text: this.data.customText,
        qr_code_url: this.data.qrCodeUrl,
        balance_price: this.data.balancePrice,
        status: 'generating', // 生成中
        poster_url: '', // 生成完成后填充
        create_time: db.serverDate(),
        update_time: db.serverDate()
      }

      console.log('订单数据:', orderData)

      // 写入订单到数据库
      const res = await db.collection('orders').add({
        data: orderData
      })

      const orderId = res._id
      console.log('订单创建成功,orderId:', orderId)

      // 模拟生成过程延迟
      await new Promise(resolve => setTimeout(resolve, 2000))

      wx.hideLoading()

      this.setData({
        generating: false,
        showSuccessTip: true,
        orderId: orderId
      })

      wx.showToast({
        title: '生成任务已提交',
        icon: 'success'
      })
    } catch (err) {
      console.error('generate error:', err)
      wx.hideLoading()
      this.setData({ generating: false })
      wx.showToast({
        title: '生成失败，请重试',
        icon: 'none'
      })
    }
  },

  // 跳转到作品仓库
  goToWorks() {
    wx.switchTab({
      url: '/pages/works/works'
    })
  },

  // 跳转充值
  goRecharge() {
    wx.navigateTo({
      url: '/pages/recharge/recharge'
    })
  }
})
