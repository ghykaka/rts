// pages/sub-accounts/sub-accounts.js
const app = getApp()

Page({
  data: {
    subAccounts: [],
    showModal: false,
    newPhone: '',
    newBalance: 0,
    displayBalance: '0',
    newRemark: '',
    allocateModal: false,
    allocateUserId: '',
    allocateAmount: '',
    displayAllocateAmount: '',
    currentSubBalance: '0.00',
    allocateDiff: '0.00',
    editRemarkModal: false,
    editRemarkUserId: '',
    editRemark: '',
    userInfo: null,
    companyBalance: '0.00',
    enterprise_id: '',
    // 弹框上移状态
    allocateModalKeyboardUp: false,
    editRemarkModalKeyboardUp: false
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    // 等待 loadUserInfo 完成后再加载子账号
    this.loadUserInfo().then(() => {
      this.loadSubAccounts()
    })
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      const userId = wx.getStorageSync('userId')

      if (!userInfo || !userId) {
        return
      }

      const db = wx.cloud.database()
      let enterprise_id = userInfo.enterprise_id || ''
      let enterpriseBalance = 0

      // 直接通过 admin_user_id 查询企业信息（避免超时）
      try {
        const entRes = await db.collection('enterprises')
          .where({ admin_user_id: userId })
          .field({ _id: true, balance: true })
          .limit(1)
          .get()
        
        if (entRes.data && entRes.data.length > 0) {
          enterprise_id = entRes.data[0]._id
          enterpriseBalance = entRes.data[0].balance || 0
        }
      } catch (e) {
        console.log('查询企业失败:', e.message)
      }

      this.setData({ 
        userInfo: userInfo,
        enterprise_id: enterprise_id,
        companyBalance: (enterpriseBalance / 100).toFixed(2)
      })

      console.log('loadUserInfo 完成, enterprise_id:', enterprise_id)
    } catch (err) {
      console.error('loadUserInfo error:', err)
    }
  },

  // 调用云函数
  async callFunction(action, data) {
    return await wx.cloud.callFunction({
      name: 'subaccountOps',
      data: { action, data }
    })
  },

  // 加载子账号（使用云函数）
  async loadSubAccounts() {
    try {
      const { enterprise_id } = this.data
      console.log('loadSubAccounts 开始, enterprise_id:', enterprise_id)

      if (!enterprise_id) {
        console.log('enterprise_id 为空，跳过查询')
        return
      }

      const res = await this.callFunction('get', { enterpriseId: enterprise_id })
      console.log('子账号查询结果:', res)

      if (res.result && res.result.success) {
        const accounts = res.result.data || []
        console.log('子账号数据:', accounts)
        
        // 格式化余额显示
        const formattedAccounts = accounts.map(account => ({
          ...account,
          displayBalance: ((account.balance || 0) / 100).toFixed(2)
        }))

        this.setData({ subAccounts: formattedAccounts })

        // 计算所有子账号余额总和
        const totalSubBalance = formattedAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)
        
        console.log(`子账号总数: ${accounts.length}, 子账号总余额: ¥${(totalSubBalance / 100).toFixed(2)}`)
      } else {
        console.log('查询失败:', res.result?.error)
      }
    } catch (err) {
      console.error('loadSubAccounts error:', err)
      wx.showToast({ title: '加载子账号失败', icon: 'none' })
    }
  },

  // 显示添加对话框
  showAddModal() {
    this.setData({
      showModal: true,
      newPhone: '',
      newBalance: 0,
      displayBalance: '0',
      newRemark: ''
    })
  },

  // 隐藏对话框
  hideModal() {
    this.setData({ showModal: false })
  },

  // 输入手机号
  onPhoneInput(e) {
    this.setData({ newPhone: e.detail.value })
  },

  // 输入分配余额
  onBalanceInput(e) {
    const value = parseFloat(e.detail.value) || 0
    this.setData({
      newBalance: Math.round(value * 100),  // 转为分
      displayBalance: e.detail.value
    })
  },

  // 输入备注名称
  onRemarkInput(e) {
    this.setData({ newRemark: e.detail.value })
  },

  // 添加子账号（支持预添加）
  async addSubAccount() {
    const { newPhone, newBalance, newRemark, enterprise_id, companyBalance, subAccounts } = this.data

    if (!newPhone.trim()) {
      wx.showToast({ title: '请输入手机号', icon: 'none' })
      return
    }

    if (!/^1\d{10}$/.test(newPhone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' })
      return
    }

    if (newBalance < 0) {
      wx.showToast({ title: '分配余额不能为负', icon: 'none' })
      return
    }

    // 校验企业余额
    const enterpriseBalanceCents = parseFloat(companyBalance) * 100
    
    // 计算当前所有子账号余额总和
    const currentSubTotal = subAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)
    
    // 检查分配后是否超出企业余额
    const totalAfterAdd = currentSubTotal + newBalance
    if (totalAfterAdd > enterpriseBalanceCents) {
      const availableBalance = ((enterpriseBalanceCents - currentSubTotal) / 100).toFixed(2)
      wx.showToast({
        title: `超出企业余额，可分配: ¥${availableBalance}`,
        icon: 'none',
        duration: 3000
      })
      return
    }

    wx.showLoading({ title: '添加中...' })

    try {
      const res = await this.callFunction('add', {
        enterprise_id,
        phone: newPhone.trim(),
        remark: newRemark || '',
        balance: newBalance
      })

      wx.hideLoading()

      if (res.result && res.result.success) {
        const msg = res.result.data?.status === 'active' ? '添加成功（已激活）' : '预添加成功（等待用户激活）'
        wx.showToast({ title: msg, icon: 'success' })
        this.setData({ showModal: false })
        this.loadUserInfo()
        this.loadSubAccounts()
      } else {
        wx.showToast({ title: res.result?.error || '添加失败', icon: 'none' })
      }
    } catch (err) {
      console.error('addSubAccount error:', err)
      wx.hideLoading()
      wx.showToast({ title: '添加失败', icon: 'none' })
    }
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数,用于阻止弹框点击关闭
  },

  // 分配余额弹框输入框获取焦点
  onAllocateInputFocus() {
    this.setData({ allocateModalKeyboardUp: true })
  },

  // 分配余额弹框输入框失去焦点
  onAllocateInputBlur() {
    this.setData({ allocateModalKeyboardUp: false })
  },

  // 修改备注弹框输入框获取焦点
  onEditRemarkInputFocus() {
    this.setData({ editRemarkModalKeyboardUp: true })
  },

  // 修改备注弹框输入框失去焦点
  onEditRemarkInputBlur() {
    this.setData({ editRemarkModalKeyboardUp: false })
  },

  // 分配余额
  continueAllocateBalance(e) {
    const { userId, balance } = e.currentTarget.dataset
    const currentBalance = ((balance || 0) / 100).toFixed(2)

    this.setData({
      allocateModal: true,
      allocateUserId: userId,
      allocateAmount: currentBalance,
      displayAllocateAmount: currentBalance,
      currentSubBalance: currentBalance,
      allocateDiff: '0.00'
    })
  },

  // 隐藏分配弹框
  hideAllocateModal() {
    this.setData({
      allocateModal: false,
      allocateUserId: '',
      allocateAmount: '',
      displayAllocateAmount: '',
      currentSubBalance: '0.00',
      allocateDiff: '0.00'
    })
  },

  // 输入分配金额
  onAllocateAmountInput(e) {
    const targetAmount = parseFloat(e.detail.value) || 0
    const currentAmount = parseFloat(this.data.currentSubBalance) || 0
    const diff = (targetAmount - currentAmount).toFixed(2)

    this.setData({
      allocateAmount: e.detail.value,
      displayAllocateAmount: e.detail.value,
      allocateDiff: diff > 0 ? diff : '0.00'
    })
  },

  // 确认分配
  async confirmAllocate() {
    const { allocateUserId, allocateAmount, companyBalance, subAccounts } = this.data

    if (!allocateAmount.trim()) {
      wx.showToast({ title: '请输入目标余额', icon: 'none' })
      return
    }

    const targetAmount = parseFloat(allocateAmount)
    if (isNaN(targetAmount) || targetAmount < 0) {
      wx.showToast({ title: '金额不正确', icon: 'none' })
      return
    }

    const currentAmount = parseFloat(this.data.currentSubBalance)

    // 检查目标余额是否大于当前余额
    if (targetAmount <= currentAmount) {
      wx.showToast({ title: '目标余额必须大于当前余额', icon: 'none' })
      return
    }

    // 校验企业余额
    const targetCents = targetAmount * 100
    const enterpriseBalanceCents = parseFloat(companyBalance) * 100
    
    // 计算其他子账号余额总和
    let otherSubBalance = 0
    for (const account of subAccounts) {
      if (account._id !== allocateUserId) {
        otherSubBalance += (account.balance || 0)
      }
    }
    
    // 检查分配后是否超出企业余额
    const totalAfterAllocate = otherSubBalance + targetCents
    if (totalAfterAllocate > enterpriseBalanceCents) {
      wx.showToast({
        title: `超出企业余额，可分配: ¥${((enterpriseBalanceCents - otherSubBalance) / 100).toFixed(2)}`,
        icon: 'none',
        duration: 3000
      })
      return
    }

    wx.showLoading({ title: '分配中...' })

    try {
      const res = await this.callFunction('update', {
        id: allocateUserId,
        balance: targetCents
      })

      console.log('分配余额更新结果:', res)
      wx.hideLoading()

      if (res.result && res.result.success) {
        wx.showToast({ title: '分配成功', icon: 'success' })
        this.hideAllocateModal()
        this.loadUserInfo()
        this.loadSubAccounts()
      } else {
        console.log('分配失败:', res.result?.error)
        wx.showToast({ title: res.result?.error || '分配失败', icon: 'none' })
      }
    } catch (err) {
      console.error('confirmAllocate error:', err)
      wx.hideLoading()
      wx.showToast({ title: '分配失败', icon: 'none' })
    }
  },

  // 显示编辑备注弹框
  showEditRemark(e) {
    const { userId, remark } = e.currentTarget.dataset
    this.setData({
      editRemarkModal: true,
      editRemarkUserId: userId,
      editRemark: remark || ''
    })
  },

  // 隐藏编辑备注弹框
  hideEditRemarkModal() {
    this.setData({
      editRemarkModal: false,
      editRemarkUserId: '',
      editRemark: ''
    })
  },

  // 输入编辑备注
  onEditRemarkInput(e) {
    this.setData({ editRemark: e.detail.value })
  },

  // 保存备注
  async saveRemark() {
    const { editRemarkUserId, editRemark } = this.data

    if (!editRemark.trim()) {
      wx.showToast({ title: '请输入备注名称', icon: 'none' })
      return
    }

    wx.showLoading({ title: '保存中...' })

    try {
      const res = await this.callFunction('update', {
        id: editRemarkUserId,
        remark: editRemark.trim()
      })

      console.log('保存备注更新结果:', res)
      wx.hideLoading()

      if (res.result && res.result.success) {
        wx.showToast({ title: '保存成功', icon: 'success' })
        this.hideEditRemarkModal()
        this.loadSubAccounts()
      } else {
        console.log('保存失败:', res.result?.error)
        wx.showToast({ title: res.result?.error || '保存失败', icon: 'none' })
      }
    } catch (err) {
      console.error('saveRemark error:', err)
      wx.hideLoading()
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  // 删除子账号
  async deleteSubAccount(e) {
    const { userId, phone } = e.currentTarget.dataset

    wx.showModal({
      title: '确认删除',
      content: `确定要删除子账号 ${phone} 吗？`,
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })

          try {
            const result = await this.callFunction('delete', { id: userId })

            wx.hideLoading()

            if (result.result && result.result.success) {
              wx.showToast({ title: '删除成功', icon: 'success' })
              this.loadUserInfo()
              this.loadSubAccounts()
            } else {
              wx.showToast({ title: result.result?.error || '删除失败', icon: 'none' })
            }
          } catch (err) {
            console.error('deleteSubAccount error:', err)
            wx.hideLoading()
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }
})
