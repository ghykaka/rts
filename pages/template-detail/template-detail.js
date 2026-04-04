// pages/template-detail/template-detail.js
const app = getApp()

Page({
  data: {
    template: null,
    templateFields: [],
    pricingList: [],
    selectedPrice: null,
    selectedRatio: '9:16',
    ratios: ['9:16', '3:4', '4:3', '1:1'],
    inputData: {},
    loading: false
  },

  onLoad(options) {
    const { id } = options
    if (id) {
      this.loadTemplateDetail(id)
    }
  },

  async loadTemplateDetail(templateId) {
    wx.showLoading({ title: '加载中...' })
    
    try {
      const db = wx.cloud.database()
      
      // 获取模板
      const templateRes = await db.collection('templates').doc(templateId).get()
      
      if (!templateRes.data) {
        wx.showToast({ title: '模板不存在', icon: 'none' })
        return
      }
      
      // 获取输入字段
      const fieldsRes = await db.collection('template_fields').where({
        template_id: templateId
      }).orderBy('sort', 'asc').get()
      
      // 获取定价
      const pricingRes = await db.collection('template_pricing').where({
        template_id: templateId,
        is_active: true
      }).get()
      
      console.log('template:', templateRes.data)
      console.log('fields:', fieldsRes.data)
      console.log('pricing:', pricingRes.data)
      
      this.setData({
        template: templateRes.data,
        templateFields: fieldsRes.data || [],
        pricingList: pricingRes.data || []
      })

      // 默认选中第一个定价
      if (pricingRes.data && pricingRes.data.length > 0) {
        this.setData({ selectedPrice: pricingRes.data[0] })
      }
    } catch (err) {
      console.error('loadTemplateDetail error:', err)
      wx.showToast({ title: '加载失败: ' + err.message, icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  // 选择比例
  selectRatio(e) {
    const { ratio } = e.currentTarget.dataset
    this.setData({ selectedRatio: ratio })
    
    // 查找对应定价
    const price = this.data.pricingList.find(p => p.aspect_ratio === ratio)
    if (price) {
      this.setData({ selectedPrice: price })
    }
  },

  // 输入变化
  inputChange(e) {
    const { key } = e.currentTarget.dataset
    const value = e.detail.value
    this.setData({
      [`inputData.${key}`]: value
    })
  },

  // 选择图片
  chooseImage(e) {
    const { key } = e.currentTarget.dataset
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: res => {
        const filePath = res.tempFiles[0].tempFilePath
        this.setData({
          [`inputData.${key}`]: filePath
        })
      }
    })
  },

  // 立即生成
  async generate() {
    if (!app.globalData.userId) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    if (!this.data.selectedPrice) {
      wx.showToast({ title: '请选择尺寸', icon: 'none' })
      return
    }

    wx.showModal({
      title: '确认生成',
      content: `将消耗 ¥${this.data.selectedPrice.balance_price / 100} 余额`,
      success: async modalRes => {
        if (modalRes.confirm) {
          await this.createOrder()
        }
      }
    })
  },

  async createOrder() {
    this.setData({ loading: true })
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'createOrder',
        data: {
          userId: app.globalData.userId,
          templateId: this.data.template._id,
          templateName: this.data.template.name,
          serviceType: this.data.template.output_type + '_generate',
          cozeWorkflowId: this.data.template.coze_workflow_id,
          inputParams: this.data.inputData,
          outputType: this.data.template.output_type,
          aspectRatio: this.data.selectedRatio,
          costType: 'balance'
        }
      })

      if (res.result.success) {
        wx.showToast({ title: '生成中...', icon: 'success' })
        setTimeout(() => {
          wx.switchTab({ url: '/pages/works/works' })
        }, 1500)
      } else {
        wx.showToast({ title: res.result.error, icon: 'none' })
      }
    } catch (err) {
      console.error('createOrder error:', err)
      wx.showToast({ title: '创建订单失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  }
})
