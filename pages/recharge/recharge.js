// pages/recharge/recharge.js
// 充值页面 - 使用虚拟支付
const app = getApp()

Page({
  data: {
    loading: false,
    paying: false,
    type: 1,  // 1=按月, 2=按年
    selectedAmount: '',
    selectedBonus: 0,
    selectedConfigId: '',
    configList: [],
    balance: 0,  // 积分余额
    showRechargeList: true,
    pageTitle: '个人余额充值',  // 页面标题
    isEnterpriseAdmin: false,  // 是否是企业管理员
    companyName: '',  // 企业名称
    currentMode: 'personal',  // 当前模式
    configLoading: true  // 配置加载状态
  },

  // 更新页面标题
  updatePageTitle(mode) {
    const userInfo = app.globalData.userInfo
    const hasEnterprise = userInfo && (userInfo.user_type === 'enterprise' || userInfo.enterprise_id)
    const isEnterpriseAdmin = hasEnterprise && userInfo && userInfo.role === 'admin'
    
    let pageTitle = '个人余额充值'
    let companyName = ''
    
    if (mode === 'enterprise' && isEnterpriseAdmin) {
      pageTitle = '企业余额充值'
      companyName = userInfo.company_short_name || userInfo.company_name || ''
    }
    
    this.setData({
      pageTitle: pageTitle,
      isEnterpriseAdmin: isEnterpriseAdmin,
      companyName: companyName
    })
  },

  onLoad(options) {
    // 检查是否有外部传入的金额
    if (options.amount) {
      this.setData({
        selectedAmount: parseInt(options.amount),
        showRechargeList: false
      })
    }
    
    // 获取当前模式
    const mode = options.mode || 'personal'
    this.setData({ currentMode: mode })
    
    // 根据模式设置页面标题
    this.updatePageTitle(mode)
    
    // 加载充值配置
    this.loadRechargeConfig()
    // 获取用户余额
    this.getUserBalance()
  },

  onShow() {
    // 每次显示页面时刷新余额
    this.getUserBalance()
    // 更新页面标题
    this.updatePageTitle(this.data.currentMode)
  },

  // 获取用户余额
  getUserBalance() {
    if (!app.globalData.userId) return

    wx.cloud.callFunction({
      name: 'getUserInfo',
      data: { userId: app.globalData.userId },
      success: (res) => {
        if (res.result && res.result.success) {
          const userInfo = res.result.data
          // 根据当前模式显示不同余额
          const balance = this.data.currentMode === 'enterprise' 
            ? (userInfo.enterprise_balance || 0) 
            : (userInfo.balance || 0)
          this.setData({
            balance: balance
          })
        }
      }
    })
  },

  // 加载充值配置
  async loadRechargeConfig() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getRechargeConfig'
      })

      if (res.result && res.result.success) {
        // 默认选中第一个配置
        if (res.result.data && res.result.data.length > 0) {
          const first = res.result.data[0]
          this.setData({
            configList: res.result.data || [],
            selectedAmount: first.amount,
            selectedBonus: first.bonus,
            selectedConfigId: first._id,
            configLoading: false
          })
        } else {
          this.setData({
            configList: [],
            configLoading: false
          })
        }
      } else {
        this.setData({ configLoading: false })
      }
    } catch (err) {
      console.error('加载充值配置失败:', err)
      this.setData({ configLoading: false })
    }
  },

  // 选择充值金额
  selectAmount(e) {
    const { amount, bonus, id } = e.currentTarget.dataset
    this.setData({
      selectedAmount: amount,
      selectedBonus: bonus,
      selectedConfigId: id
    })
  },

  // 选择月付/年付
  selectType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ type })
  },

  // 立即充值 - 虚拟支付版本
  async virtualRecharge() {
    if (this.data.paying) return
    if (this.data.configLoading || !this.data.selectedConfigId) return

    this.setData({ paying: true, loading: true })

    try {
      // 1. 获取登录 code
      const loginRes = await wx.login()
      if (!loginRes.code) {
        throw new Error('获取 code 失败')
      }

      // 2. 获取 sessionKey
      const sessionRes = await wx.cloud.callFunction({
        name: 'getSessionKey',
        data: { code: loginRes.code }
      })

      if (!sessionRes.result || !sessionRes.result.success) {
        throw new Error(sessionRes.result?.error || '获取 sessionKey 失败')
      }

      console.log('获取 sessionKey 成功')

      // 3. 创建充值订单
      const createRes = await wx.cloud.callFunction({
        name: 'createRecharge',
        data: {
          userId: app.globalData.userId,
          amount: this.data.selectedAmount,
          bonus: this.data.selectedBonus,
          configId: this.data.selectedConfigId,
          type: this.data.currentMode  // personal 或 enterprise
        }
      })

      if (!createRes.result || !createRes.result.success) {
        throw new Error(createRes.result?.error || '创建充值订单失败')
      }

      // outTradeNo 在 createRes 顶层
      const rechargeId = createRes.result.outTradeNo
      console.log('创建充值订单成功, rechargeId:', rechargeId)

      this.setData({ loading: false })

      // 4. 重新获取 loginCode（code 只能使用一次！）
      const newLoginRes = await wx.login()
      if (!newLoginRes.code) {
        throw new Error('获取 loginCode 失败')
      }

      // 5. 获取虚拟支付参数
      const paymentRes = await wx.cloud.callFunction({
        name: 'createVirtualPayment',
        data: {
          userId: app.globalData.userId,
          rechargeId: rechargeId,
          totalFee: this.data.selectedAmount,  // 元
          loginCode: newLoginRes.code  // 使用新的 loginCode
        }
      })

      if (!paymentRes.result || !paymentRes.result.success) {
        throw new Error(paymentRes.result?.error || '获取支付参数失败')
      }

      const payData = paymentRes.result.data
      console.log('虚拟支付参数:', JSON.stringify(payData))

      // 5. 调用虚拟支付
      await this.callVirtualPayment(payData, rechargeId)

    } catch (err) {
      console.error('虚拟支付失败:', err)
      this.setData({ paying: false, loading: false })
      wx.showToast({ title: err.message || '支付失败', icon: 'none' })
    }
  },

  // 调用虚拟支付 wx.requestVirtualPayment
  async callVirtualPayment(payData, rechargeId) {
    return new Promise((resolve, reject) => {
      const systemInfo = wx.getSystemInfoSync()
      console.log('基础库版本:', systemInfo.SDKVersion)
      console.log('当前平台:', systemInfo.platform)

      // 调用虚拟支付
      console.log('准备调用虚拟支付...')
      
      wx.requestVirtualPayment({
        mode: 'short_series_coin',
        env: Number(payData.env),
        offerId: String(payData.offerId),
        buyQuantity: Number(payData.buyQuantity) || 1,
        coinAmount: Number(payData.coinAmount),  // 代币数量
        currencyType: 'CNY',
        outTradeNo: String(payData.outTradeNo),
        attach: String(payData.attach || ''),
        signData: String(payData.signData),
        paySig: String(payData.paySig),
        signature: String(payData.signature),
        success: (res) => {
          console.log('虚拟支付成功:', res)
          this.handlePaymentSuccess(rechargeId)
          resolve(res)
        },
        fail: (err) => {
          console.error('虚拟支付失败:', err)
          if (err.errMsg && err.errMsg.includes('cancel')) {
            wx.showToast({ title: '已取消支付', icon: 'none' })
          } else {
            wx.showToast({ title: err.errMsg || '支付失败', icon: 'none' })
          }
          this.setData({ paying: false })
          reject(err)
        }
      })
    })
  },

  // 支付成功后的处理
  async handlePaymentSuccess(rechargeId) {
    wx.showLoading({ title: '处理中...' })

    try {
      // 调用云函数确认虚拟充值
      const confirmRes = await wx.cloud.callFunction({
        name: 'confirmVirtualRecharge',
        data: {
          rechargeId: rechargeId,
          amount: this.data.selectedAmount
        }
      })

      console.log('确认充值结果:', confirmRes)

      wx.hideLoading()

      if (confirmRes.result && confirmRes.result.success) {
        // 刷新余额
        const userRes = await wx.cloud.callFunction({
          name: 'getUserInfo',
          data: {
            userId: app.globalData.userId
          }
        })

        if (userRes.result && userRes.result.success) {
          this.setData({
            balance: userRes.result.data.balance || 0,
            paying: false
          })
        } else {
          this.setData({ paying: false })
        }

        // 显示充值成功
        const addScore = confirmRes.result.addScore || this.data.selectedAmount * 100
        wx.showModal({
          title: '充值成功',
          content: `恭喜！充值 ¥${this.data.selectedAmount} 元成功，获得 ${addScore} 积分`,
          showCancel: false,
          success: () => {
            wx.navigateBack()
          }
        })
      } else {
        this.setData({ paying: false })
        wx.showToast({ title: confirmRes.result?.error || '确认失败', icon: 'none' })
      }
    } catch (err) {
      console.error('处理支付结果失败:', err)
      wx.hideLoading()
      this.setData({ paying: false })
      wx.showToast({ title: '充值成功，刷新页面查看', icon: 'none' })
    }
  },

  // 原来的普通支付（保留备用）
  async doRecharge() {
    if (this.data.paying) return

    this.setData({ paying: true, loading: true })

    try {
      // 1. 创建充值订单
      const createRes = await wx.cloud.callFunction({
        name: 'createRecharge',
        data: {
          userId: app.globalData.userId,
          amount: this.data.selectedAmount,
          bonus: this.data.selectedBonus,
          configId: this.data.selectedConfigId,
          type: this.data.type
        }
      })

      if (!createRes.result || !createRes.result.success) {
        throw new Error(createRes.result?.error || '创建充值订单失败')
      }

      const rechargeId = createRes.result.data._id || createRes.result.data.id
      console.log('创建充值订单成功, rechargeId:', rechargeId)

      this.setData({ loading: false })

      // 2. 获取支付参数
      const paymentRes = await wx.cloud.callFunction({
        name: 'createOrderPayment',
        data: {
          userId: app.globalData.userId,
          rechargeId: rechargeId,
          amount: this.data.selectedAmount
        }
      })

      if (!paymentRes.result || !paymentRes.result.success) {
        throw new Error(paymentRes.result?.error || '获取支付参数失败')
      }

      const payData = paymentRes.result.data

      // 3. 发起支付
      await this.requestPayment(payData, rechargeId)

    } catch (err) {
      console.error('充值失败:', err)
      this.setData({ paying: false, loading: false })
      wx.showToast({ title: err.message || '充值失败', icon: 'none' })
    }
  },

  // 微信支付
  requestPayment(payData, rechargeId) {
    return new Promise((resolve, reject) => {
      wx.requestPayment({
        ...payData,
        success: (res) => {
          console.log('支付成功:', res)
          this.handlePaymentSuccess(rechargeId)
          resolve(res)
        },
        fail: (err) => {
          console.error('支付失败:', err)
          if (err.errMsg && err.errMsg.includes('cancel')) {
            wx.showToast({ title: '已取消支付', icon: 'none' })
          } else {
            wx.showToast({ title: '支付失败', icon: 'none' })
          }
          this.setData({ paying: false })
          reject(err)
        }
      })
    })
  }
})
