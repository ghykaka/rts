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
      this.checkAdminPermission(() => {
        this.loadTopCategories().then(() => {
          // 如果传入了分类ID，自动选中
          if (categoryId) {
            this.autoSelectCategory(categoryId, decodeURIComponent(categoryName || ''))
          }
        })
      })
    } else {
      this.loadTopCategories().then(() => {
        // 如果传入了分类ID，自动选中
        if (categoryId) {
          this.autoSelectCategory(categoryId, decodeURIComponent(categoryName || ''))
        }
      })
    }
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

      console.log('=== 权限检查 ===')
      console.log('userId:', userId)

      const res = await wx.cloud.callFunction({
        name: 'getUserInfo',
        data: { userId }
      })

      console.log('getUserInfo result:', JSON.stringify(res.result, null, 2))

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
        console.log('条件1命中：userId === admin_user_id')
      }
      // 条件2：role === 'admin'
      else if (userInfo.role === 'admin') {
        isAdmin = true
        console.log('条件2命中：role === admin')
      }
      // 条件3：有 enterprise_id 但没有 role（兼容老数据）
      else if (userInfo.enterprise_id && !userInfo.role) {
        isAdmin = true
        console.log('条件3命中：有 enterprise_id 但无 role，兼容逻辑')
      }

      console.log('最终 isAdmin:', isAdmin)

      if (!isAdmin) {
        wx.showToast({ title: '只有企业管理员可以上传素材', icon: 'none' })
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
      const userId = wx.getStorageSync('userId')
      const { type } = this.data

      const res = await wx.cloud.callFunction({
        name: 'getAppCategories',
        data: {
          action: 'userMaterialCategories',
          userId: userId,
          userType: type
        }
      })

      // 筛选出该父分类下的二级分类
      const subCategories = (res.result?.data || []).filter(
        cat => cat.parent_id === parentId
      )

      return subCategories
    } catch (err) {
      console.error('getSubCategories error:', err)
      return []
    }
  },

  // 加载一级分类（使用云函数，会自动创建"未分类"）
  async loadTopCategories() {
    try {
      const userId = wx.getStorageSync('userId')
      const { type } = this.data

      const res = await wx.cloud.callFunction({
        name: 'getAppCategories',
        data: {
          action: 'userMaterialCategories',
          userId: userId,
          userType: type
        }
      })

      // 筛选出一级分类（parent_id 为 null 或空）
      const topCategories = (res.result?.data || []).filter(
        cat => !cat.parent_id || cat.parent_id === 'null' || cat.parent_id === ''
      )

      // 默认选中第一个分类
      const defaultCategory = topCategories[0]
      const updateData = {
        pickerTopCategories: topCategories
      }
      
      if (defaultCategory) {
        updateData.pickerSelectedTopCategory = defaultCategory._id
        updateData.selectedCategoryName = defaultCategory.name
        updateData.selectedCategoryIds = defaultCategory._id  // 先用一级分类ID作为临时值
      }

      this.setData(updateData)

      // 自动加载第一个一级分类下的二级分类
      if (defaultCategory) {
        await this.loadSubCategories(defaultCategory._id)
        // 自动选中第一个二级分类
        const subCats = this.data.pickerSubCategories
        if (subCats && subCats.length > 0) {
          const firstSubCat = subCats[0]
          this.setData({
            pickerSelectedSubCategory: firstSubCat._id,
            selectedCategoryName: `${defaultCategory.name} - ${firstSubCat.name}`,
            selectedCategoryIds: firstSubCat._id  // 更新为二级分类ID
          })
        }
      }

      return topCategories
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

    // 如果有二级分类，自动选中第一个
    if (subCats && subCats.length > 0) {
      const firstSubCat = subCats[0]
      this.setData({
        pickerSelectedSubCategory: firstSubCat._id,
        selectedCategoryName: `${name} - ${firstSubCat.name}`,
        selectedCategoryIds: firstSubCat._id  // 使用二级分类ID
      })
    } else {
      // 如果没有二级分类，使用一级分类ID作为 selectedCategoryIds
      this.setData({
        selectedCategoryIds: id,
        selectedCategoryName: name
      })
    }
  },

  // 加载二级分类
  async loadSubCategories(parentId) {
    try {
      const userId = wx.getStorageSync('userId')
      const { type } = this.data

      const res = await wx.cloud.callFunction({
        name: 'getAppCategories',
        data: {
          action: 'userMaterialCategories',
          userId: userId,
          userType: type
        }
      })

      // 筛选出该父分类下的二级分类
      const subCategories = (res.result?.data || []).filter(
        cat => cat.parent_id === parentId
      )

      this.setData({
        pickerSubCategories: subCategories
      })
      return subCategories
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
    if (this.data.selectedImages.length === 0) {
      wx.showToast({ title: '请选择图片', icon: 'none' })
      return
    }

    if (this.data.uploading) {
      return
    }

    this.setData({ uploading: true })
    wx.showLoading({ title: '上传中...' })

    try {
      const db = wx.cloud.database()
      const userId = wx.getStorageSync('userId')
      const { type, pickerTopCategories, pickerSubCategories, selectedCategoryIds, pickerSelectedSubCategory } = this.data

      // 调试日志：检查 type 值
      console.log('=== 上传素材 ===')
      console.log('this.data.type:', this.data.type)
      console.log('type:', type)
      console.log('pickerSelectedTopCategory:', this.data.pickerSelectedTopCategory)

      // 获取分类信息
      let categoryId = selectedCategoryIds
      let category1Id = null

      // 如果没有有效的分类ID，自动获取二级分类
      if (!categoryId && pickerSelectedSubCategory) {
        categoryId = pickerSelectedSubCategory
      }

      // 如果仍然没有分类ID，查找"未分类"并获取其二级分类
      if (!categoryId && pickerTopCategories.length > 0) {
        const defaultCat = pickerTopCategories.find(cat => cat.name === '未分类' || cat.is_default)
        if (defaultCat) {
          const subCats = pickerSubCategories.filter(cat => cat.parent_id === defaultCat._id)
          if (subCats.length > 0) {
            categoryId = subCats[0]._id
          } else {
            const allSubCats = await this.getSubCategories(defaultCat._id)
            if (allSubCats.length > 0) {
              categoryId = allSubCats[0]._id
            } else {
              categoryId = defaultCat._id
            }
          }
        } else if (pickerTopCategories.length > 0) {
          const firstCat = pickerTopCategories[0]
          const subCats = pickerSubCategories.filter(cat => cat.parent_id === firstCat._id)
          if (subCats.length > 0) {
            categoryId = subCats[0]._id
          } else {
            const allSubCats = await this.getSubCategories(firstCat._id)
            if (allSubCats.length > 0) {
              categoryId = allSubCats[0]._id
            } else {
              categoryId = firstCat._id
            }
          }
        }
      }

      // 获取一级分类ID（用于 category1_id）
      if (categoryId) {
        // 直接使用当前选中的一级分类ID
        category1Id = this.data.pickerSelectedTopCategory || ''
        
        // 如果一级分类ID为空，通过查询获取
        if (!category1Id) {
          // 从一级分类列表中查找
          for (const topCat of pickerTopCategories) {
            const subCats = await this.getSubCategories(topCat._id)
            if (subCats.some(cat => cat._id === categoryId)) {
              category1Id = topCat._id
              break
            }
          }
        }
      }

      if (!categoryId) {
        wx.showToast({ title: '获取分类失败', icon: 'none' })
        this.setData({ uploading: false })
        wx.hideLoading()
        return
      }

      console.log('最终使用的分类ID:', categoryId, '一级分类ID:', category1Id)

      // 遍历上传所有图片
      for (let i = 0; i < this.data.selectedImages.length; i++) {
        const image = this.data.selectedImages[i]
        const fileSize = image.size || 0

        // 1. 上传原图
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substr(2, 9)
        const originalPath = `materials/original/${timestamp}_${randomStr}.jpg`
        
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath: originalPath,
          filePath: image.tempFilePath
        })

        if (!uploadRes.fileID) {
          throw new Error('上传原图失败')
        }

        const originalFileId = uploadRes.fileID

        // 2. 生成并上传缩略图（长边250px，保持原图格式，与后台逻辑一致）
        let thumbnailFileId = originalFileId
        
        try {
          // 获取原图信息
          const imageInfo = await new Promise((resolve, reject) => {
            wx.getImageInfo({
              src: image.tempFilePath,
              success: resolve,
              fail: reject
            })
          })
          
          const { width, height, type: imageType } = imageInfo
          // 按长边缩放到250px（与后台逻辑一致）
          const targetLongSide = 250
          let thumbWidth, thumbHeight
          
          if (width >= height) {
            // 宽图：按宽度缩放
            thumbWidth = Math.min(width, targetLongSide)
            thumbHeight = Math.round(height * (thumbWidth / width))
          } else {
            // 高图：按高度缩放
            thumbHeight = Math.min(height, targetLongSide)
            thumbWidth = Math.round(width * (thumbHeight / height))
          }
          
          // 判断原图格式，保持格式一致（与后台一致）
          const isPng = imageType === 'png'
          const fileExt = isPng ? 'png' : 'jpg'
          const fileType = isPng ? 'png' : 'jpg'
          // 与后台保持一致：PNG用最高质量，JPG用90%
          const quality = isPng ? 1.0 : 0.9
          
          console.log(`原图: ${width}x${height} 格式:${imageType}, 缩略图: ${thumbWidth}x${thumbHeight} 格式:${fileExt}`)
          
          // 使用 canvas 2d 类型绘制缩略图
          const thumbnailTempPath = await new Promise((resolve, reject) => {
            const query = wx.createSelectorQuery().in(this)
            query.select('#thumbnailCanvas')
              .fields({ node: true, size: true })
              .exec((res) => {
                if (!res[0] || !res[0].node) {
                  reject(new Error('canvas节点未找到'))
                  return
                }
                
                const canvas = res[0].node
                const ctx = canvas.getContext('2d')
                
                // 设置 canvas 尺寸
                canvas.width = thumbWidth
                canvas.height = thumbHeight
                
                // 创建图片对象
                const img = canvas.createImage()
                img.onload = () => {
                  // 直接绘制图片（不添加任何底色，与后台处理方式一致）
                  ctx.drawImage(img, 0, 0, thumbWidth, thumbHeight)
                  
                  // 导出为临时文件（保持原图格式）
                  wx.canvasToTempFilePath({
                    canvas,
                    x: 0,
                    y: 0,
                    width: thumbWidth,
                    height: thumbHeight,
                    destWidth: thumbWidth,
                    destHeight: thumbHeight,
                    fileType: fileType,  // 保持原图格式
                    quality: quality,
                    success: (fileRes) => resolve(fileRes.tempFilePath),
                    fail: (err) => reject(err)
                  })
                }
                img.onerror = (err) => reject(err)
                img.src = image.tempFilePath
              })
          })
          
          console.log('缩略图生成成功:', thumbnailTempPath)
          
          // 上传缩略图（保持原图格式，与后台处理方式一致）
          const thumbPath = `materials/thumbnail/${timestamp}_${randomStr}.${fileExt}`
          const thumbUploadRes = await wx.cloud.uploadFile({
            cloudPath: thumbPath,
            filePath: thumbnailTempPath
          })
          if (thumbUploadRes.fileID) {
            thumbnailFileId = thumbUploadRes.fileID
            console.log('缩略图上传成功:', thumbnailFileId)
          }
        } catch (err) {
          console.log('缩略图生成失败，使用原图:', err)
          thumbnailFileId = originalFileId
        }

        // 3. 保存到数据库（与后台字段保持一致）
        const materialData = {
          user_id: userId,
          user_type: type || 'personal',
          type: 'image',
          title: '未命名素材',
          content: '',
          url: originalFileId,
          thumbnail_url: thumbnailFileId,
          size: fileSize,
          category1_id: category1Id || '',
          category2_id: categoryId,
          create_time: db.serverDate(),
          update_time: db.serverDate()
        }
        console.log('保存素材数据:', JSON.stringify(materialData, null, 2))
        
        await db.collection('materials').add({
          data: materialData
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
