// pages/category-manage/category-manage.js
Page({
  data: {
    type: 'personal', // personal / enterprise
    categories: [],
    loading: false,
    isDragging: false,
    draggingId: '',
    dragOverId: '',
    itemHeight: 96 // 每个分类项的高度(rpx转换为px约48px * 2)
  },

  onLoad(options) {
    const { type } = options
    if (type) {
      this.setData({ type })
    }

    // 检查权限：企业素材库分类只有管理员可以管理
    if (type === 'enterprise') {
      const userInfo = wx.getStorageSync('userInfo')
      if (!userInfo || userInfo.role !== 'admin') {
        wx.showToast({ title: '只有企业管理员可以管理分类', icon: 'none' })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
        return
      }
    }

    this.loadCategories()
  },

  onShow() {
    this.loadCategories()
  },

  // 加载分类
  async loadCategories() {
    this.setData({ loading: true })

    try {
      const db = wx.cloud.database()
      const userId = wx.getStorageSync('userId')

      const res = await db.collection('material_categories')
        .where({
          owner_type: this.data.type,
          owner_id: userId
        })
        .orderBy('sort_order', 'asc')
        .orderBy('create_time', 'asc')
        .get()

      const allCategories = res.data || []

      // 构建树形结构
      const tree = this.buildCategoryTree(allCategories)
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
    const map = {}
    const roots = []

    // 创建映射
    categories.forEach(cat => {
      map[cat._id] = { ...cat, children: [] }
    })

    // 构建树
    categories.forEach(cat => {
      const node = map[cat._id]
      if (cat.parent_id && map[cat.parent_id]) {
        map[cat.parent_id].children.push(node)
      } else {
        roots.push(node)
      }
    })

    return roots
  },

  // 阻止页面滚动
  preventScroll(e) {
    // 空函数，用于阻止scroll-view滚动
  },

  // 长按开始拖拽
  handleLongPress(e) {
    const { id } = e.currentTarget.dataset
    this.setData({
      isDragging: true,
      draggingId: id,
      dragOverId: ''
    })
    wx.vibrateShort({ type: 'medium' })
  },

  // 拖拽移动
  handleTouchMove(e) {
    if (!this.data.isDragging) return

    const touch = e.touches[0]
    const { pageY } = touch

    // 获取屏幕信息计算每个分类项的高度
    const systemInfo = wx.getSystemInfoSync()
    const screenWidth = systemInfo.windowWidth
    const itemHeightPx = 96 * (screenWidth / 750) // 将rpx转换为px

    // 计算滚动位置
    const query = wx.createSelectorQuery()
    query.select('.category-list').boundingClientRect((listRect) => {
      if (!listRect) return

      // 计算相对位置
      const relativeY = pageY - listRect.top + (listRect.scrollTop || 0)

      // 计算当前触摸位置对应的索引
      const index = Math.floor(relativeY / itemHeightPx)

      // 获取对应位置的分类项
      this.findCategoryByTouchIndex(index)
    }).exec()
  },

  // 根据触摸索引找到对应的分类项
  findCategoryByTouchIndex(touchIndex) {
    const { categories, draggingId } = this.data
    let currentIndex = 0

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i]

      // 一级分类
      if (currentIndex === touchIndex && cat._id !== draggingId) {
        this.setData({ dragOverId: cat._id })
        return
      }
      currentIndex++

      // 二级分类
      if (cat.children && cat.children.length > 0) {
        for (let j = 0; j < cat.children.length; j++) {
          if (currentIndex === touchIndex && cat.children[j]._id !== draggingId) {
            this.setData({ dragOverId: cat.children[j]._id })
            return
          }
          currentIndex++
        }
      }
    }
  },

  // 拖拽结束
  handleTouchEnd(e) {
    if (!this.data.isDragging) return

    const { draggingId, dragOverId } = this.data

    if (draggingId && dragOverId && draggingId !== dragOverId) {
      // 执行排序
      this.performReorder(draggingId, dragOverId)
    } else {
      // 没有移动到有效位置，结束拖拽
      wx.showToast({ title: '拖拽到其他位置后松开', icon: 'none', duration: 1000 })
    }

    this.setData({
      isDragging: false,
      draggingId: '',
      dragOverId: ''
    })
  },

  // 取消拖拽
  handleTouchCancel() {
    this.setData({
      isDragging: false,
      draggingId: '',
      dragOverId: ''
    })
  },

  // 执行重新排序
  async performReorder(fromId, toId) {
    const { categories } = this.data

    // 收集所有分类项（包括一级和二级）
    const allItems = []

    // 添加一级分类
    categories.forEach((cat, topIndex) => {
      allItems.push({
        id: cat._id,
        level: 'top',
        parentId: '',
        sortIndex: topIndex
      })

      // 添加二级分类
      if (cat.children && cat.children.length > 0) {
        cat.children.forEach((subCat, subIndex) => {
          allItems.push({
            id: subCat._id,
            level: 'sub',
            parentId: cat._id,
            sortIndex: subIndex
          })
        })
      }
    })

    // 找到源项和目标项
    const fromIndex = allItems.findIndex(item => item.id === fromId)
    const toIndex = allItems.findIndex(item => item.id === toId)

    if (fromIndex === -1 || toIndex === -1) return

    const fromItem = allItems[fromIndex]
    const toItem = allItems[toIndex]

    // 只允许同级别排序
    if (fromItem.level !== toItem.level) {
      wx.showToast({ title: '只能同级别排序', icon: 'none' })
      return
    }

    // 执行排序
    try {
      const db = wx.cloud.database()

      if (fromItem.level === 'top') {
        // 一级分类排序
        const newCategories = [...categories]
        const fromCat = newCategories.splice(fromItem.sortIndex, 1)[0]
        newCategories.splice(toItem.sortIndex, 0, fromCat)

        // 更新所有一级分类的 sort_order
        for (let i = 0; i < newCategories.length; i++) {
          await db.collection('material_categories').doc(newCategories[i]._id).update({
            data: { sort_order: i }
          })
        }

        this.setData({ categories: newCategories })
      } else {
        // 二级分类排序
        const newCategories = categories.map(cat => ({ ...cat, children: [...(cat.children || [])] }))
        const parentIndex = newCategories.findIndex(cat => cat._id === fromItem.parentId)

        if (parentIndex !== -1 && fromItem.parentId === toItem.parentId) {
          // 同一父分类下排序
          const children = newCategories[parentIndex].children
          // 使用 fromItem.sortIndex 和 toItem.sortIndex 获取正确的子分类索引
          const fromSubCat = children.splice(fromItem.sortIndex, 1)[0]
          children.splice(toItem.sortIndex, 0, fromSubCat)

          // 更新所有二级分类的 sort_order
          for (let i = 0; i < children.length; i++) {
            await db.collection('material_categories').doc(children[i]._id).update({
              data: { sort_order: i }
            })
          }

          this.setData({ categories: newCategories })
        } else {
          wx.showToast({ title: '只能同分类下排序', icon: 'none' })
          return
        }
      }

      wx.showToast({ title: '排序成功', icon: 'success' })
    } catch (err) {
      console.error('performReorder error:', err)
      wx.showToast({ title: '排序失败', icon: 'none' })
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
            const db = wx.cloud.database()

            // 检查是否有素材使用该分类
            const materialsRes = await db.collection('materials')
              .where({ category_id: id })
              .get()

            if (materialsRes.data && materialsRes.data.length > 0) {
              wx.hideLoading()
              wx.showModal({
                title: '无法删除',
                content: '该分类下有素材，请先移除或删除素材后再删除分类',
                showCancel: false
              })
              return
            }

            // 检查是否有子分类
            const childrenRes = await db.collection('material_categories')
              .where({ parent_id: id })
              .get()

            if (childrenRes.data && childrenRes.data.length > 0) {
              wx.hideLoading()
              wx.showModal({
                title: '无法删除',
                content: '该分类下有子分类，请先删除子分类后再删除',
                showCancel: false
              })
              return
            }

            // 删除分类
            await db.collection('material_categories').doc(id).remove()

            wx.hideLoading()
            wx.showToast({ title: '删除成功', icon: 'success' })
            this.loadCategories()
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
