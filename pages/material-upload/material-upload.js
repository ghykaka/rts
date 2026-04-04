// pages/material-upload/material-upload.js
const app = getApp()

Page({
  data: {
    type: 'personal', // personal / enterprise
    pickerTopCategories: [], // 一级分类列表
    pickerSubCategories: [], // 二级分类列表
    pickerSelectedTopCategory: '', // 选中的一级分类ID
    pickerSelectedSubCategory: '', // 选中的二级分类ID
    selectedCategoryName: '', // 选择的分类名称
    selectedCategoryIds: '', // 选择的分类ID（最终）
    selectedImages: [], // 已选择的图片
    uploading: false
  },

  onLoad(options) {
    const { type, categoryId, categoryName } = options
    if (type) {
      this.setData({ type })
    }

    // 检查权限：企业素材库只有管理员可以上传
    if (type === 'enterprise') {
      const userInfo = wx.getStorageSync('userInfo')
      if (!userInfo || userInfo.role !== 'admin') {
        wx.showToast({ title: '只有企业管理员可以上传素材', icon: 'none' })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
        return
      }
    }

    this.loadTopCategories().then(() => {
      // 如果传入了分类ID，自动选中
      if (categoryId) {
        this.autoSelectCategory(categoryId, decodeURIComponent(categoryName || ''))
      }
    })
  },

  // 自动选中传入的分类
  async autoSelectCategory(categoryId, categoryName) {
    const { pickerTopCategories } = this.data

    // 查找该分类属于哪个一级分类
    for (const topCat of pickerTopCategories) {
      // 查询该一级分类下的二级分类
      const subCats = await this.getSubCategories(topCat._id)
      const subCat = subCats.find(cat => cat._id === categoryId)

      if (subCat) {
        // 找到了二级分类
        this.setData({
          pickerSelectedTopCategory: topCat._id,
          pickerSelectedSubCategory: categoryId,
          selectedCategoryName: categoryName || `${topCat.name} - ${subCat.name}`,
          selectedCategoryIds: categoryId
        })
        // 加载二级分类列表
        await this.loadSubCategories(topCat._id)
        return
      }
    }

    // 如果没找到二级分类，可能是传入的是一级分类ID
    const topCat = pickerTopCategories.find(cat => cat._id === categoryId)
    if (topCat) {
      this.setData({
        pickerSelectedTopCategory: categoryId,
        selectedCategoryName: categoryName || topCat.name
      })
      // 加载二级分类列表
      await this.loadSubCategories(categoryId)
    }
  },

  // 获取二级分类（不更新data）
  async getSubCategories(parentId) {
    try {
      const db = wx.cloud.database()
      const userId = wx.getStorageSync('userId')

      const res = await db.collection('material_categories')
        .where({
          owner_type: this.data.type,
          owner_id: userId,
          parent_id: parentId
        })
        .orderBy('sort_order', 'asc')
        .get()

      return res.data || []
    } catch (err) {
      console.error('getSubCategories error:', err)
      return []
    }
  },

  // 加载一级分类
  async loadTopCategories() {
    try {
      const db = wx.cloud.database()
      const userId = wx.getStorageSync('userId')

      const res = await db.collection('material_categories')
        .where({
          owner_type: this.data.type,
          owner_id: userId,
          parent_id: null
        })
        .orderBy('sort_order', 'asc')
        .orderBy('create_time', 'asc')
        .get()

      this.setData({
        pickerTopCategories: res.data || []
      })
      return res.data || []
    } catch (err) {
      console.error('loadTopCategories error:', err)
      this.setData({ pickerTopCategories: [] })
      return []
    }
  },

  // 选择一级分类
  async selectPickerTopCategory(e) {
    const { id, name } = e.currentTarget.dataset
    this.setData({
      pickerSelectedTopCategory: id,
      pickerSelectedSubCategory: '',
      selectedCategoryName: name,
      selectedCategoryIds: ''
    })

    // 加载二级分类
    const subCats = await this.loadSubCategories(id)

    // 如果没有二级分类，使用一级分类ID作为 selectedCategoryIds
    if (!subCats || subCats.length === 0) {
      this.setData({
        selectedCategoryIds: id,
        selectedCategoryName: name
      })
    }
  },

  // 加载二级分类
  async loadSubCategories(parentId) {
    try {
      const db = wx.cloud.database()
      const userId = wx.getStorageSync('userId')

      const res = await db.collection('material_categories')
        .where({
          owner_type: this.data.type,
          owner_id: userId,
          parent_id: parentId
        })
        .orderBy('sort_order', 'asc')
        .orderBy('create_time', 'asc')
        .get()

      this.setData({
        pickerSubCategories: res.data || []
      })
      return res.data || []
    } catch (err) {
      console.error('loadSubCategories error:', err)
      this.setData({ pickerSubCategories: [] })
      return []
    }
  },

  // 选择二级分类
  selectPickerSubCategory(e) {
    const { id, name } = e.currentTarget.dataset
    const topCat = this.data.pickerTopCategories.find(cat => cat._id === this.data.pickerSelectedTopCategory)

    this.setData({
      pickerSelectedSubCategory: id,
      selectedCategoryName: `${topCat.name} - ${name}`,
      selectedCategoryIds: id
    })
  },

  // 选择图片
  chooseImages() {
    const currentCount = this.data.selectedImages.length
    const remainCount = 9 - currentCount

    wx.chooseMedia({
      count: remainCount,
      mediaType: ['image'],
      success: res => {
        if (!res.tempFiles || res.tempFiles.length === 0) {
          return
        }
        this.setData({
          selectedImages: [...this.data.selectedImages, ...res.tempFiles]
        })
      }
    })
  },

  // 删除图片
  deleteImage(e) {
    const { index } = e.currentTarget.dataset
    this.setData({
      selectedImages: this.data.selectedImages.filter((_, i) => i !== index)
    })
  },

  // 上传图片
  async uploadImages() {
    if (!this.data.selectedCategoryIds) {
      wx.showToast({ title: '请选择分类', icon: 'none' })
      return
    }

    if (this.data.selectedImages.length === 0) {
      wx.showToast({ title: '请选择图片', icon: 'none' })
      return
    }

    if (this.data.uploading) {
      return
    }

    this.setData({ uploading: true })

    try {
      const db = wx.cloud.database()
      const userId = wx.getStorageSync('userId')

      for (const image of this.data.selectedImages) {
        // 上传到云存储
        const cloudPath = `materials/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath,
          filePath: image.tempFilePath
        })

        if (!uploadRes.fileID) {
          throw new Error('上传失败')
        }

        // 保存到数据库
        await db.collection('materials').add({
          data: {
            url: uploadRes.fileID,
            name: '未命名素材',
            type: 'image',
            category_id: this.data.selectedCategoryIds,
            owner_type: this.data.type,
            owner_id: userId,
            create_time: db.serverDate()
          }
        })
      }

      wx.hideLoading()
      wx.showToast({ title: '上传成功', icon: 'success' })

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      console.error('uploadImages error:', err)
      wx.hideLoading()
      wx.showToast({ title: '上传失败，请重试', icon: 'none' })
    } finally {
      this.setData({ uploading: false })
    }
  }
})
