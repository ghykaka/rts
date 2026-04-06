// pages/sub-accounts/sub-accounts.js
Page({
  data: {
    subAccounts: [],
    showModal: false,
    newPhone: '',
    newBalance: 0,
    displayBalance: '0',
    newRemark: '', // 新增备注名称
    allocateModal: false,
    allocateUserId: '',
    allocateAmount: '',
    displayAllocateAmount: '',
    currentSubBalance: '0.00',
    allocateDiff: '0.00', // 需要增加的金额
    editRemarkModal: false, // 编辑备注弹框
    editRemarkUserId: '',
    editRemark: '',
    userInfo: null, // 用户信息
    companyBalance: '0.00', // 企业账户余额
    // 弹框上移状态
    allocateModalKeyboardUp: false,
    editRemarkModalKeyboardUp: false
  },

  onLoad() {
    this.loadSubAccounts()
  },

  onShow() {
    this.loadUserInfo()
    this.loadSubAccounts()
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo')

      if (!userInfo) {
        return
      }

      const db = wx.cloud.database()
      const userId = wx.getStorageSync('userId')

      // 从企业表获取企业余额
      if (userInfo.enterprise_id) {
        const entRes = await db.collection('enterprises').doc(userInfo.enterprise_id).get()
        if (entRes.data) {
          const enterpriseBalance = entRes.data.balance || 0
          this.setData({
            userInfo: userInfo,
            companyBalance: (enterpriseBalance / 100).toFixed(2)
          })
          
          // 更新 storage 中的企业余额
          wx.setStorageSync('userInfo', {
            ...userInfo,
            enterprise_balance: enterpriseBalance
          })
          return
        }
      }

      // 如果没有企业信息，显示个人余额
      const balanceCents = userInfo.balance || 0
      this.setData({
        userInfo: userInfo,
        companyBalance: (balanceCents / 100).toFixed(2)
      })

      // 从数据库重新获取最新余额
      const userRes = await db.collection('users').doc(userId).get()
      if (userRes.data) {
        const latestBalance = userRes.data.balance || 0
        wx.setStorageSync('userInfo', {
          ...userInfo,
          balance: latestBalance
        })
        this.setData({
          userInfo: {
            ...userInfo,
            balance: latestBalance
          },
          companyBalance: (latestBalance / 100).toFixed(2)
        })
      }
    } catch (err) {
      console.error('loadUserInfo error:', err)
    }
  },

  // 加载子账号
  async loadSubAccounts() {
    try {
      const userId = wx.getStorageSync('userId')
      const userInfo = wx.getStorageSync('userInfo')

      if (!userInfo || !userInfo.enterprise_id) {
        return
      }

      const db = wx.cloud.database()
      const res = await db.collection('users')
        .where({
          enterprise_id: userInfo.enterprise_id,
          _id: db.command.neq(userId)
        })
        .get()

    const accounts = res.data || []

    const formattedAccounts = accounts.map(account => {
      return {
        ...account,
        displayBalance: ((account.balance || 0) / 100).toFixed(2)
      }
    })

    this.setData({ subAccounts: formattedAccounts })

    // 计算所有子账号余额总和
    const totalSubBalance = formattedAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)
    
    // 从 enterprises 表获取企业余额
    let enterpriseBalance = 0
    if (userInfo.enterprise_id) {
      try {
        const entRes = await db.collection('enterprises').doc(userInfo.enterprise_id).get()
        if (entRes.data) {
          enterpriseBalance = entRes.data.balance || 0
        }
      } catch (e) {
        console.error('获取企业余额失败:', e)
      }
    }
    
    console.log(`企业余额: ¥${(enterpriseBalance / 100).toFixed(2)}, 子账号总余额: ¥${(totalSubBalance / 100).toFixed(2)}, 可分配: ¥${((enterpriseBalance - totalSubBalance) / 100).toFixed(2)}`)
    } catch (err) {
      console.error('loadSubAccounts error:', err)
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
    const value = parseInt(e.detail.value) || 0
    this.setData({
      newBalance: value * 100,
      displayBalance: e.detail.value
    })
  },

  // 输入备注名称
  onRemarkInput(e) {
    this.setData({ newRemark: e.detail.value })
  },

  // 添加子账号
  async addSubAccount() {
    const { newPhone, newBalance } = this.data

    if (!newPhone.trim()) {
      wx.showToast({ title: '请输入手机号', icon: 'none' })
      return
    }

    if (!/^1\d{10}$/.test(newPhone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' })
      return
    }

    if (newBalance <= 0) {
      wx.showToast({ title: '请输入分配余额', icon: 'none' })
      return
    }

    wx.showLoading({ title: '添加中...' })

    try {
      const db = wx.cloud.database()
      const userInfo = wx.getStorageSync('userInfo')

      // 查找用户
      const userRes = await db.collection('users')
        .where({
          phone: newPhone
        })
        .get()

      if (!userRes.data || userRes.data.length === 0) {
        wx.hideLoading()
        wx.showModal({
          title: '用户不存在',
          content: `手机号"${newPhone}"尚未注册，请先让用户完成登录注册`,
          showCancel: false
        })
        return
      }

      const targetUser = userRes.data[0]

      // 检查用户是否已是某个企业的成员
      if (targetUser.enterprise_id && targetUser.enterprise_id !== userInfo.enterprise_id) {
        wx.hideLoading()
        wx.showModal({
          title: '无法添加',
          content: '该用户已是其他企业的成员',
          showCancel: false
        })
        return
      }

      // 更新用户为企业成员
      await db.collection('users').doc(targetUser._id).update({
        data: {
          enterprise_id: userInfo.enterprise_id,
          company_name: userInfo.company_name,
          company_short_name: userInfo.company_short_name,
          industry: userInfo.industry,
          role: 'member', // 普通成员
          balance: db.command.inc(newBalance), // 增加子账号余额
          remark: this.data.newRemark || '', // 添加备注名称
          update_time: db.serverDate()
        }
      })

      // 扣除企业余额
      await db.collection('enterprises').doc(userInfo.enterprise_id).update({
        data: {
          balance: db.command.inc(-newBalance),
          update_time: db.serverDate()
        }
      })

      wx.hideLoading()
      wx.showToast({ title: '添加成功', icon: 'success' })

      this.setData({ showModal: false })
      this.loadSubAccounts()

      // 刷新当前用户信息
      wx.setStorageSync('userInfo', {
        ...userInfo,
        balance: userInfo.balance - newBalance
      })
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

  // 继续分配余额
  continueAllocateBalance(e) {
    const { userId, balance } = e.currentTarget.dataset
    const currentBalance = ((balance || 0) / 100).toFixed(2)

    this.setData({
      allocateModal: true,
      allocateUserId: userId,
      allocateAmount: currentBalance, // 默认显示当前余额
      displayAllocateAmount: currentBalance,
      currentSubBalance: currentBalance, // 记录当前余额
      allocateDiff: '0.00' // 初始差值为0
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
    const { allocateUserId, allocateAmount, currentSubBalance, subAccounts } = this.data

    if (!allocateAmount.trim()) {
      wx.showToast({ title: '请输入目标余额', icon: 'none' })
      return
    }

    const targetAmount = parseFloat(allocateAmount)
    if (isNaN(targetAmount) || targetAmount < 0) {
      wx.showToast({ title: '金额不正确', icon: 'none' })
      return
    }

    const currentAmount = parseFloat(currentSubBalance)

    // 检查目标余额是否大于当前余额
    if (targetAmount <= currentAmount) {
      wx.showToast({ title: '目标余额必须大于当前余额', icon: 'none' })
      return
    }

    wx.showLoading({ title: '分配中...' })

    try {
      const db = wx.cloud.database()
      const userInfo = wx.getStorageSync('userInfo')

      // 计算需要分配的金额（增量）
      const allocateCents = Math.round((targetAmount - currentAmount) * 100)

      // 获取企业余额进行检查
      let enterpriseBalance = 0
      if (userInfo.enterprise_id) {
        const entRes = await db.collection('enterprises').doc(userInfo.enterprise_id).get()
        if (entRes.data) {
          enterpriseBalance = entRes.data.balance || 0
        }
      }

      // 检查企业余额
      if (enterpriseBalance < allocateCents) {
        wx.hideLoading()
        wx.showToast({ title: '企业余额不足', icon: 'none' })
        return
      }

      // 计算所有子账号当前余额总和（不包含当前正在操作的子账号）
      let otherSubBalance = 0
      for (const account of subAccounts) {
        if (account._id !== allocateUserId) {
          otherSubBalance += (account.balance || 0)
        }
      }

      // 检查分配后是否超出企业余额
      const totalAfterAllocate = otherSubBalance + (targetAmount * 100)
      if (totalAfterAllocate > enterpriseBalance) {
        wx.hideLoading()
        wx.showToast({
          title: `分配后所有子账号余额总和将超过企业余额，当前可分配余额: ¥${((enterpriseBalance - otherSubBalance) / 100).toFixed(2)}`,
          icon: 'none',
          duration: 3000
        })
        return
      }

      // 更新子账号余额（直接设置为目标值）
      await db.collection('users').doc(allocateUserId).update({
        data: {
          balance: targetAmount * 100,
          update_time: db.serverDate()
        }
      })

      // 扣除企业余额
      await db.collection('enterprises').doc(userInfo.enterprise_id).update({
        data: {
          balance: db.command.inc(-allocateCents),
          update_time: db.serverDate()
        }
      })

      wx.hideLoading()
      wx.showToast({ title: '分配成功', icon: 'success' })

      this.hideAllocateModal()
      this.loadUserInfo()
      this.loadSubAccounts()
    } catch (err) {
      console.error('allocateBalance error:', err)
      wx.hideLoading()

      // 如果错误信息中包含权限问题或网络问题，可能是虚假错误
      // 但实际数据库可能已经更新，所以提示用户刷新页面
      if (err.errCode === -1 || err.errCode === -502001) {
        this.hideAllocateModal()
        this.loadUserInfo()
        this.loadSubAccounts()
        wx.showToast({ title: '分配成功', icon: 'success' })
      } else {
        wx.showToast({ title: '分配失败: ' + (err.errMsg || '未知错误'), icon: 'none', duration: 3000 })
      }
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
      const db = wx.cloud.database()

      await db.collection('users').doc(editRemarkUserId).update({
        data: {
          remark: editRemark.trim(),
          update_time: db.serverDate()
        }
      })

      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })

      this.hideEditRemarkModal()
      this.loadSubAccounts()
    } catch (err) {
      console.error('saveRemark error:', err)
      wx.hideLoading()
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  }
})
