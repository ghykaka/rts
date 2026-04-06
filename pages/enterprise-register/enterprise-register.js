// pages/enterprise-register/enterprise-register.js
Page({
  data: {
    companyName: '',
    companyShortName: '',
    industry: '',
    industries: ['互联网', '电子商务', '金融', '教育', '医疗', '房地产', '制造业', '零售', '其他'],
    showIndustryPicker: false,
    selectedIndustryIndex: -1
  },

  // 输入企业名称
  onCompanyNameInput(e) {
    this.setData({ companyName: e.detail.value })
  },

  // 输入企业简称
  onCompanyShortNameInput(e) {
    this.setData({ companyShortName: e.detail.value })
  },

  // 显示行业选择
  showIndustrySelector() {
    this.setData({ showIndustryPicker: true })
  },

  // 选择行业
  onIndustryChange(e) {
    this.setData({
      selectedIndustryIndex: parseInt(e.detail.value),
      industry: this.data.industries[parseInt(e.detail.value)]
    })
  },

  // 取消选择
  onIndustryCancel() {
    this.setData({ showIndustryPicker: false })
  },

  // 确认选择
  onIndustryConfirm(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      selectedIndustryIndex: index,
      industry: this.data.industries[index],
      showIndustryPicker: false
    })
  },

  // 提交注册
  async submitRegister() {
    const { companyName, companyShortName, industry } = this.data

    if (!companyName.trim()) {
      wx.showToast({ title: '请输入企业名称', icon: 'none' })
      return
    }

    if (!companyShortName.trim()) {
      wx.showToast({ title: '请输入企业简称', icon: 'none' })
      return
    }

    if (!industry) {
      wx.showToast({ title: '请选择行业', icon: 'none' })
      return
    }

    wx.showLoading({ title: '正在注册...' })

    try {
      const db = wx.cloud.database()

      // 查询是否存在同名企业(模糊匹配)
      const res = await db.collection('enterprises')
        .where({
          company_name: db.RegExp({
            regexp: companyName,
            options: 'i'
          })
        })
        .get()

      if (res.data && res.data.length > 0) {
        const existEnterprise = res.data[0]
        const adminNickname = existEnterprise.admin_nickname || '未知'

        wx.hideLoading()
        wx.showModal({
          title: '企业已存在',
          content: `已存在同名企业"${existEnterprise.company_name}",管理员为"${adminNickname}",可联系他为你分配余额。是否继续注册?`,
          confirmText: '继续注册',
          cancelText: '取消',
          success: (modalRes) => {
            if (modalRes.confirm) {
              this.createEnterprise(companyName, companyShortName, industry)
            }
          }
        })
        return
      }

      // 查询简称是否存在
      const shortNameRes = await db.collection('enterprises')
        .where({
          company_short_name: companyShortName
        })
        .get()

      if (shortNameRes.data && shortNameRes.data.length > 0) {
        wx.hideLoading()
        wx.showModal({
          title: '简称已被使用',
          content: `企业简称"${companyShortName}"已被其他企业使用,请更换`,
          showCancel: false
        })
        return
      }

      // 创建企业
      await this.createEnterprise(companyName, companyShortName, industry)
    } catch (err) {
      console.error('submitRegister error:', err)
      wx.hideLoading()
      wx.showToast({ title: '注册失败', icon: 'none' })
    }
  },

  // 创建企业
  async createEnterprise(companyName, companyShortName, industry) {
    try {
      const db = wx.cloud.database()
      const userId = wx.getStorageSync('userId')
      const userInfo = wx.getStorageSync('userInfo')

      // 创建企业记录
      const enterpriseRes = await db.collection('enterprises').add({
        data: {
          company_name: companyName,
          company_short_name: companyShortName,
          industry: industry,
          admin_user_id: userId,
          admin_phone: userInfo?.phone || '',
          admin_nickname: userInfo?.nickname || '',
          balance: 0,  // 初始化企业余额为0
          create_time: db.serverDate(),
          update_time: db.serverDate()
        }
      })

      const enterpriseId = enterpriseRes._id

      // 更新用户信息为企业用户
      await db.collection('users').doc(userId).update({
        data: {
          user_type: 'enterprise',
          enterprise_id: enterpriseId,
          company_name: companyName,
          company_short_name: companyShortName,
          industry: industry,
          role: 'admin', // 管理员角色
          update_time: db.serverDate()
        }
      })

      // 更新本地存储
      const updatedUserInfo = {
        ...userInfo,
        user_type: 'enterprise',
        enterprise_id: enterpriseId,
        company_name: companyName,
        company_short_name: companyShortName,
        industry: industry,
        role: 'admin'
      }
      wx.setStorageSync('userInfo', updatedUserInfo)

      wx.hideLoading()
      wx.showToast({ title: '注册成功', icon: 'success' })

      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      console.error('createEnterprise error:', err)
      wx.hideLoading()
      wx.showToast({ title: '创建企业失败', icon: 'none' })
    }
  }
})
