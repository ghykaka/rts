// pages/materials/materials.js
const app = getApp()

Page({
  data: {
    type: 'personal', // personal / enterprise
    isAdmin: false, // 是否为企业管理员（企业素材库时控制权限）
    canUpload: true, // 是否可以上传
    canManage: true, // 是否可以管理分类
    categories: [],
    materials: [],
    groupedMaterials: [], // 按分类分组的素材列表
    selectedCategory: '',
    selectedSubCategory: '',
    selectedSubCategoryName: '',
    selectedCategoryName: '',
    loading: false,
    showCategoryModal: false, // 分类管理弹框
    newCategoryName: '', // 新分类名称
    categoryLevel: 'top', // top / sub
    parentCategory: '', // 父分类ID
    parentCategoryName: '', // 父分类名称
    topCategories: [], // 一级分类列表
    subCategories: [], // 二级分类列表
    sideScrollTop: 0, // 左侧分类滚动位置
    materialScrollTop: 0, // 右侧素材列表滚动位置
    categoryItemHeight: 90, // 每个分类项的高度(约90rpx)
    showEditMaterialModal: false, // 编辑素材弹框
    editingMaterial: null, // 正在编辑的素材
    editMaterialName: '', // 编辑的素材名称
    showChangeCategoryModal: false, // 修改分类弹框
    changingMaterial: null, // 正在修改分类的素材
    pickerTopCategories: [], // 修改分类时的一级分类
    pickerSubCategories: [], // 修改分类时的二级分类
    pickerSelectedTopCategory: '', // 修改分类时选中的一级分类ID
    pickerSelectedSubCategory: '', // 修改分类时选中的二级分类ID
    pickerSelectedTopCategoryName: '', // 修改分类时选中的一级分类名称
    pickerSelectedSubCategoryName: '', // 修改分类时选中的二级分类名称
    keyboardShown: false // 键盘是否显示
  },

  onLoad(options) {
    const { type } = options
    if (type) {
      this.setData({ type })
    }
    this.checkUserRole()
    this.loadCategories()
    this.loadAllSubCategories() // 初始加载所有二级分类
    this.loadMaterials()
  },

  // 检查用户角色
  checkUserRole() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) return

    if (this.data.type === 'enterprise') {
      // 企业素材库：只有管理员可以上传和管理分类
      const isAdmin = userInfo.role === 'admin'
      this.setData({
        isAdmin: isAdmin,
        canUpload: isAdmin,
        canManage: isAdmin
      })
    } else {
      // 个人素材库：都可以上传和管理
      this.setData({
        canUpload: true,
        canManage: true
      })
    }
  },

  // 获取云存储图片URL
  getCloudImageUrl(fileID) {
    if (!fileID) return ''
    // 如果已经是完整的URL，直接返回
    if (fileID.startsWith('http://') || fileID.startsWith('https://')) {
      return fileID
    }
    // 如果是云存储fileID，直接返回，小程序会自动处理
    return fileID
  },

  // 批量获取临时文件URL
  async getTempFileURLs(fileList) {
    if (!fileList || fileList.length === 0) return []

    try {
      const result = await wx.cloud.getTempFileURL({
        fileList: fileList
      })
      return result.fileList.map(item => item.tempFileURL)
    } catch (err) {
      console.error('getTempFileURLs error:', err)
      // 如果获取失败，返回原始fileID
      return fileList
    }
  },

  async onShow() {
    // 页面显示时刷新分类数据
    const { selectedCategory } = this.data
    await this.loadCategories()

    // 如果之前选中有了一级分类，重新加载其下的二级分类
    if (selectedCategory) {
      await this.loadSubCategories(selectedCategory)
    } else {
      // 全部状态：加载所有一级分类下的二级分类
      await this.loadAllSubCategories()
    }

    // 重新加载素材
    this.loadMaterials()
  },

  async loadCategories() {
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

      // 分离一级和二级分类
      const topCats = allCategories.filter(cat => !cat.parent_id)
      const subCats = allCategories.filter(cat => cat.parent_id)

      this.setData({
        categories: [{ _id: '', name: '全部' }, ...topCats],
        topCategories: topCats
      })

      // 如果之前选中有了一级分类，重新加载其下的二级分类
      if (this.data.selectedCategory) {
        await this.loadSubCategories(this.data.selectedCategory)
      }
    } catch (err) {
      console.error('loadCategories error:', err)
      this.setData({
        categories: [{ _id: '', name: '全部' }],
        topCategories: []
      })
    }
  },

  async loadMaterials() {
    this.setData({ loading: true })

    try {
      const db = wx.cloud.database()
      const userId = wx.getStorageSync('userId')
      const { selectedCategory, selectedSubCategory, subCategories } = this.data

      let whereCondition = {
        owner_type: this.data.type,
        owner_id: userId
      }

      // 根据选择状态设置查询条件
      if (selectedSubCategory === 'all' || (!selectedCategory && !selectedSubCategory)) {
        // 全部状态：查询所有素材
      } else if (selectedCategory && selectedSubCategory) {
        // 选中了一级和二级分类：查询该二级分类下的素材
        whereCondition.category_id = selectedSubCategory
      } else if (selectedCategory) {
        // 选中了一级分类但没有二级分类：查询该一级分类下所有二级分类的素材
        if (subCategories.length > 0) {
          whereCondition.category_id = db.command.in([
            ...subCategories.map(cat => cat._id),
            ''
          ])
        }
      }

      console.log('查询条件:', whereCondition)

      const res = await db.collection('materials')
        .where(whereCondition)
        .orderBy('create_time', 'desc')
        .get()

      const materials = res.data || []
      console.log('查询到的素材数量:', materials.length)

      // 获取所有云存储fileID
      const fileList = materials
        .filter(item => item.url && !item.url.startsWith('http'))
        .map(item => item.url)

      // 批量获取临时URL
      let tempURLs = []
      if (fileList.length > 0) {
        tempURLs = await this.getTempFileURLs(fileList)
      }

      // 创建fileID到临时URL的映射
      const urlMap = new Map()
      fileList.forEach((fileID, index) => {
        if (tempURLs[index]) {
          urlMap.set(fileID, tempURLs[index])
        }
      })

      // 处理素材URL
      const processedMaterials = materials.map(item => {
        if (item.url && !item.url.startsWith('http')) {
          return {
            ...item,
            url: urlMap.get(item.url) || item.url
          }
        }
        return item
      })

      // 按二级分类分组显示
      let grouped = []
      if (selectedSubCategory === 'all' || (!selectedCategory && !selectedSubCategory)) {
        // 全部状态：按所有二级分类分组
        if (subCategories.length > 0) {
          grouped = subCategories.map(category => ({
            categoryId: category._id,
            categoryName: category.name,
            materials: processedMaterials.filter(m => m.category_id === category._id)
          })).filter(group => group.materials.length > 0)

          // 添加未分类的素材
          const ungroupedMaterials = processedMaterials.filter(m => !m.category_id || m.category_id === '')
          if (ungroupedMaterials.length > 0) {
            grouped.push({
              categoryId: '',
              categoryName: '未分类',
              materials: ungroupedMaterials
            })
          }
        } else {
          grouped = [{
            categoryId: '',
            categoryName: '全部素材',
            materials: processedMaterials
          }]
        }
      } else if (selectedSubCategory) {
        // 选中具体二级分类：只显示该分类的素材
        const currentCat = subCategories.find(cat => cat._id === selectedSubCategory)
        grouped = [{
          categoryId: selectedSubCategory,
          categoryName: currentCat ? currentCat.name : '当前分类',
          materials: processedMaterials
        }]
      } else if (selectedCategory) {
        // 选中一级分类：显示该分类下所有二级分类
        if (subCategories.length > 0) {
          grouped = subCategories.map(category => ({
            categoryId: category._id,
            categoryName: category.name,
            materials: processedMaterials.filter(m => m.category_id === category._id)
          })).filter(group => group.materials.length > 0)

          // 添加未分类的素材
          const ungroupedMaterials = processedMaterials.filter(m => !m.category_id || m.category_id === '')
          if (ungroupedMaterials.length > 0) {
            grouped.push({
              categoryId: '',
              categoryName: '未分类',
              materials: ungroupedMaterials
            })
          }
        } else {
          grouped = [{
            categoryId: '',
            categoryName: selectedCategoryName || '全部素材',
            materials: processedMaterials
          }]
        }
      }

      this.setData({
        materials: processedMaterials,
        groupedMaterials: grouped
      })
    } catch (err) {
      console.error('loadMaterials error:', err)
      this.setData({
        materials: [],
        groupedMaterials: []
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  async selectCategory(e) {
    const { id, name } = e.currentTarget.dataset
    this.setData({
      selectedCategory: id,
      selectedSubCategory: '',
      selectedSubCategoryName: '',
      selectedCategoryName: name,
      sideScrollTop: 0,
      materialScrollTop: 0
    })

    if (id) {
      // 加载该一级分类下的二级分类，等待加载完成
      await this.loadSubCategories(id)
    } else {
      // 全部状态：加载所有一级分类下的二级分类
      await this.loadAllSubCategories()
    }

    // 等二级分类加载完成后再加载素材
    this.loadMaterials()
  },

  // 选择全部分类
  selectAllCategory() {
    const { categories } = this.data

    this.setData({
      selectedSubCategory: 'all',
      selectedSubCategoryName: '全部',
      sideScrollTop: 0,
      materialScrollTop: 0
    })

    this.loadMaterials()
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

      this.setData({ subCategories: res.data || [] })
      return res.data || []
    } catch (err) {
      console.error('loadSubCategories error:', err)
      this.setData({ subCategories: [] })
      return []
    }
  },

  // 加载所有二级分类（用于全部状态），按一级分类的顺序排列
  async loadAllSubCategories() {
    try {
      const db = wx.cloud.database()
      const userId = wx.getStorageSync('userId')

      // 先获取所有一级分类（已按 sort_order 排序）
      const topRes = await db.collection('material_categories')
        .where({
          owner_type: this.data.type,
          owner_id: userId,
          parent_id: null
        })
        .orderBy('sort_order', 'asc')
        .get()

      const topCategories = topRes.data || []
      const orderedSubCategories = []

      // 按一级分类的顺序，为每个一级分类获取其二级分类
      for (const topCat of topCategories) {
        const subRes = await db.collection('material_categories')
          .where({
            owner_type: this.data.type,
            owner_id: userId,
            parent_id: topCat._id
          })
          .orderBy('sort_order', 'asc')
          .orderBy('create_time', 'asc')
          .get()

        if (subRes.data && subRes.data.length > 0) {
          orderedSubCategories.push(...subRes.data)
        }
      }

      this.setData({ subCategories: orderedSubCategories })
    } catch (err) {
      console.error('loadAllSubCategories error:', err)
      this.setData({ subCategories: [] })
    }
  },

  // 选择二级分类
  selectSubCategory(e) {
    const { id, name } = e.currentTarget.dataset
    const { subCategories, groupedMaterials } = this.data

    // 计算左侧应该滚动到的位置
    const categoryIndex = subCategories.findIndex(cat => cat._id === id)
    const sideScrollTop = categoryIndex >= 0 ? categoryIndex * this.data.categoryItemHeight : 0

    // 计算右侧应该滚动到的位置
    let materialScrollTop = 0
    const sectionHeaderHeight = 60
    const materialItemHeight = 160

    for (let i = 0; i < groupedMaterials.length; i++) {
      const section = groupedMaterials[i]
      if (section.categoryId === id) {
        break
      }
      materialScrollTop += sectionHeaderHeight + section.materials.length * materialItemHeight
    }

    this.setData({
      selectedSubCategory: id,
      selectedSubCategoryName: name,
      sideScrollTop: sideScrollTop,
      materialScrollTop: materialScrollTop
    })

    // 加载该二级分类下的素材
    this.loadMaterials()
  },

  // 素材列表滚动监听
  onMaterialScroll(e) {
    const { scrollTop } = e.detail
    const { groupedMaterials, subCategories } = this.data

    if (!groupedMaterials || groupedMaterials.length === 0 || !subCategories || subCategories.length === 0) {
      return
    }

    // 每个section的估算高度: 分类标题(60rpx) + 素材数量 * 160rpx
    const sectionHeaderHeight = 60
    const materialItemHeight = 160
    let currentScrollTop = 0

    // 找出当前滚动位置对应的section
    for (let i = 0; i < groupedMaterials.length; i++) {
      const section = groupedMaterials[i]
      const sectionHeight = sectionHeaderHeight + section.materials.length * materialItemHeight

      if (scrollTop >= currentScrollTop && scrollTop < currentScrollTop + sectionHeight) {
        // 当前在这个section中,更新左侧选中的分类
        if (section.categoryId !== this.data.selectedSubCategory) {
          // 计算左侧应该滚动到的位置
          const categoryIndex = subCategories.findIndex(cat => cat._id === section.categoryId)
          const sideScrollTop = categoryIndex >= 0 ? categoryIndex * this.data.categoryItemHeight : 0

          this.setData({
            selectedSubCategory: section.categoryId,
            selectedSubCategoryName: section.categoryName,
            sideScrollTop: sideScrollTop
          })
        }
        break
      }

      currentScrollTop += sectionHeight
    }
  },

  // 跳转分类管理
  goToCategoryManage() {
    wx.navigateTo({
      url: `/pages/category-manage/category-manage?type=${this.data.type}`
    })
  },

  // 跳转上传页面
  goToUpload() {
    wx.navigateTo({
      url: `/pages/material-upload/material-upload?type=${this.data.type}`
    })
  },

  // 跳转上传页面并带入当前分类
  goToUploadWithCategory() {
    const { selectedCategory, selectedSubCategory, selectedCategoryName, selectedSubCategoryName } = this.data

    // 优先使用二级分类ID，如果没有则使用一级分类ID
    const categoryId = selectedSubCategory || selectedCategory
    // 分类名称
    const categoryName = selectedSubCategoryName || selectedCategoryName

    let url = `/pages/material-upload/material-upload?type=${this.data.type}`
    if (categoryId) {
      url += `&categoryId=${categoryId}&categoryName=${encodeURIComponent(categoryName || '')}`
    }

    wx.navigateTo({ url })
  },

  // 预览图片
  previewImage(e) {
    const { item } = e.currentTarget.dataset
    if (item.type !== 'image') {
      this.chooseMaterial(e)
      return
    }

    // 只预览图片，不显示操作菜单
    wx.previewImage({
      current: item.url,
      urls: [item.url]
    })
  },

  // 编辑素材名称
  editMaterialName(e) {
    const item = e.currentTarget?.dataset?.item || e
    this.setData({
      showEditMaterialModal: true,
      editingMaterial: item,
      editMaterialName: item.name || ''
    })
  },

  // 隐藏编辑素材弹框
  hideEditMaterialModal() {
    this.setData({
      showEditMaterialModal: false,
      editingMaterial: null,
      editMaterialName: '',
      keyboardShown: false
    })
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 输入框聚焦
  onInputFocus() {
    this.setData({ keyboardShown: true })
  },

  // 输入框失焦
  onInputBlur() {
    this.setData({ keyboardShown: false })
  },

  // 输入素材名称
  onEditMaterialNameInput(e) {
    this.setData({ editMaterialName: e.detail.value })
  },

  // 清除素材名称
  clearEditMaterialName() {
    this.setData({ editMaterialName: '' })
  },

  // 保存素材名称
  async saveMaterialName() {
    const { editingMaterial, editMaterialName } = this.data

    if (!editMaterialName.trim()) {
      wx.showToast({ title: '请输入素材名称', icon: 'none' })
      return
    }

    wx.showLoading({ title: '保存中...' })

    try {
      const db = wx.cloud.database()

      await db.collection('materials').doc(editingMaterial._id).update({
        data: {
          name: editMaterialName.trim(),
          update_time: db.serverDate()
        }
      })

      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })
      this.hideEditMaterialModal()
      this.loadMaterials()
    } catch (err) {
      console.error('saveMaterialName error:', err)
      wx.hideLoading()
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  // 删除素材
  async deleteMaterial(e) {
    const { id } = e.currentTarget.dataset

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个素材吗？',
      success: async res => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })

          try {
            const db = wx.cloud.database()

            // 删除数据库记录
            await db.collection('materials').doc(id).remove()

            wx.hideLoading()
            wx.showToast({ title: '删除成功', icon: 'success' })
            this.loadMaterials()
          } catch (err) {
            console.error('deleteMaterial error:', err)
            wx.hideLoading()
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 获取分类名称
  getCategoryNames(categoryId) {
    if (!categoryId) {
      return '未分类'
    }

    const { categories, subCategories } = this.data

    // 查找一级分类
    for (const topCat of categories) {
      // 查找二级分类
      if (topCat.children) {
        for (const subCat of topCat.children) {
          if (subCat._id === categoryId) {
            return `${topCat.name} - ${subCat.name}`
          }
        }
      }
    }

    return '未分类'
  },

  // 修改素材分类
  async changeMaterialCategory(e) {
    const item = e.currentTarget.dataset.item
    if (!item) return

    // 显示修改分类弹框，先设置一级分类为"全部"
    this.setData({
      showChangeCategoryModal: true,
      changingMaterial: item,
      pickerTopCategories: this.data.topCategories,
      pickerSubCategories: [],
      pickerSelectedTopCategory: '',
      pickerSelectedSubCategory: item.category_id || '',
      pickerSelectedTopCategoryName: '',
      pickerSelectedSubCategoryName: ''
    })

    // 如果素材有分类，查找其一级分类
    if (item.category_id) {
      await this.loadCategoriesForMaterial(item.category_id)
    }
  },

  // 根据素材的二级分类ID，加载对应的一级分类并选中
  async loadCategoriesForMaterial(subCategoryId) {
    if (!subCategoryId) return

    try {
      const db = wx.cloud.database()
      const userId = wx.getStorageSync('userId')

      // 查询该二级分类的信息
      const catRes = await db.collection('material_categories').doc(subCategoryId).get()

      if (catRes.data && catRes.data.parent_id) {
        // 找到了父分类（一级分类）
        const topCatId = catRes.data.parent_id
        const topCatName = catRes.data.name || ''

        // 查找一级分类的信息
        const topCat = this.data.pickerTopCategories.find(cat => cat._id === topCatId)

        // 将该一级分类移到数组最前面
        let sortedTopCategories = [...this.data.pickerTopCategories]
        const topCatIndex = sortedTopCategories.findIndex(cat => cat._id === topCatId)
        if (topCatIndex > 0 && topCat) {
          sortedTopCategories.splice(topCatIndex, 1)
          sortedTopCategories.unshift(topCat)
        }

        // 加载该一级分类下的所有二级分类
        await this.loadSubCategoriesForPicker(topCatId)

        // 设置选中状态，并更新一级分类列表（目标分类排在第一位）
        this.setData({
          pickerTopCategories: sortedTopCategories,
          pickerSelectedTopCategory: topCatId,
          pickerSelectedTopCategoryName: topCat ? topCat.name : '',
          pickerSelectedSubCategory: subCategoryId,
          pickerSelectedSubCategoryName: topCatName
        })
      } else if (catRes.data && !catRes.data.parent_id) {
        // 如果素材直接关联的是一级分类（没有二级分类）
        const topCat = this.data.pickerTopCategories.find(cat => cat._id === subCategoryId)

        // 将该一级分类移到数组最前面
        let sortedTopCategories = [...this.data.pickerTopCategories]
        const topCatIndex = sortedTopCategories.findIndex(cat => cat._id === subCategoryId)
        if (topCatIndex > 0 && topCat) {
          sortedTopCategories.splice(topCatIndex, 1)
          sortedTopCategories.unshift(topCat)
        }

        if (topCat) {
          this.setData({
            pickerTopCategories: sortedTopCategories,
            pickerSelectedTopCategory: subCategoryId,
            pickerSelectedTopCategoryName: topCat.name,
            pickerSelectedSubCategory: '',
            pickerSelectedSubCategoryName: ''
          })
          await this.loadSubCategoriesForPicker(subCategoryId)
        }
      }
    } catch (err) {
      console.error('loadCategoriesForMaterial error:', err)
    }
  },

  // 选择修改分类的一级分类
  selectPickerTopCategory(e) {
    const { id, name } = e.currentTarget.dataset

    this.setData({
      pickerSelectedTopCategory: id,
      pickerSelectedTopCategoryName: name,
      pickerSelectedSubCategory: '',
      pickerSelectedSubCategoryName: ''
    })

    // 加载该一级分类下的二级分类
    if (id) {
      this.loadSubCategoriesForPicker(id)
    } else {
      this.setData({ pickerSubCategories: [] })
    }
  },

  // 加载二级分类（用于修改分类弹框）
  async loadSubCategoriesForPicker(parentId) {
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

      this.setData({ pickerSubCategories: res.data || [] })
      return res.data || []
    } catch (err) {
      console.error('loadSubCategoriesForPicker error:', err)
      this.setData({ pickerSubCategories: [] })
      return []
    }
  },

  // 选择修改分类的二级分类
  selectPickerSubCategory(e) {
    const { id, name } = e.currentTarget.dataset
    this.setData({
      pickerSelectedSubCategory: id,
      pickerSelectedSubCategoryName: name
    })
  },

  // 隐藏修改分类弹框
  hideChangeCategoryModal() {
    this.setData({
      showChangeCategoryModal: false,
      changingMaterial: null,
      pickerTopCategories: [],
      pickerSubCategories: [],
      pickerSelectedTopCategory: '',
      pickerSelectedSubCategory: '',
      pickerSelectedTopCategoryName: '',
      pickerSelectedSubCategoryName: ''
    })
  },

  // 确认修改分类
  async confirmChangeCategory() {
    const { changingMaterial, pickerSelectedSubCategory, pickerSelectedTopCategory } = this.data

    if (!changingMaterial) return

    // 如果有二级分类，必须选择一个二级分类
    if (this.data.pickerSubCategories.length > 0 && !pickerSelectedSubCategory) {
      wx.showToast({ title: '请选择二级分类', icon: 'none' })
      return
    }

    // 如果有一级分类但没有二级分类，直接使用一级分类ID
    let targetCategoryId = ''
    if (pickerSelectedSubCategory) {
      targetCategoryId = pickerSelectedSubCategory
    } else if (pickerSelectedTopCategory) {
      targetCategoryId = pickerSelectedTopCategory
    }

    // 更新素材分类
    await this.updateMaterialCategory(changingMaterial, targetCategoryId)
    this.hideChangeCategoryModal()
  },

  // 更新素材分类
  async updateMaterialCategory(item, categoryId) {
    wx.showLoading({ title: '更新中...' })

    try {
      const db = wx.cloud.database()

      await db.collection('materials').doc(item._id).update({
        data: {
          category_id: categoryId,
          update_time: db.serverDate()
        }
      })

      wx.hideLoading()
      wx.showToast({ title: '更新成功', icon: 'success' })
      this.loadMaterials()
    } catch (err) {
      console.error('updateMaterialCategory error:', err)
      wx.hideLoading()
      wx.showToast({ title: '更新失败', icon: 'none' })
    }
  },

  chooseMaterial(e) {
    const { url } = e.currentTarget.dataset
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage) {
      prevPage.setData({
        [`inputData.productImage`]: url
      })
    }
    wx.navigateBack()
  },

  // 显示分类管理弹框
  showCategoryManageModal() {
    this.setData({
      showCategoryModal: true,
      newCategoryName: '',
      categoryLevel: 'top',
      parentCategory: '',
      parentCategoryName: ''
    })
  },

  // 隐藏分类管理弹框
  hideCategoryModal() {
    this.setData({
      showCategoryModal: false,
      newCategoryName: '',
      categoryLevel: 'top',
      parentCategory: '',
      parentCategoryName: ''
    })
  },

  // 输入分类名称
  onCategoryNameInput(e) {
    this.setData({ newCategoryName: e.detail.value })
  },

  // 选择分类级别
  onCategoryLevelChange(e) {
    const level = e.detail.value
    this.setData({
      categoryLevel: level === 1 ? 'top' : 'sub',
      parentCategory: '',
      parentCategoryName: ''
    })
  },

  // 选择父分类
  onParentCategoryChange(e) {
    const index = e.detail.value
    const topCat = this.data.topCategories[index]
    if (topCat) {
      this.setData({
        parentCategory: topCat._id,
        parentCategoryName: topCat.name
      })
    }
  },

  // 添加分类
  async addCategory() {
    const { newCategoryName, categoryLevel, parentCategory, topCategories } = this.data

    if (!newCategoryName.trim()) {
      wx.showToast({ title: '请输入分类名称', icon: 'none' })
      return
    }

    if (categoryLevel === 'sub' && !parentCategory) {
      wx.showToast({ title: '请选择父分类', icon: 'none' })
      return
    }

    wx.showLoading({ title: '添加中...' })

    try {
      const db = wx.cloud.database()
      const userId = wx.getStorageSync('userId')

      if (categoryLevel === 'top') {
        // 添加一级分类：将其他一级分类的 sort_order + 1，新分类 sort_order = 0
        const batch = db.batch()
        // 先将其他一级分类的 sort_order + 1
        topCategories.forEach((cat, index) => {
          batch.update(db.collection('material_categories').doc(cat._id), {
            data: { sort_order: index + 1 }
          })
        })
        // 添加新分类，sort_order = 0
        batch.add(db.collection('material_categories'), {
          data: {
            name: newCategoryName.trim(),
            parent_id: null,
            owner_type: this.data.type,
            owner_id: userId,
            sort_order: 0,
            create_time: db.serverDate()
          }
        })
        await batch.commit()
      } else {
        // 添加二级分类
        await db.collection('material_categories').add({
          data: {
            name: newCategoryName.trim(),
            parent_id: parentCategory,
            owner_type: this.data.type,
            owner_id: userId,
            sort_order: 0,
            create_time: db.serverDate()
          }
        })
      }

      wx.hideLoading()
      wx.showToast({ title: '添加成功', icon: 'success' })
      this.hideCategoryModal()
      this.loadCategories()
      this.loadAllSubCategories()
    } catch (err) {
      console.error('addCategory error:', err)
      wx.hideLoading()
      wx.showToast({ title: '添加失败', icon: 'none' })
    }
  },

  // 删除分类
  async deleteCategory(e) {
    const { id } = e.currentTarget.dataset

    wx.showModal({
      title: '确认删除',
      content: '删除分类后，该分类下的素材将移至未分类，确定要删除吗？',
      success: async res => {
        if (res.confirm) {
          try {
            const db = wx.cloud.database()

            // 更新素材的 category_id 为空
            await db.collection('materials')
              .where({ category_id: id })
              .update({
                data: { category_id: '' }
              })

            // 删除分类
            await db.collection('material_categories').doc(id).remove()

            wx.showToast({ title: '删除成功', icon: 'success' })
            this.loadCategories()
          } catch (err) {
            console.error('deleteCategory error:', err)
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }
})
