// pages/template-list/template-list.js
const app = getApp()

Page({
  data: {
    // 行业相关
    industries: [],           // 所有行业列表（按后台排序）
    userIndustries: [],      // 用户所属企业的行业列表（排在最前面）
    otherIndustries: [],     // 其他行业（排除企业行业，按后台排序）
    currentIndustry: '',      // 当前选中的行业（为空表示全部）
    showMoreIndustries: false, // 是否展开显示更多行业
    isLogin: false,           // 是否已登录
    isEnterprise: false,      // 是否企业用户
    
    // 分类相关
    categories: [],           // 一级分类列表
    subCategories: [],        // 当前一级分类下的二级分类
    currentCategory1: '',     // 当前选中的一级分类ID
    currentCategory2: '',     // 当前选中的二级分类ID
    
    // 功能相关
    functionName: '',         // 功能名称（从首页入口带入）
    
    // 模板相关
    templates: [],
    column0: [],
    column1: [],
    column2: [],
    loading: false,
    page: 1,
    pageSize: 20,
    hasMore: true,
    
    // 图片懒加载
    loadedImages: {}  // 已加载图片的索引
  },

  onLoad(options) {
    // 保存功能ID参数（如果不需要显示模板列表，直接跳转到生成页）
    if (options.functionId) {
      this.functionId = options.functionId
      const functionName = decodeURIComponent(options.functionName || '')
      this.functionName = functionName
      
      // 设置页面data中的functionName，用于wxml显示
      this.setData({ functionName })
      
      // 设置标题格式："功能名称 - 选择模板"
      wx.setNavigationBarTitle({
        title: `${functionName || '模板'} - 选择模板`
      })
      
      // 调用云函数获取功能配置，决定跳转逻辑
      this.loadFunctionConfig(options.functionId)
    } else {
      // 没有功能ID，使用传入的名称作为标题
      if (options.name) {
        const name = decodeURIComponent(options.name)
        wx.setNavigationBarTitle({
          title: name
        })
      }
    }

    // 保存 redirect 参数，用于回调模式
    if (options.redirect === 'generate-flow') {
      this.redirectTo = 'generate-flow'
    } else {
      this.redirectTo = null
    }

    // 保存预选的模板ID（从首页跳转时带入）
    if (options.templateId) {
      this.preselectedTemplateId = options.templateId
    }

    this.loadInitialData()
  },

  onShow() {
    // 每次显示页面时刷新用户状态
    this.checkLoginAndLoadIndustries()
  },

  // 加载功能配置（带超时处理）
  async loadFunctionConfig(functionId) {
    // 超时 Promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('timeout')), 5000) // 5秒超时
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
        
        // 保存功能配置
        this.flowSteps = flowSteps
        this.functionDetail = func
        
        // 根据 flow_steps 决定是否需要选模板
        if (!flowSteps.step1_select_style) {
          // 不需要选模板，直接跳转到素材选择或生成页
          if (flowSteps.step2_materials) {
            wx.redirectTo({
              url: `/pages/product-select/product-select?functionId=${functionId}&templateId=&templateName=${encodeURIComponent(this.functionName || '')}`
            })
          } else if (flowSteps.step3_input) {
            wx.redirectTo({
              url: `/pages/generate/generate?functionId=${functionId}&functionName=${encodeURIComponent(this.functionName || '')}`
            })
          }
        }
        // 有 step1 时，不跳转，继续显示模板列表
      } else {
        console.error('加载功能配置失败:', res.result?.error)
        // 失败时显示模板列表
      }
    } catch (err) {
      console.error('loadFunctionConfig error:', err)
      // 超时或失败时，显示模板列表
    }
  },

  // 检查登录状态并加载行业数据
  async checkLoginAndLoadIndustries() {
    const userId = wx.getStorageSync('userId')
    const isLogin = !!userId
    
    this.setData({ isLogin })
    
    if (isLogin) {
      await this.loadUserIndustries()
    } else {
      // 未登录，加载所有行业
      await this.loadIndustries()
    }
  },

  // 加载初始数据
  async loadInitialData() {
    wx.showLoading({ title: '加载中...' })
    
    try {
      const userId = wx.getStorageSync('userId')
      const isLogin = !!userId
      
      this.setData({ isLogin })
      
      // 如果已登录，先加载用户企业行业，然后加载所有行业
      if (isLogin) {
        await this.loadUserIndustries()
      } else {
        // 未登录也加载所有行业
        await this.loadIndustries()
      }
      
      // 加载分类
      await this.loadCategories()
      
      // 加载模板
      this.loadTemplates()
    } finally {
      wx.hideLoading()
    }
  },

  // 加载所有行业列表
  async loadIndustries() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getAppCategories',
        data: { action: 'industries' }
      })
      
      if (res.result.success) {
        const allIndustries = res.result.data || []
        const userIndustries = this.data.userIndustries || []
        
        // 过滤出"其他行业"（不在企业行业列表中的）
        const otherIndustries = allIndustries.filter(ind => 
          !userIndustries.includes(ind.name)
        )
        
        this.setData({ 
          industries: allIndustries,
          otherIndustries: otherIndustries
        })
      }
    } catch (err) {
      console.error('loadIndustries error:', err)
    }
  },

  // 加载用户所属企业的行业
  async loadUserIndustries() {
    try {
      const userId = wx.getStorageSync('userId')
      
      const res = await wx.cloud.callFunction({
        name: 'getUserIndustries',
        data: { userId }
      })
      
      console.log('loadUserIndustries result:', JSON.stringify(res.result))
      
      if (res.result.success) {
        const { isEnterprise, industries } = res.result.data
        
        // 如果是企业用户且有行业，默认选中第一个
        let defaultIndustry = ''
        if (isEnterprise && industries && industries.length > 0) {
          defaultIndustry = industries[0] // 默认选中企业行业的第一个
        }
        
        console.log('loadUserIndustries setData:', { isEnterprise, industries, defaultIndustry })
        
        this.setData({ 
          isEnterprise,
          userIndustries: industries || [],
          currentIndustry: defaultIndustry
        })
        
        // 无论是否登录，都加载所有行业列表
        await this.loadIndustries()
      }
    } catch (err) {
      console.error('loadUserIndustries error:', err)
      // 出错时加载全部行业，currentIndustry 默认为空（全部）
      this.setData({ currentIndustry: '' })
      await this.loadIndustries()
    }
  },

  // 加载分类列表
  async loadCategories() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getAppCategories',
        data: { action: 'categories' }
      })

      if (res.result.success) {
        const categories = res.result.data || []
        this.setData({ categories })
        
        // 默认不选中任何一级分类（显示"全部"），等待用户点击
        // currentCategory1 默认为空字符串 ''
        // 如果用户点击了一级分类，才加载二级分类
      }
    } catch (err) {
      console.error('loadCategories error:', err)
    }
  },

  // 加载二级分类
  async loadSubCategories(parentId) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getAppCategories',
        data: { action: 'subCategories', parentId }
      })

      if (res.result.success) {
        this.setData({ subCategories: res.result.data || [] })
      }
    } catch (err) {
      console.error('loadSubCategories error:', err)
    }
  },

  // 选择行业
  selectIndustry(e) {
    const industry = e.currentTarget.dataset.industry || ''
    this.setData({
      currentIndustry: industry,
      templates: [],
      column0: [],
      column1: [],
      column2: [],
      page: 1,
      hasMore: true,
      loading: false
    })
    
    // 如果是选择"全部"（industry为空），直接用 undefined
    const industryParam = industry || undefined
    this.loadTemplates(industryParam)
  },

  // 切换显示更多行业
  toggleMoreIndustries() {
    this.setData({
      showMoreIndustries: !this.data.showMoreIndustries
    })
  },

  // 选择一级分类
  selectCategory1(e) {
    const categoryId = e.currentTarget.dataset.id
    if (categoryId === this.data.currentCategory1) return

    console.log('selectCategory1:', categoryId, 'categories:', this.data.categories)

    this.setData({
      currentCategory1: categoryId,
      currentCategory2: '', // 重置二级分类
      subCategories: [],
      templates: [],
      column0: [],
      column1: [],
      column2: [],
      page: 1,
      hasMore: true
    })

    if (categoryId) {
      this.loadSubCategories(categoryId)
    }
    this.loadTemplates()
  },

  // 选择二级分类
  selectCategory2(e) {
    const categoryId = e.currentTarget.dataset.id
    if (categoryId === this.data.currentCategory2) return

    console.log('selectCategory2:', categoryId)

    this.setData({
      currentCategory2: categoryId,
      templates: [],
      column0: [],
      column1: [],
      column2: [],
      page: 1,
      hasMore: true
    })
    this.loadTemplates()
  },

  // 加载模板列表
  async loadTemplates(industryOverride) {
    if (this.data.loading) return
    if (!this.data.hasMore && this.data.page > 1) return

    if (this.data.page === 1) {
      this.setData({ loading: true })
    }

    try {
      // 如果有 override 参数则使用，否则使用 currentIndustry
      const industry = industryOverride !== undefined ? industryOverride : (this.data.currentIndustry || undefined)
      
      const queryData = {
        industry: industry,
        category1: this.data.currentCategory1 || undefined,
        category2: this.data.currentCategory2 || undefined,
        templateType: 'image',
        functionId: this.functionId || undefined,  // 添加功能ID筛选
        page: this.data.page,
        pageSize: this.data.pageSize
      }
      console.log('loadTemplates calling getAppTemplates:', JSON.stringify(queryData))
      
      const res = await wx.cloud.callFunction({
        name: 'getAppTemplates',
        data: queryData
      })
      
      console.log('loadTemplates result:', JSON.stringify(res.result))

      if (res.result.success) {
        const { list, hasMore } = res.result.data
        
        // 分配到三列（瀑布流）
        const columns = [[], [], []]
        list.forEach((t, index) => {
          columns[index % 3].push(t)
        })

        this.setData({
          templates: this.data.page === 1 ? list : [...this.data.templates, ...list],
          column0: this.data.page === 1 ? columns[0] : [...this.data.column0, ...columns[0]],
          column1: this.data.page === 1 ? columns[1] : [...this.data.column1, ...columns[1]],
          column2: this.data.page === 1 ? columns[2] : [...this.data.column2, ...columns[2]],
          hasMore,
          loading: false
        })
      } else {
        console.error('loadTemplates failed:', res.result.error)
        this.setData({ loading: false })
      }
    } catch (err) {
      console.error('loadTemplates error:', err)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 触底加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 })
      this.loadTemplates()
    }
  },

  // 图片懒加载
  onImageLoad(e) {
    const { column, index } = e.currentTarget.dataset
    const key = `${column}_${index}`
    const loaded = this.data.loadedImages
    loaded[key] = true
    this.setData({ loadedImages: loaded })
  },

  // 选择模板
  selectTemplate(e) {
    const { id, name, cover, description, needmaterial, functionid, functionids } = e.currentTarget.dataset
    console.log('selectTemplate:', { id, name, cover, description, needmaterial, functionid, functionids })
    console.log('redirectTo:', this.redirectTo)
    console.log('functionId (page):', this.functionId)
    console.log('flowSteps:', this.flowSteps)

    // 优先使用模板绑定的 functionIds 数组，否则使用单个 functionId，最后使用页面级别的 functionId
    const templateFunctionIds = functionids || (functionid ? [functionid] : [])
    const functionId = templateFunctionIds.length > 0 ? templateFunctionIds[0] : (this.functionId || '')
    
    // 如果是回调模式，保存选中模板并返回
    if (this.redirectTo === 'generate-flow') {
      const flowData = {
        template: { _id: id, name, cover_url: cover || '', thumbnail: cover || '' },
        step: 1
      }
      wx.setStorageSync('generateFlowData', flowData)
      wx.navigateBack()
      return
    }

    // 如果有功能ID，根据 flowSteps 决定跳转
    if (functionId) {
      const flowSteps = this.flowSteps || {}
      console.log('flowSteps.step2_materials:', flowSteps.step2_materials)
      console.log('flowSteps.step3_input:', flowSteps.step3_input)
      
      if (flowSteps.step2_materials) {
        // 需要选择素材，跳转到素材选择页
        wx.navigateTo({
          url: `/pages/product-select/product-select?templateId=${id}&templateName=${encodeURIComponent(name)}&templateCover=${encodeURIComponent(cover || '')}&templateDesc=${encodeURIComponent(description || '')}&functionId=${functionId}&functionName=${encodeURIComponent(this.functionName || '')}`
        })
        return
      } else if (flowSteps.step3_input) {
        // 直接跳转到生成页
        const params = {
          functionId: functionId,
          functionName: this.functionName,
          templateId: id,
          templateName: name,
          templateCover: cover || '',
          templateDesc: description || ''
        }
        wx.navigateTo({
          url: `/pages/generate/generate?${Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join('&')}`
        })
        return
      }
      // flowSteps 为空时，走原有逻辑
    }

    // 根据模板的 needMaterial 字段决定跳转
    // needMaterial 为 true 时跳转到素材选择页，false 时直接跳转到生成页
    if (needmaterial === true || needmaterial === 'true') {
      // 需要关联素材，跳转到素材选择页
      wx.navigateTo({
        url: `/pages/product-select/product-select?templateId=${id}&templateName=${encodeURIComponent(name)}&templateCover=${encodeURIComponent(cover || '')}&templateDesc=${encodeURIComponent(description || '')}&functionId=${functionId}&functionName=${encodeURIComponent(this.functionName || '')}`
      })
    } else {
      // 不需要关联素材，直接跳转到生成页
      const params = {
        functionId: functionId,
        functionName: this.functionName || '',
        templateId: id,
        templateName: name,
        templateCover: cover || '',
        templateDesc: description || ''
      }
      wx.navigateTo({
        url: `/pages/generate/generate?${Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join('&')}`
      })
    }
  }
})
