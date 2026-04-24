// pages/category-manage/category-manage.js
Page({
  data: {
    type: 'personal', // personal / enterprise
    categories: [],
    loading: false
  },

  onLoad(options) {
    const { type } = options
    if (type) {
      this.setData({ type })
    }

    // 检查权限：企业素材库分类只有管理员可以管理
    if (type === 'enterprise') {
      this.checkAdminPermission(() => {
        this.loadCategories()
      })
    } else {
      this.loadCategories()
    }
  },

  onShow() {
    this.loadCategories()
  },

  // 检查企业管理员权限
  async checkAdminPermission(callback) {
    try {
      const userId = wx.getStorageSync('userId')
      if (!userId) {
        wx.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
        return
      }

      const res = await wx.cloud.callFunction({
        name: 'getUserInfo',
        data: { userId }
      })

      if (!res.result || !res.result.success) {
        wx.showToast({ title: '获取用户信息失败', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
        return
      }

      const userInfo = res.result.data
      
      // 判断是否是管理员
      let isAdmin = false
      
      // 条件1：用户有企业信息，且是 admin_user_id
      if (userInfo.admin_user_id && userId === userInfo.admin_user_id) {
        isAdmin = true
      }
      // 条件2：role === 'admin'
      else if (userInfo.role === 'admin') {
        isAdmin = true
      }
      // 条件3：有 enterprise_id 但没有 role（兼容老数据）
      else if (userInfo.enterprise_id && !userInfo.role) {
        isAdmin = true
      }

      if (!isAdmin) {
        wx.showToast({ title: '只有企业管理员可以管理分类', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
        return
      }

      // 更新本地存储
      wx.setStorageSync('userInfo', userInfo)
      
      // 权限检查通过，执行回调
      if (callback) callback()
    } catch (err) {
      console.error('checkAdminPermission error:', err)
      wx.showToast({ title: '权限检查失败', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  // 加载分类
  async loadCategories() {
    this.setData({ loading: true })

    try {
      const userId = wx.getStorageSync('userId')
      const { type } = this.data

      // 使用云函数查询
      const res = await wx.cloud.callFunction({
        name: 'getAppCategories',
        data: {
          action: 'userMaterialCategories',
          userId: userId,
          userType: type
        }
      })

      const allCategories = res.result?.data || []

      // 构建树形结构
      const tree = this.buildCategoryTree(allCategories)
      
      // 打印一级分类名称和 order 值
      const topLevelInfo = tree.map((cat, i) => `${i}:${cat.name}[order=${cat.order}]`)
      console.log('一级分类排序:', topLevelInfo.join(', '))
      
      this.setData({ categories: tree })
    } catch (err) {
      console.error('loadCategories error:', err)
      this.setData({ categories: [] })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 构建分类树
  buildCategoryTree(categories) {
    const roots = []
    const childrenMap = {}

    // 按 order 排序后处理
    const sortedCategories = [...categories].sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level
      return (a.order || 0) - (b.order || 0)
    })

    // 先分离一级和二级分类
    sortedCategories.forEach(cat => {
      if (!cat.parent_id || cat.parent_id === 'null' || cat.parent_id === '') {
        // 一级分类
        childrenMap[cat._id] = []
        roots.push({ ...cat, children: childrenMap[cat._id] })
      } else {
        // 二级分类 - 先收集
        if (!childrenMap[cat.parent_id]) {
          childrenMap[cat.parent_id] = []
        }
        childrenMap[cat.parent_id].push(cat)
      }
    })

    // 对二级分类也按 order 排序
    roots.forEach(root => {
      root.children.sort((a, b) => (a.order || 0) - (b.order || 0))
    })

    return roots
  },

  // 上移
  async moveUp(e) {
    const { id, level, index, parentIndex } = e.currentTarget.dataset
    const { categories } = this.data

    if (level === '1') {
      // 一级分类上移
      if (index === 0) {
        wx.showToast({ title: '已经是第一个了', icon: 'none' })
        return
      }

      // 深拷贝并交换
      const newCategories = JSON.parse(JSON.stringify(categories))
      const updates = [
        { _id: newCategories[index]._id, order: index - 1 },
        { _id: newCategories[index - 1]._id, order: index }
      ]

      // 交换
      const temp = newCategories[index]
      newCategories[index] = newCategories[index - 1]
      newCategories[index - 1] = temp

      this.setData({ categories: newCategories })
      await this.saveSortOrders(updates)
    } else {
      // 二级分类上移
      if (index === 0) {
        wx.showToast({ title: '已经是第一个了', icon: 'none' })
        return
      }

      const newCategories = JSON.parse(JSON.stringify(categories))
      const children = newCategories[parentIndex].children
      const updates = [
        { _id: children[index]._id, order: index - 1 },
        { _id: children[index - 1]._id, order: index }
      ]

      // 交换
      const temp = children[index]
      children[index] = children[index - 1]
      children[index - 1] = temp

      this.setData({ categories: newCategories })
      await this.saveSortOrders(updates)
    }
  },

  // 下移
  async moveDown(e) {
    const { id, level, index, parentIndex } = e.currentTarget.dataset
    const { categories } = this.data

    if (level === '1') {
      // 一级分类下移
      if (index === categories.length - 1) {
        wx.showToast({ title: '已经是最后一个了', icon: 'none' })
        return
      }

      const newCategories = JSON.parse(JSON.stringify(categories))
      const updates = [
        { _id: newCategories[index]._id, order: index + 1 },
        { _id: newCategories[index + 1]._id, order: index }
      ]

      // 交换
      const temp = newCategories[index]
      newCategories[index] = newCategories[index + 1]
      newCategories[index + 1] = temp

      this.setData({ categories: newCategories })
      await this.saveSortOrders(updates)
    } else {
      // 二级分类下移
      const newCategories = JSON.parse(JSON.stringify(categories))
      const children = newCategories[parentIndex].children
      if (index === children.length - 1) {
        wx.showToast({ title: '已经是最后一个了', icon: 'none' })
        return
      }

      const updates = [
        { _id: children[index]._id, order: index + 1 },
        { _id: children[index + 1]._id, order: index }
      ]

      // 交换
      const temp = children[index]
      children[index] = children[index + 1]
      children[index + 1] = temp

      this.setData({ categories: newCategories })
      await this.saveSortOrders(updates)
    }
  },

  // 保存排序（使用轻量级云函数，不刷新页面）
  async saveSortOrders(updates) {
    console.log('saveSortOrders called with:', JSON.stringify(updates))
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'updateCategorySort',
        data: { updates }
      })

      console.log('saveSortOrders result:', JSON.stringify(result))

      if (result.result && result.result.success) {
        wx.showToast({ title: '排序已保存', icon: 'success', duration: 800 })
      } else {
        console.error('排序失败:', result.result?.error)
        wx.showToast({ title: '排序保存失败', icon: 'none' })
      }
    } catch (err) {
      console.error('saveSortOrders error:', err)
      wx.showToast({ title: '排序保存失败', icon: 'none' })
    }
  },

  // 编辑分类
  editCategory(e) {
    const { id, name, parentId } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/category-edit/category-edit?id=${id}&name=${encodeURIComponent(name)}&parentId=${parentId || ''}&type=${this.data.type}`
    })
  },

  // 删除分类
  async deleteCategory(e) {
    const { id, name } = e.currentTarget.dataset

    wx.showModal({
      title: '确认删除',
      content: `确定要删除"${name}"分类吗？`,
      success: async res => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })

          try {
            const result = await wx.cloud.callFunction({
              name: 'getAppCategories',
              data: {
                action: 'deleteCategory',
                categoryId: id
              }
            })

            wx.hideLoading()

            if (result.result && result.result.success) {
              wx.showToast({ title: '删除成功', icon: 'success' })
              this.loadCategories()
            } else {
              wx.showModal({
                title: '无法删除',
                content: result.result?.error || '删除失败',
                showCancel: false
              })
            }
          } catch (err) {
            console.error('deleteCategory error:', err)
            wx.hideLoading()
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 添加子分类
  addSubCategory(e) {
    const { id, name } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/category-edit/category-edit?parentId=${id}&parentName=${encodeURIComponent(name)}&type=${this.data.type}`
    })
  },

  // 添加一级分类
  addTopCategory() {
    wx.navigateTo({
      url: `/pages/category-edit/category-edit?type=${this.data.type}`
    })
  }
})
