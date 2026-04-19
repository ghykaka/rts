// pages/generate/generate.js
const app = getApp()

Page({
  data: {
    // 功能信息
    functionId: '',
    functionName: '',
    functionDesc: '',
    // 关联的工作流信息
    workflowProduct: null,
    inputFields: [],
    imageFields: [],
    textFields: [],
    textareaFields: [],
    numberFields: [],
    otherTextFields: [],
    sortedInputFields: [],
    cozeWorkflowId: '',
    // 模板信息
    templateId: '',
    // 产品/素材信息
    productId: '',
    productName: '',
    productImage: '',
    productDesc: '',
    // 尺寸选项
    availableSizes: [],
    selectedSize: '',
    selectedSizeInfo: null,
    // 价格信息
    generatePrice: { cash_price: 0, balance_price: 0 },
    selectedCostType: 'balance', // balance / enterprise_balance / cash
    displayPrice: '0.00',
    balancePriceDisplay: '0.00',
    cashPriceDisplay: '0.00',
    // 用户信息
    userBalance: 0,
    displayBalance: '0.00',
    enterpriseBalance: 0,
    displayEnterpriseBalance: '0.00',
    subAccountBalance: 0,
    displaySubAccountBalance: '0.00',
    isEnterpriseUser: false, // 是否企业用户（管理员或子账号）
    isEnterpriseAdmin: false, // 是否企业管理员
    // 参考样图
    referenceImages: [],
    // 模板封面
    templateCover: '',
    // 流程步骤标识
    hasStep1: false,
    hasStep2: false,
    hasStep1OrStep2: false,
    // 表单数据
    formData: {},
    formDataLength: {}, // 表单数据长度（用于显示字符计数）
    // 状态
    generating: false,
    showSuccessTip: false,
    orderId: ''
  },

  onLoad(options) {
    console.log('=== generate.js onLoad ===')
    console.log('options:', options)
    console.log('functionId from options:', options.functionId)

    // 获取传递的信息
    // 支持两种格式：1. params=JSON.stringify(params)  2. 直接参数键值对
    let params
    if (options.params) {
      try {
        params = JSON.parse(decodeURIComponent(options.params))
      } catch (e) {
        params = options
      }
    } else {
      params = options
    }

    console.log('parsed params:', params)
    console.log('functionId from params:', params.functionId)

    // 从 storage 读取图片数据
    const storageData = wx.getStorageSync('generatePageData') || {}

    this.setData({
      functionId: params.functionId || '',
      functionName: decodeURIComponent(params.functionName || ''),
      templateId: params.templateId || '',
      templateName: decodeURIComponent(params.templateName || ''),
      templateCover: decodeURIComponent(params.templateCover || '') || storageData.templateCover || '',
      templateDesc: decodeURIComponent(params.templateDesc || '') || storageData.templateDesc || '',
      productId: params.productId || '',
      productName: decodeURIComponent(params.productName || ''),
      productImage: storageData.productImage || '',
      productDesc: storageData.productDesc || ''
    })

    // 清理 storage
    wx.removeStorageSync('generatePageData')

    wx.setNavigationBarTitle({
      title: '作品生成'
    })

    // 加载功能详情
    this.loadFunctionDetail()

    // 检查登录状态并获取用户信息
    this.checkLoginAndGetUserInfo()
  },

  // 加载功能详情
  async loadFunctionDetail() {
    // 如果没有 functionId，只使用模板信息，不需要调用云函数
    if (!this.data.functionId) {
      console.log('没有 functionId，使用模板基本信息')
      // 更新页面标题
      if (this.data.templateName) {
        wx.setNavigationBarTitle({
          title: this.data.templateName
        })
      }
      return
    }

    wx.showLoading({ title: '加载中...' })

    // 超时 Promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('timeout')), 8000) // 8秒超时
    })

    try {
      const cloudCallPromise = wx.cloud.callFunction({
        name: 'getWorkflowFunctionDetail',
        data: { functionId: this.data.functionId }
      })

      const res = await Promise.race([cloudCallPromise, timeoutPromise])

      wx.hideLoading()

      if (res.result && res.result.success) {
        const func = res.result.data
        console.log('功能详情:', func)

        // 提取工作流产品信息
        const workflowProduct = func.workflow_product || {}
        console.log('workflowProduct:', JSON.stringify(workflowProduct))
        
        // 处理字段名映射（后台用 snake_case，前端用 camelCase）
        const rawFields = workflowProduct.input_fields || []
        console.log('原始字段 rawFields:', JSON.stringify(rawFields))
        
        const inputFields = rawFields.map(f => {
          // 优先使用 field_name（后台存储的字段），如果为空则尝试 fieldName
          const fieldName = f.field_name !== undefined && f.field_name !== '' 
            ? f.field_name 
            : (f.fieldName || '')
          const fieldKey = f.field_key !== undefined && f.field_key !== '' 
            ? f.field_key 
            : (f.fieldKey || '')
          const fieldType = f.field_type !== undefined ? f.field_type : (f.fieldType || 'text')
          
          return {
            fieldKey: fieldKey,
            fieldName: fieldName,
            fieldType: fieldType,
            isRequired: f.is_required !== undefined ? f.is_required : (f.isRequired || false),
            maxLength: f.max_length !== undefined ? f.max_length : (f.maxLength || 200),
            placeholder: f.placeholder || ''
          }
        }).filter(f => f.fieldKey) // 过滤掉没有 fieldKey 的字段

        console.log('处理后的 inputFields:', JSON.stringify(inputFields))

        // 按类型分组
        const imageFields = inputFields.filter(f => f.fieldType === 'image')
        const textFields = inputFields.filter(f => f.fieldType === 'text')
        // textareaFields: 支持 'textarea' 和 'multiline' 两种类型
        const textareaFields = inputFields.filter(f => f.fieldType === 'textarea' || f.fieldType === 'multiline')
        // otherTextFields: 其他未识别的字段类型（作为 textarea 显示）
        const otherTextFields = inputFields.filter(f => 
          f.fieldType !== 'image' && f.fieldType !== 'text' && f.fieldType !== 'textarea' && f.fieldType !== 'multiline'
        )
        
    // 数字类字段（number 等）
    const numberFields = inputFields.filter(f => f.fieldType === 'number')
    
    // 按用户要求的顺序排序：多行文本 → 单行文本 → 数字文本 → 其他文本 → 图片
    const sortedInputFields = [
      ...textareaFields,
      ...textFields,
      ...numberFields,
      ...otherTextFields,
      ...imageFields
    ]
    
    console.log('字段类型分组:', { imageFields, textFields, textareaFields, numberFields, otherTextFields, sortedInputFields })

        // 初始化表单数据
        const formData = {}
        const formDataLength = {}
        inputFields.forEach(field => {
          formData[field.fieldKey] = ''
          formDataLength[field.fieldKey] = 0
        })

        // 默认选中第一个尺寸
        const firstSize = func.available_sizes?.[0] || null

        // 参考样图逻辑
        let referenceImages = func.reference_images || []
        const hasStep1 = workflowProduct.flow_steps?.step1_select_style
        const hasStep2Configured = workflowProduct.flow_steps?.step2_materials === true  // 工作流是否配置了step2
        const passedTemplateId = this.data.templateId

        // step2（产品选择）的显示逻辑：
        // 1. 工作流配置了 step2_materials = true 才可能显示
        // 2. 如果用户已经选择了产品（productId），则不需要再次选择
        // 3. templateId 不影响 step2 的显示（用户可能需要选择不同产品）
        const userHasSelectedProduct = !!this.data.productId
        const shouldShowProduct = hasStep2Configured && !userHasSelectedProduct
        
        // 获取功能主图（大图/头图）
        const mainImage = func.images?.fullsize || ''
        
        console.log('参考样图判断:', {
          hasStep1,
          hasStep2: hasStep2Configured,
          shouldShowProduct,
          userHasSelectedProduct,
          passedTemplateId,
          funcReferenceImages: func.reference_images,
          mainImage,
          referenceImages: referenceImages
        })
        
        if (hasStep1 && passedTemplateId) {
          // 有 step1 且传入了 templateId，通过云函数查询模板的参考样图
          console.log('有 step1，通过云函数查询模板参考样图，templateId:', passedTemplateId)
          try {
            const res = await wx.cloud.callFunction({
              name: 'getTemplateDetail',
              data: { templateId: passedTemplateId }
            })
            
            console.log('getTemplateDetail 结果:', res)
            
            if (res.result && res.result.success && res.result.data?.template?.reference_images?.length > 0) {
              referenceImages = res.result.data.template.reference_images
              console.log('✅ 使用模板参考样图:', referenceImages)
            } else {
              console.log('⚠️ 模板没有参考样图或模板不存在，使用功能参考样图')
            }
          } catch (err) {
            console.error('❌ 查询模板参考样图失败，使用功能参考样图:', err)
          }
        }

        this.setData({
          functionName: func.name || this.data.functionName,
          functionDesc: func.description || '',
          workflowProduct,
          inputFields,
          imageFields,
          textFields,
          textareaFields,
          numberFields,
          otherTextFields,
          sortedInputFields,
          cozeWorkflowId: workflowProduct.coze_workflow_id || '',
          availableSizes: func.available_sizes || [],
          selectedSize: firstSize?._id || '',
          selectedSizeInfo: firstSize,
          referenceImages: referenceImages,
          mainImage: mainImage,
          hasStep1: hasStep1,
          hasStep2: hasStep2Configured,  // 工作流是否配置了step2（用于显示"产品与模板"标题）
          hasStep1OrStep2: hasStep1 || hasStep2Configured,
          generatePrice: {
            cash_price: func.generate_price?.cash_price || 0,
            balance_price: func.generate_price?.balance_price || 0
          },
          formData,
          formDataLength
        })

        // 更新价格显示和默认支付方式
        this.updatePriceDisplay()
        this.updateDefaultCostType()

        // 更新页面标题
        wx.setNavigationBarTitle({
          title: func.name || '作品生成'
        })
      } else {
        console.error('获取功能详情失败:', res.result?.error)
        wx.showToast({
          title: res.result?.error || '获取功能详情失败',
          icon: 'none'
        })
      }
    } catch (err) {
      console.error('loadFunctionDetail error:', err)
      wx.hideLoading()
      // 超时或失败时，给用户提示但允许继续操作
      wx.showToast({
        title: '加载超时，请稍后重试',
        icon: 'none'
      })
    }
  },

  // 检查登录并获取用户信息
  async checkLoginAndGetUserInfo() {
    const userId = wx.getStorageSync('userId')

    if (!userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      wx.navigateTo({
        url: '/pages/login/login?redirect=/pages/generate/generate'
      })
      return
    }

    try {
      const res = await wx.cloud.callFunction({
        name: 'getUserInfo',
        data: { userId }
      })

      if (res.result && res.result.success) {
        const userData = res.result.data
        const balance = userData.balance || 0
        const enterpriseBalance = userData.enterprise_balance || 0
        const isEnterpriseAdmin = userData.user_type === 'enterprise' && userData.admin_user_id === userId
        
        // 获取子账号余额
        let subAccountBalance = 0
        if (userData.enterprise_id && !isEnterpriseAdmin) {
          // 子账号用户，查询子账号余额
          try {
            const subRes = await wx.cloud.callFunction({
              name: 'subaccountOps',
              data: {
                action: 'getByPhone',
                data: { phone: userData.phone }
              }
            })
            if (subRes.result && subRes.result.success && subRes.result.data) {
              subAccountBalance = subRes.result.data.balance || 0
            }
          } catch (e) {
            console.error('获取子账号余额失败:', e)
          }
        }

        const isEnterpriseUser = isEnterpriseAdmin || (userData.enterprise_id && subAccountBalance > 0)

        this.setData({
          userBalance: balance,
          displayBalance: (balance / 100).toFixed(2),
          enterpriseBalance: enterpriseBalance,
          displayEnterpriseBalance: (enterpriseBalance / 100).toFixed(2),
          subAccountBalance: subAccountBalance,
          displaySubAccountBalance: (subAccountBalance / 100).toFixed(2),
          isEnterpriseUser: isEnterpriseUser,
          isEnterpriseAdmin: isEnterpriseAdmin
        })
        
        // 更新默认支付方式（根据余额和价格判断）
        this.updateDefaultCostType()
      }
    } catch (err) {
      console.error('getUserInfo error:', err)
    }
  },

  // 预览参考样图大图
  previewReferenceImage(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      urls: this.data.referenceImages,
      current: url
    })
  },

  // 选择尺寸
  selectSize(e) {
    const sizeId = e.currentTarget.dataset.sizeId
    const sizeInfo = this.data.availableSizes.find(s => s._id === sizeId)
    this.setData({
      selectedSize: sizeId,
      selectedSizeInfo: sizeInfo || null
    })
  },

  // 选择支付方式
  selectCostType(e) {
    const costType = e.currentTarget.dataset.type
    this.setData({ selectedCostType: costType })
    this.updatePriceDisplay()
  },

  // 更新价格显示
  updatePriceDisplay() {
    const balancePrice = this.data.generatePrice.balance_price
    const cashPrice = this.data.generatePrice.cash_price
    const currentPrice = this.data.selectedCostType === 'balance' || this.data.selectedCostType === 'enterprise_balance' ? balancePrice : cashPrice
    
    this.setData({
      displayPrice: (currentPrice / 100).toFixed(2),
      balancePriceDisplay: (balancePrice / 100).toFixed(2),
      cashPriceDisplay: (cashPrice / 100).toFixed(2)
    })
  },

  // 根据企业身份、余额和价格计算默认支付方式
  updateDefaultCostType() {
    const { isEnterpriseUser, isEnterpriseAdmin, enterpriseBalance, subAccountBalance, userBalance, generatePrice } = this.data
    const balancePrice = generatePrice.balance_price || 0
    
    let defaultCostType = 'balance'
    
    if (isEnterpriseUser) {
      // 企业用户
      if (isEnterpriseAdmin) {
        // 管理员：优先企业总余额
        if (enterpriseBalance >= balancePrice) {
          defaultCostType = 'enterprise_balance'
        } else if (userBalance >= balancePrice) {
          defaultCostType = 'balance'
        } else {
          defaultCostType = 'cash'
        }
      } else {
        // 子账号：优先分配额度
        if (subAccountBalance >= balancePrice) {
          defaultCostType = 'enterprise_balance'
        } else if (userBalance >= balancePrice) {
          defaultCostType = 'balance'
        } else {
          defaultCostType = 'cash'
        }
      }
    } else {
      // 个人用户：优先个人余额
      if (userBalance >= balancePrice) {
        defaultCostType = 'balance'
      } else {
        defaultCostType = 'cash'
      }
    }
    
    this.setData({ selectedCostType: defaultCostType })
    this.updatePriceDisplay()
  },

  // 动态表单输入处理
  onFormInput(e) {
    const fieldKey = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${fieldKey}`]: value,
      [`formDataLength.${fieldKey}`]: value ? value.length : 0
    })
  },

  // 上传图片字段
  uploadFieldImage(e) {
    const fieldKey = e.currentTarget.dataset.field

    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const filePath = res.tempFilePaths[0]
        wx.showLoading({ title: '上传中...' })

        const cloudPath = `form_images/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`

        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: (uploadRes) => {
            this.setData({
              [`formData.${fieldKey}`]: uploadRes.fileID
            })
            wx.hideLoading()
          },
          fail: (err) => {
            console.error('uploadFieldImage error:', err)
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

  // 上传二维码
  uploadQrCode() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const filePath = res.tempFilePaths[0]
        wx.showLoading({ title: '上传中...' })

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
    const userId = wx.getStorageSync('userId')
    if (!userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    // 计算当前价格
    const currentPrice = this.data.selectedCostType === 'enterprise_balance'
      ? this.data.generatePrice.balance_price
      : (this.data.selectedCostType === 'balance' ? this.data.generatePrice.balance_price : this.data.generatePrice.cash_price)

    // 检查余额
    if (this.data.selectedCostType === 'enterprise_balance') {
      // 企业余额支付（管理员或子账号）
      if (this.data.isEnterpriseAdmin) {
        if (this.data.enterpriseBalance < currentPrice) {
          wx.showModal({
            title: '企业余额不足',
            content: '请充值后继续',
            confirmText: '去充值',
            success: (res) => {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/recharge/recharge?mode=enterprise'
                })
              }
            }
          })
          return
        }
      } else {
        // 子账号
        if (this.data.subAccountBalance < currentPrice) {
          wx.showModal({
            title: '子账号余额不足',
            content: '请联系企业管理员分配额度',
            confirmText: '确定'
          })
          return
        }
      }
    } else if (this.data.selectedCostType === 'balance' && this.data.userBalance < currentPrice) {
      wx.showModal({
        title: '余额不足',
        content: '请充值后继续',
        confirmText: '去充值',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/recharge/recharge'
            })
          }
        }
      })
      return
    }

    // 构建输入参数
    const inputParams = { ...this.data.formData }

    // 添加二维码
    if (this.data.qrCodeUrl) {
      inputParams.qr_code = this.data.qrCodeUrl
    }

    // 添加产品/素材信息
    if (this.data.productId) {
      inputParams.product_id = this.data.productId
      inputParams.product_name = this.data.productName
      inputParams.product_image = this.data.productImage
    }

    // 添加选中的尺寸信息
    if (this.data.selectedSizeInfo) {
      inputParams.size_name = this.data.selectedSizeInfo.name
      inputParams.size_value = this.data.selectedSizeInfo.size_value
      inputParams.size_category = this.data.selectedSizeInfo.category
    }

    this.setData({ generating: true })
    wx.showLoading({ title: '提交中...' })

    try {
      // 构建支付类型
      const costType = this.data.selectedCostType === 'enterprise_balance' ? 'balance' : this.data.selectedCostType

      // 调用 createOrder 云函数创建订单
      const res = await wx.cloud.callFunction({
        name: 'createOrder',
        data: {
          userId,
          functionId: this.data.functionId,
          functionName: this.data.functionName,
          templateId: this.data.templateId,
          templateName: this.data.templateName,
          workflowProductId: this.data.workflowProduct?._id || '',
          cozeWorkflowId: this.data.cozeWorkflowId,
          materialId: this.data.productId,  // 素材ID
          sizeId: this.data.selectedSize,    // 尺寸ID
          inputParams,
          outputType: 'image',
          aspectRatio: this.data.selectedSizeInfo?.name || '',
          costType: costType,
          costAmount: currentPrice,
          enterpriseMode: this.data.selectedCostType === 'enterprise_balance', // 是否使用企业余额
          isSubAccount: !this.data.isEnterpriseAdmin && this.data.isEnterpriseUser // 是否子账号
        }
      })

      wx.hideLoading()

      if (res.result && res.result.success) {
        const orderId = res.result.data.orderId

        // 如果是微信支付，调用支付
        if (this.data.selectedCostType === 'cash') {
          await this.handleWeChatPayment(orderId, currentPrice)
          return
        }

        // 余额支付成功
        // 更新本地余额显示
        let newBalance = this.data.userBalance
        let newEnterpriseBalance = this.data.enterpriseBalance
        let newSubAccountBalance = this.data.subAccountBalance

        if (this.data.selectedCostType === 'enterprise_balance') {
          if (this.data.isEnterpriseAdmin) {
            newEnterpriseBalance = this.data.enterpriseBalance - currentPrice
          } else {
            newSubAccountBalance = this.data.subAccountBalance - currentPrice
          }
        } else {
          newBalance = this.data.userBalance - currentPrice
        }

        this.setData({
          generating: false,
          showSuccessTip: true,
          orderId: orderId,
          userBalance: newBalance,
          displayBalance: (newBalance / 100).toFixed(2),
          enterpriseBalance: newEnterpriseBalance,
          displayEnterpriseBalance: (newEnterpriseBalance / 100).toFixed(2),
          subAccountBalance: newSubAccountBalance,
          displaySubAccountBalance: (newSubAccountBalance / 100).toFixed(2)
        })

        wx.showToast({
          title: '生成任务已提交',
          icon: 'success'
        })
      } else {
        this.setData({ generating: false })
        wx.showToast({
          title: res.result?.error || '创建订单失败',
          icon: 'none'
        })
      }
    } catch (err) {
      console.error('generate error:', err)
      wx.hideLoading()
      this.setData({ generating: false })
      wx.showToast({
        title: '创建订单失败，请重试',
        icon: 'none'
      })
    }
  },

  // 处理微信支付
  async handleWeChatPayment(orderId, amount) {
    try {
      wx.showLoading({ title: '正在唤起支付...' })

      // 调用创建支付
      const payRes = await wx.cloud.callFunction({
        name: 'createOrderPayment',
        data: {
          userId: wx.getStorageSync('userId'),
          orderId: orderId
        }
      })

      wx.hideLoading()

      if (!payRes.result || !payRes.result.success) {
        wx.showToast({
          title: payRes.result?.error || '支付创建失败',
          icon: 'none'
        })
        this.setData({ generating: false })
        return
      }

      // 调用微信支付
      const paymentData = payRes.result.data
      await wx.requestPayment({
        timeStamp: paymentData.timeStamp,
        nonceStr: paymentData.nonceStr,
        package: paymentData.package,
        signType: 'MD5',
        paySign: paymentData.paySign,
        success: () => {
          wx.showToast({
            title: '支付成功',
            icon: 'success'
          })
          this.setData({
            generating: false,
            showSuccessTip: true,
            orderId: orderId
          })
        },
        fail: (err) => {
          console.error('支付取消或失败:', err)
          if (err.errMsg.includes('cancel')) {
            wx.showToast({
              title: '已取消支付',
              icon: 'none'
            })
          } else {
            wx.showToast({
              title: '支付失败',
              icon: 'none'
            })
          }
          this.setData({ generating: false })
        }
      })
    } catch (err) {
      console.error('handleWeChatPayment error:', err)
      wx.hideLoading()
      wx.showToast({
        title: '支付失败，请重试',
        icon: 'none'
      })
      this.setData({ generating: false })
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
  },

  // 跳转企业充值
  goRechargeEnterprise() {
    wx.navigateTo({
      url: '/pages/recharge/recharge?mode=enterprise'
    })
  }
})
