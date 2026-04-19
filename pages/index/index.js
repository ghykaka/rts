// pages/index/index.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    isLogin: false,
    displayBalance: '0.00',
    // 首页配置组件
    homeConfigs: [],
    loading: false
  },

  onLoad() {
    this.checkLogin()
    this.loadHomeConfigs()
  },

  onShow() {
    // 每次显示页面时检查登录状态
    const userId = wx.getStorageSync('userId')
    if (userId) {
      this.getUserInfo()
    } else {
      // 未登录，重置状态
      this.setData({
        isLogin: false,
        userInfo: null,
        displayBalance: '0.00'
      })
    }
  },

  checkLogin() {
    const userId = wx.getStorageSync('userId')
    const userInfo = wx.getStorageSync('userInfo')

    if (userId && userInfo) {
      this.setData({
        userInfo: userInfo,
        isLogin: true,
        displayBalance: ((userInfo.balance || 0) / 100).toFixed(2)
      })
    }
  },

  // 加载首页配置
  async loadHomeConfigs() {
    this.setData({ loading: true })

    try {
      const res = await wx.cloud.callFunction({
        name: 'adminproxy',
        data: {
          action: 'adminhomeconfig',
          data: { action: 'getClient' }
        }
      })

      console.log('首页配置返回:', res)

      if (res.result && res.result.success) {
        const configs = res.result.data || []
        console.log('配置数据:', configs)
        
        // 处理瀑布流组件的模板数据
        configs.forEach(config => {
          if ((config.componentType === 'waterfall' || config.componentType === '瀑布流') && config.templates) {
            config.templates = config.templates.map(t => ({
              ...t,
              displayPrice: ((t.min_price || (t.generate_price && t.generate_price.cash_price) || 80) / 100).toFixed(2)
            }))
          }
        })
        
        this.setData({
          homeConfigs: configs
        })
      } else {
        console.log('接口返回失败:', res.result)
      }
    } catch (err) {
      console.error('loadHomeConfigs error:', err)
    } finally {
      this.setData({ loading: false })
    }
  },

  async getUserInfo() {
    const userId = wx.getStorageSync('userId')
    if (!userId) {
      this.setData({
        isLogin: false,
        userInfo: null,
        displayBalance: '0.00'
      })
      return
    }

    try {
      const res = await wx.cloud.callFunction({
        name: 'getUserInfo',
        data: { userId }
      })

      if (res.result && res.result.success) {
        const userInfo = res.result.data
        wx.setStorageSync('userInfo', userInfo)
        app.globalData.userInfo = userInfo
        
        this.setData({
          userInfo: userInfo,
          isLogin: true,
          displayBalance: ((userInfo.balance || 0) / 100).toFixed(2)
        })
      } else {
        this.setData({
          isLogin: false,
          userInfo: null,
          displayBalance: '0.00'
        })
      }
    } catch (err) {
      console.error('getUserInfo error:', err)
    }
  },

  wxLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 跳转模板详情
  goTemplateDetail(e) {
    const { id, name, cover, desc, needmaterial, functionid } = e.currentTarget.dataset
    console.log('goTemplateDetail:', { id, name, cover, desc, needmaterial, functionid })
    
    // 根据模板的 needMaterial 决定跳转
    if (needmaterial === true || needmaterial === 'true') {
      // 需要关联素材，跳转到素材选择页（带上 functionId）
      wx.navigateTo({
        url: `/pages/product-select/product-select?templateId=${id}&templateName=${encodeURIComponent(name || '')}&templateCover=${encodeURIComponent(cover || '')}&templateDesc=${encodeURIComponent(desc || '')}&functionId=${functionid || ''}`
      })
    } else {
      // 不需要关联素材，直接跳转到生成页（带上 functionId）
      wx.navigateTo({
        url: `/pages/generate/generate?templateId=${id}&templateName=${encodeURIComponent(name || '')}&templateCover=${encodeURIComponent(cover || '')}&templateDesc=${encodeURIComponent(desc || '')}&functionId=${functionid || ''}`
      })
    }
  },

  // 跳转模板列表
  goTemplateList(e) {
    const { name, categoryid } = e.currentTarget.dataset
    const url = `/pages/template-list/template-list?name=${encodeURIComponent(name || '')}&categoryId=${categoryid || ''}`
    wx.navigateTo({ url })
  },

  // 跳转功能页（根据 flow_steps 直接跳转到正确页面）
  async goFunctionPage(e) {
    const { url, id, name, linktype } = e.currentTarget.dataset
    
    // linktype === 'function' 或有 id 时，获取功能配置决定跳转
    if (linktype === 'function' || id) {
      const functionId = id || url
      const functionName = name || ''
      
      // 先显示 loading 遮罩
      wx.showLoading({ title: '加载中...', mask: true })
      
      // 超时 Promise（3秒超时，避免用户等太久）
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), 3000)
      })
      
      try {
        const cloudCallPromise = wx.cloud.callFunction({
          name: 'getWorkflowFunctionDetail',
          data: { functionId }
        })
        
        const res = await Promise.race([cloudCallPromise, timeoutPromise])
        
        if (res.result && res.result.success) {
          const func = res.result.data
          const flowSteps = func.workflow_product?.flow_steps || {}
          
          wx.hideLoading()
          
          if (flowSteps.step1_select_style) {
            // 有 step1，跳转到模板列表
            wx.navigateTo({
              url: `/pages/template-list/template-list?functionId=${functionId}&functionName=${encodeURIComponent(functionName)}`
            })
          } else if (flowSteps.step2_materials) {
            // 无 step1 但有 step2，跳转到素材选择
            wx.navigateTo({
              url: `/pages/product-select/product-select?functionId=${functionId}&templateId=&templateName=${encodeURIComponent(functionName)}`
            })
          } else if (flowSteps.step3_input) {
            // 只有 step3，直接跳转到生成页
            wx.navigateTo({
              url: `/pages/generate/generate?functionId=${functionId}&functionName=${encodeURIComponent(functionName)}`
            })
          } else {
            // 默认跳转到模板列表
            wx.navigateTo({
              url: `/pages/template-list/template-list?functionId=${functionId}&functionName=${encodeURIComponent(functionName)}`
            })
          }
        } else {
          wx.hideLoading()
          // 获取配置失败，降级到模板列表页
          wx.navigateTo({
            url: `/pages/template-list/template-list?functionId=${functionId}&functionName=${encodeURIComponent(functionName)}`
          })
        }
      } catch (err) {
        console.error('goFunctionPage error:', err)
        wx.hideLoading()
        // 超时或失败，降级到模板列表页
        wx.navigateTo({
          url: `/pages/template-list/template-list?functionId=${functionId}&functionName=${encodeURIComponent(functionName)}`
        })
      }
      return
    }
    
    // 其他情况直接跳转
    if (url) {
      wx.navigateTo({ url })
    }
  },

  // 跳转我的
  goProfile() {
    wx.switchTab({
      url: '/pages/profile/profile'
    })
  },

  // 跳转充值
  goRecharge() {
    wx.navigateTo({
      url: '/pages/recharge/recharge'
    })
  },

  // 跳转初始化数据页(开发用)
  goInitData() {
    wx.navigateTo({
      url: '/pages/init-data/init-data'
    })
  },

  // 跳转添加模板页(开发用)
  goAddTemplates() {
    wx.navigateTo({
      url: '/pages/add-templates/add-templates'
    })
  }
})
