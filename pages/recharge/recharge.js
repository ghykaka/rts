// pages/recharge/recharge.js
const app = getApp()

Page({
  data: {
    mode: 'personal', // personal / enterprise (当前模式)
    type: 'personal', // personal / enterprise (充值类型)
    rechargeConfigs: [], // 充值配置列表
    selectedIndex: 0,
    selectedAmount: 0,
    selectedConfigId: '',
    selectedBonus: 0,
    loading: false,
    paying: false, // 支付中状态
    pageTitle: '个人账户充值', // 页面标题
    showCompanyName: false, // 是否显示企业名称
    companyName: '' // 企业名称
  },

  onLoad(options) {
    const { mode, type } = options
    const currentMode = mode || 'personal'
    const userInfo = wx.getStorageSync('userInfo')

    this.setData({
      mode: currentMode,
      type: type || currentMode,
      pageTitle: currentMode === 'enterprise' ? '企业账户充值' : '个人账户充值',
      showCompanyName: currentMode === 'enterprise',
      companyName: userInfo?.company_name || ''
    })

    // 获取充值配置
    this.fetchRechargeConfigs()
  },

  // 获取充值配置
  async fetchRechargeConfigs() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getRechargeConfigs'
      })

      if (res.result && res.result.success) {
        const configs = res.result.data || []
        // 过滤开启的配置，并按金额排序
        const enabledConfigs = configs
          .filter(item => item.enabled)
          .sort((a, b) => a.amount - b.amount)

        if (enabledConfigs.length > 0) {
          this.setData({
            rechargeConfigs: enabledConfigs,
            selectedIndex: 0,
            selectedAmount: enabledConfigs[0].amount,
            selectedConfigId: enabledConfigs[0]._id,
            selectedBonus: enabledConfigs[0].bonus || 0
          })
        } else {
          // 如果没有配置，使用默认值
          this.setData({
            rechargeConfigs: [],
            selectedAmount: 50
          })
        }
      } else {
        console.error('获取充值配置失败:', res.result?.error)
        // 使用默认值
        this.setData({
          rechargeConfigs: [],
          selectedAmount: 50
        })
      }
    } catch (err) {
      console.error('获取充值配置失败:', err)
      this.setData({
        rechargeConfigs: [],
        selectedAmount: 50
      })
    }
  },

  selectAmount(e) {
    const { index, amount, id } = e.currentTarget.dataset
    const configs = this.data.rechargeConfigs
    const config = configs[index] || {}

    this.setData({
      selectedIndex: index,
      selectedAmount: amount,
      selectedConfigId: id,
      selectedBonus: config.bonus || 0
    })
  },

  async recharge() {
    if (!app.globalData.userId) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    if (this.data.paying) return // 防止重复点击

    this.setData({ paying: true, loading: true })

    try {
      // 调用云函数创建充值订单
      const res = await wx.cloud.callFunction({
        name: 'createRecharge',
        data: {
          userId: app.globalData.userId,
          amount: this.data.selectedAmount,
          bonus: this.data.selectedBonus,
          configId: this.data.selectedConfigId,
          type: this.data.type
        }
      })

      if (res.result.success) {
        this.setData({ loading: false })

        // 调用微信支付
        await wx.requestPayment({
          timeStamp: res.result.data.timeStamp,
          nonceStr: res.result.data.nonceStr,
          package: res.result.data.package,
          signType: 'MD5',
          paySign: res.result.data.paySign,
          success: async () => {
            // 支付成功后，刷新余额
            wx.showLoading({ title: '处理中...' })
            try {
              // 获取最新余额
              const userRes = await wx.cloud.callFunction({
                name: 'getUserInfo',
                data: {
                  userId: app.globalData.userId
                }
              })
              wx.hideLoading()

              if (userRes.result && userRes.result.success) {
                const newUserInfo = userRes.result.data
                // 更新内存中的数据
                app.globalData.userInfo = newUserInfo
                // 更新本地缓存
                wx.setStorageSync('userInfo', newUserInfo)
                console.log('余额已刷新:', newUserInfo.balance, newUserInfo.enterprise_balance)
              }

              wx.showToast({ title: '充值成功', icon: 'success' })
            } catch (err) {
              wx.hideLoading()
              console.error('刷新余额失败:', err)
              wx.showToast({ title: '充值成功，余额稍后更新', icon: 'none' })
            }

            // 等待 2.5 秒，确保支付回调有足够时间处理余额更新
            setTimeout(() => {
              this.setData({ paying: false })
              wx.navigateBack()
            }, 2500)
          },
          fail: err => {
            this.setData({ paying: false })
            if (err.errMsg.includes('cancel')) {
              wx.showToast({ title: '已取消支付', icon: 'none' })
            } else {
              wx.showToast({ title: '支付失败', icon: 'none' })
            }
          }
        })
      } else {
        this.setData({ paying: false, loading: false })
        wx.showToast({ title: res.result.error || '创建订单失败', icon: 'none' })
      }
    } catch (err) {
      console.error('recharge error:', err)
      this.setData({ paying: false, loading: false })
      wx.showToast({ title: '充值失败', icon: 'none' })
    }
  }
})
