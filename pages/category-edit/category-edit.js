// pages/category-edit/category-edit.js
Page({
  data: {
    categoryId: '', // 分类ID（编辑时有值）
    parentId: '', // 父分类ID（添加子分类时有值）
    parentName: '', // 父分类名称
    name: '', // 分类名称
    isEdit: false, // 是否是编辑模式
    type: 'personal' // personal / enterprise
  },

  onLoad(options) {
    const { id, name, parentId, parentName } = options

    this.setData({
      categoryId: id || '',
      name: name ? decodeURIComponent(name) : '',
      parentId: parentId || '',
      parentName: parentName ? decodeURIComponent(parentName) : '',
      isEdit: !!id,
      type: options.type || 'personal'
    })
  },

  // 输入分类名称
  onNameInput(e) {
    this.setData({ name: e.detail.value })
  },

  // 保存
  async save() {
    const { categoryId, name, parentId, isEdit, type } = this.data

    if (!name.trim()) {
      wx.showToast({ title: '请输入分类名称', icon: 'none' })
      return
    }

    wx.showLoading({ title: '保存中...' })

    try {
      const db = wx.cloud.database()

      if (isEdit) {
        // 编辑分类
        await db.collection('material_categories').doc(categoryId).update({
          data: {
            name: name.trim(),
            update_time: db.serverDate()
          }
        })
      } else {
        // 添加分类
        await db.collection('material_categories').add({
          data: {
            name: name.trim(),
            parent_id: parentId || null,
            owner_type: type,
            owner_id: wx.getStorageSync('userId'),
            sort_order: 0,
            create_time: db.serverDate()
          }
        })
      }

      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      console.error('save error:', err)
      wx.hideLoading()
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  }
})
