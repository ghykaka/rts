// pages/generate-flow/generate-flow.js
const app = getApp()

Page({
  data: {
    // 功能信息
    functionId: '',
    functionName: '',
    functionDetail: null,
    loading: true,
    
    // 流程步骤
    flowSteps: null,
    currentStep: 1, // 1=模板, 2=素材, 3=生成
    
    // 用户信息
    isLogin: false,
    userInfo: null,
    isEnterprise: false,
    userIndustries: [],
    
    // 模板选择
    selectedTemplate: null,
    
    // 素材选择
    selectedMaterials: [],
    materialType: 'personal', // personal, enterprise, both
    enterprise_id: '',
    
    // 生成参数
    generateParams: {}
  },

  onLoad(options) {
    const { functionId, functionName } = options
    
    if (!functionId) {
      wx.showToast({ title: '参数错误', icon: 'none' })
      wx.navigateBack()
      return
    }
    
    this.setData({
      functionId,
      functionName: functionName ? decodeURIComponent(functionName) : ''
    })
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: functionName ? decodeURIComponent(functionName) : '生成'
    })
    
    // 从 storage 恢复之前的选择状态
    this.restoreSelection()
    
    this.checkLoginAndLoad()
  },
  
  // 恢复之前的选择状态
  restoreSelection() {
    try {
      const flowData = wx.getStorageSync('generateFlowData')
      if (flowData) {
        const updates = {}
        
        // 恢复模板选择
        if (flowData.template) {
          updates.selectedTemplate = flowData.template
          updates.currentStep = 2 // 如果有模板，进入步骤2
        }
        
        // 恢复素材选择
        if (flowData.materials && flowData.materials.length > 0) {
          updates.selectedMaterials = flowData.materials
        }
        
        // 恢复步骤
        if (flowData.step) {
          updates.currentStep = flowData.step
        }
        
        if (Object.keys(updates).length > 0) {
          this.setData(updates)
        }
        
        // 清除已恢复的数据
        wx.removeStorageSync('generateFlowData')
      }
    } catch (e) {
      console.error('restoreSelection error:', e)
    }
  },

  onShow() {
    // 检查登录状态
    const userId = wx.getStorageSync('userId')
    this.setData({ isLogin: !!userId })
    
    if (userId) {
      this.loadUserInfo()
    }
  },

  // 检查登录并加载数据
  async checkLoginAndLoad() {
    this.setData({ loading: true })
    
    try {
      await this.loadFunctionDetail()
    } finally {
      this.setData({ loading: false })
    }
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      
      if (userInfo) {
        this.setData({ 
          userInfo,
          isEnterprise: !!userInfo.enterprise_id
        })
        
        // 如果是企业用户，获取enterprise_id
        if (userInfo.enterprise_id) {
          this.setData({ enterprise_id: userInfo.enterprise_id })
        }
      }
      
      // 获取用户行业
      await this.loadUserIndustries()
    } catch (err) {
      console.error('loadUserInfo error:', err)
    }
  },

  // 获取用户行业
  async loadUserIndustries() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getUserIndustries'
      })
      
      if (res.result && res.result.success) {
        const { isEnterprise, industries } = res.result.data
        this.setData({
          isEnterprise,
          userIndustries: industries || []
        })
      }
    } catch (err) {
      console.error('loadUserIndustries error:', err)
    }
  },

  // 加载功能详情
  async loadFunctionDetail() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getWorkflowFunctionDetail',
        data: { functionId: this.data.functionId }
      })
      
      if (res.result && res.result.success) {
        const func = res.result.data
        
        // 确定素材类型默认选择
        let defaultMaterialType = 'personal'
        if (func.workflow_product?.flow_steps?.step2_materials_type === 'enterprise') {
          defaultMaterialType = 'enterprise'
        } else if (func.workflow_product?.flow_steps?.step2_materials_type === 'both') {
          // 如果是企业账号管理员或子账号，默认选中企业素材
          if (this.data.isEnterprise) {
            defaultMaterialType = 'enterprise'
          } else {
            defaultMaterialType = 'personal'
          }
        }
        
        this.setData({
          functionDetail: func,
          flowSteps: func.workflow_product?.flow_steps || {},
          materialType: defaultMaterialType
        })
        
        // 根据flow_steps决定起始页面
        this.determineStartStep()
      } else {
        wx.showToast({ 
          title: res.result?.error || '加载失败', 
          icon: 'none' 
        })
      }
    } catch (err) {
      console.error('loadFunctionDetail error:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 根据flow_steps决定起始页面
  determineStartStep() {
    const { flowSteps } = this.data
    
    if (flowSteps?.step1_select_style) {
      // 需要选择模板 -> 当前页显示模板列表
      this.setData({ currentStep: 1 })
    } else if (flowSteps?.step2_materials) {
      // 需要选择素材 -> 当前页显示素材列表
      this.setData({ currentStep: 2 })
    } else {
      // 直接进入生成页
      this.setData({ currentStep: 3 })
    }
  },

  // 选择模板
  onSelectTemplate(e) {
    const { template } = e.currentTarget.dataset
    this.setData({ selectedTemplate: template })
    
    const { flowSteps } = this.data
    
    // 根据下一步决定跳转
    if (flowSteps?.step2_materials) {
      this.goToMaterials()
    } else if (flowSteps?.step3_input) {
      this.goToGenerate()
    } else {
      // 没有素材和生成页，完成选择
      wx.showToast({ title: '已选择模板', icon: 'success' })
    }
  },

  // 选择素材
  onSelectMaterial(e) {
    const { material } = e.currentTarget.dataset
    const { selectedMaterials } = this.data
    
    // 切换选择状态
    const index = selectedMaterials.findIndex(m => m._id === material._id)
    if (index >= 0) {
      selectedMaterials.splice(index, 1)
    } else {
      selectedMaterials.push(material)
    }
    
    this.setData({ selectedMaterials: [...selectedMaterials] })
  },

  // 确认选择素材
  confirmMaterials() {
    if (this.data.selectedMaterials.length === 0) {
      wx.showToast({ title: '请选择至少一个素材', icon: 'none' })
      return
    }
    
    const { flowSteps } = this.data
    
    if (flowSteps?.step3_input) {
      this.goToGenerate()
    } else {
      wx.showToast({ title: '已选择素材', icon: 'success' })
    }
  },

  // 切换素材类型
  onMaterialTypeChange(e) {
    this.setData({ materialType: e.currentTarget.dataset.type })
  },

  // 跳转到模板选择页
  goToTemplateList() {
    // 使用 redirectTo 跳转，返回时会重新加载页面并恢复选择状态
    wx.redirectTo({
      url: `/pages/template-list/template-list?name=${encodeURIComponent(this.data.functionName || '选择模板')}&functionId=${this.data.functionId}&redirect=generate-flow`
    })
  },

  // 跳转到素材选择页
  goToMaterials() {
    const { selectedTemplate, enterprise_id, materialType } = this.data
    
    let url = `/pages/product-select/product-select?templateId=${selectedTemplate._id || ''}&templateName=${encodeURIComponent(selectedTemplate?.name || '')}`
    
    if (enterprise_id) {
      url += `&enterpriseId=${enterprise_id}&materialType=${materialType}`
    }
    
    // 添加回调标识
    url += '&redirect=generate-flow'
    
    // 使用 redirectTo 跳转，返回时会重新加载页面并恢复选择状态
    wx.redirectTo({ url })
  },

  // 跳转到生成页
  goToGenerate() {
    const { selectedTemplate, selectedMaterials, functionDetail } = this.data
    
    // 组装生成参数
    const params = {
      functionId: this.data.functionId,
      functionName: this.data.functionName,
      templateId: selectedTemplate?._id || '',
      templateName: selectedTemplate?.name || '',
      templateCover: selectedTemplate?.cover_url || selectedTemplate?.thumbnail || '',
      materials: selectedMaterials,
      workflowProduct: functionDetail?.workflow_product || {},
      generatePrice: functionDetail?.generate_price || {},
      referenceImages: functionDetail?.reference_images || [],
      availableSizes: functionDetail?.available_sizes || []
    }
    
    // 跳转到生成页
    wx.redirectTo({
      url: `/pages/generate/generate?params=${encodeURIComponent(JSON.stringify(params))}`
    })
  },

  // 下一步
  nextStep() {
    const { currentStep, flowSteps, selectedTemplate, selectedMaterials } = this.data
    
    if (currentStep === 1) {
      // 模板步骤
      if (flowSteps?.step1_select_style && !selectedTemplate) {
        wx.showToast({ title: '请先选择模板', icon: 'none' })
        return
      }
      
      if (flowSteps?.step2_materials) {
        this.setData({ currentStep: 2 })
      } else if (flowSteps?.step3_input) {
        this.setData({ currentStep: 3 })
      }
    } else if (currentStep === 2) {
      // 素材步骤
      if (selectedMaterials.length === 0) {
        wx.showToast({ title: '请选择至少一个素材', icon: 'none' })
        return
      }
      
      if (flowSteps?.step3_input) {
        this.setData({ currentStep: 3 })
      }
    }
  },

  // 上一步
  prevStep() {
    const { currentStep, flowSteps } = this.data
    
    if (currentStep === 2) {
      if (flowSteps?.step1_select_style) {
        this.setData({ currentStep: 1 })
      }
    } else if (currentStep === 3) {
      if (flowSteps?.step2_materials) {
        this.setData({ currentStep: 2 })
      } else if (flowSteps?.step1_select_style) {
        this.setData({ currentStep: 1 })
      }
    }
  },

  // 跳过当前步骤
  skipStep() {
    this.nextStep()
  },

  // 直接开始生成（无模板无素材）
  startGenerate() {
    this.setData({ currentStep: 3 })
  }
})
