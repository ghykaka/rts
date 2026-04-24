// pages/enterprise-materials/enterprise-materials.js
const app = getApp()

Page({
  data: {
    isLogin: false,
    type: 'enterprise', // 固定为企业素材库
    isAdmin: false, // 是否为企业管理员
    canUpload: false, // 是否可以上传
    canManage: false, // 是否可以管理分类
    categories: [],
    materials: [],
    groupedMaterials: [], // 按分类分组的素材列表
    selectedCategory: '',
    selectedSubCategory: '',
    selectedSubCategoryName: '',
    selectedCategoryName: '',
    loading: false,
    loadingMore: false, // 是否正在加载更多
    hasMore: true, // 是否还有更多数据
    pageSize: 20, // 每页数量
    currentPage: 0, // 当前页码
    totalCount: 0, // 总数量
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
    console.log('=== enterprise-materials.js onLoad ===')
    // 固定为企业素材库
    this.setData({ type: 'enterprise' })
    console.log('企业素材库 - this.data.type =', this.data.type)
    this.checkLogin()
    // 先获取完整用户信息（包含企业信息），再检查角色
    this.loadUserInfoAndCheckRole()
    this.loadCategories()
    this.loadAllSubCategories() // 初始加载所有二级分类
    // 不设置 selectedCategory，默认显示所有分类
    this.setData({
      selectedCategory: '',
      selectedSubCategory: '',
      selectedSubCategoryName: '',
      selectedCategoryName: ''
    })
    this.loadMaterials()
  },

  // 获取完整用户信息并检查角色
  async loadUserInfoAndCheckRole() {
    const userId = wx.getStorageSync('userId')
    if (!userId) return

    try {
      const res = await wx.cloud.callFunction({
        name: 'getUserInfo',
        data: { userId }
      })

      if (res.result && res.result.success) {
        const userInfo = res.result.data
        // 更新本地存储的用户信息
        wx.setStorageSync('userInfo', userInfo)
        // 检查角色权限
        this.checkUserRole()
      }
    } catch (err) {
      console.error('loadUserInfoAndCheckRole error:', err)
      // 如果获取失败，仍使用本地缓存的用户信息检查角色
      this.checkUserRole()
    }
  },

  // 上拉加载更多
  onReachBottom() {
    console.log('触发上拉加载更多')
    const { hasMore, loading } = this.data
    if (!hasMore || loading) {
      console.log('无需加载更多: hasMore=', hasMore, 'loading=', loading)
      return
    }
    this.loadMoreMaterials()
  },

  // 检查登录状态
  checkLogin() {
    const userId = wx.getStorageSync('userId')
    this.setData({ isLogin: !!userId })
  },

  // 跳转登录页面
  goLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 检查用户角色
  checkUserRole() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) return

    // 企业素材库：只有管理员可以上传和管理分类
    // 判断逻辑：1. userInfo.role === 'admin' 或 2. 用户是该企业的 admin_user_id
    let isAdmin = userInfo.role === 'admin'

    // 如果没有 role 字段，检查是否是企业的 admin_user_id
    if (!isAdmin && userInfo.enterprise_id && userInfo.admin_user_id) {
      // enterprise_id 和 admin_user_id 同时存在时，该用户是管理员
      isAdmin = (userInfo._id || userInfo.userId) === userInfo.admin_user_id
    }

    // 兼容：如果用户有 enterprise_id 但没有 role，默认允许（老数据兼容）
    if (!isAdmin && userInfo.enterprise_id && !userInfo.role) {
      isAdmin = true
    }

    this.setData({
      isAdmin: isAdmin,
      canUpload: isAdmin,
      canManage: isAdmin
    })
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
      console.log('loadCategories 结果:', allCategories.length, '条')
      console.log('全部分类:', JSON.stringify(allCategories))

      // 一级分类：level=1 且 parent_id 为 null、空字符串、"null"或不存在
      const topCats = allCategories
        .filter(cat => {
          const isLevel1 = cat.level === 1
          const isNoParent = !cat.parent_id || cat.parent_id === null || cat.parent_id === '' || cat.parent_id === 'null'
          console.log('分类:', cat.name, 'level:', cat.level, 'parent_id:', cat.parent_id, 'isLevel1:', isLevel1, 'isNoParent:', isNoParent)
          return isLevel1 && isNoParent
        })
        .sort((a, b) => (a.order || 0) - (b.order || 0))

      console.log('筛选后一级分类:', topCats.length, '条')

      this.setData({
        categories: topCats,
        topCategories: topCats
      })
    } catch (err) {
      console.error('loadCategories error:', err)
      this.setData({
        categories: [],
        topCategories: []
      })
    }
  },

  // 首次加载素材（重置分页）
  async loadMaterials() {
    this.setData({
      loading: true,
      currentPage: 0,
      materials: [],
      groupedMaterials: [],
      hasMore: true
    }, () => {
      // 确保在 setData 完成后执行查询，此时 this.data 是最新的
      this._loadMaterialsCore(false)
    })
  },

  // 加载更多素材（分页）
  async loadMoreMaterials() {
    const { hasMore, loadingMore, currentPage } = this.data
    if (!hasMore || loadingMore) return

    this.setData({ loadingMore: true })
    await this._loadMaterialsCore(true)
  },

  // 素材查询核心逻辑
  async _loadMaterialsCore(isLoadMore = false) {
    try {
      const db = wx.cloud.database()
      const _ = db.command
      const userId = wx.getStorageSync('userId')
      const { selectedCategory, selectedSubCategory, subCategories, type, pageSize, currentPage } = this.data

      // 构建查询条件（与后台保持一致：user_id, user_type, category1_id, category2_id）
      let whereCondition = { 
        user_id: userId,
        user_type: 'enterprise'  // 固定查询企业素材
      }

      // 根据选择状态设置查询条件（使用后台字段 category1_id, category2_id）
      if (!selectedSubCategory) {
        // 空字符串表示"全部"：查询所有素材
      } else if (selectedCategory && selectedSubCategory) {
        // 选中了一级和二级分类：查询该二级分类下的素材
        whereCondition.category2_id = selectedSubCategory
      } else if (selectedCategory) {
        // 选中了一级分类但没有二级分类：查询该一级分类下所有二级分类的素材
        if (subCategories.length > 0) {
          const subCategoryIds = subCategories.map(cat => cat._id)
          whereCondition.category2_id = _.in(subCategoryIds)
        }
      }

      console.log('查询条件:', whereCondition)
      console.log('selectedCategory:', selectedCategory, 'selectedSubCategory:', selectedSubCategory)
      console.log('subCategories.length:', subCategories.length)

      // 构建分页查询（按创建时间升序，最早的在前）
      let query = db.collection('materials')
        .where(whereCondition)
        .orderBy('create_time', 'asc')

      if (isLoadMore) {
        // 加载更多：跳过已加载的数据
        query = query.skip((currentPage + 1) * pageSize).limit(pageSize)
      } else {
        // 首次加载
        query = query.limit(pageSize)
      }

      const res = await query.get()

      const newMaterials = res.data || []
      console.log('查询到的素材数量:', newMaterials.length, isLoadMore ? '(加载更多)' : '(首次加载)')

      // 如果是加载更多，判断是否还有更多数据
      let hasMore = true
      if (newMaterials.length < pageSize) {
        hasMore = false
      }

      console.log('subCategories数量:', subCategories.length)
      console.log('subCategories数据:', subCategories)

      // 获取所有云存储fileID（包括 url 和 thumbnail_url）
      const allFileIds = []
      const fileIdIndexMap = new Map() // 用于去重和记录索引

      newMaterials.forEach(item => {
        // 添加 url
        if (item.url && !item.url.startsWith('http') && !fileIdIndexMap.has(item.url)) {
          fileIdIndexMap.set(item.url, allFileIds.length)
          allFileIds.push(item.url)
        }
        // 添加 thumbnail_url（如果与 url 不同）
        if (item.thumbnail_url && !item.thumbnail_url.startsWith('http') && !fileIdIndexMap.has(item.thumbnail_url)) {
          fileIdIndexMap.set(item.thumbnail_url, allFileIds.length)
          allFileIds.push(item.thumbnail_url)
        }
      })

      // 批量获取临时URL
      let tempURLs = []
      if (allFileIds.length > 0) {
        tempURLs = await this.getTempFileURLs(allFileIds)
      }

      // 创建fileID到临时URL的映射
      const urlMap = new Map()
      allFileIds.forEach((fileID, index) => {
        if (tempURLs[index]) {
          urlMap.set(fileID, tempURLs[index])
        }
      })

      // 处理素材URL（与后台字段保持一致）
      const processedMaterials = newMaterials.map(item => {
        let url = item.url || ''
        let thumbnailUrl = item.thumbnail_url || item.url || ''

        // 处理云存储fileID转临时URL
        if (url && !url.startsWith('http')) {
          url = urlMap.get(url) || url
        }
        if (thumbnailUrl && !thumbnailUrl.startsWith('http')) {
          thumbnailUrl = urlMap.get(thumbnailUrl) || thumbnailUrl
        }

        // 计算显示名称：使用后台的 title 字段
        let displayName = item.title || item.name || ''
        if (!displayName && url) {
          // 从 URL 中提取文件名作为备选
          const urlParts = url.split('/')
          const filename = urlParts[urlParts.length - 1] || ''
          // 去掉文件扩展名
          displayName = filename.replace(/\.[^/.]+$/, '') || '未命名素材'
        }
        if (!displayName) {
          displayName = '未命名素材'
        }

        return {
          ...item,
          url: url,
          thumbnail_url: thumbnailUrl,
          displayName: displayName
        }
      })

      // 按二级分类分组显示（与后台字段保持一致：category2_id）
      const getCategoryId = (m) => m.category2_id || m.category_id || ''

      let grouped = []

      // 选中具体二级分类：只显示该分类的素材
      if (selectedSubCategory) {
        const currentCat = subCategories.find(cat => cat._id === selectedSubCategory)
        grouped = [{
          categoryId: selectedSubCategory,
          categoryName: currentCat ? currentCat.name : '当前分类',
          materials: processedMaterials
        }]
      }
      // 选中一级分类：显示该分类下所有二级分类
      else if (selectedCategory) {
        if (subCategories.length > 0) {
          // 按 order 排序后分组
          const sortedSubCategories = [...subCategories].sort((a, b) => (a.order || 0) - (b.order || 0))
          grouped = sortedSubCategories.map(category => ({
            categoryId: category._id,
            categoryName: category.name,
            materials: processedMaterials.filter(m => getCategoryId(m) === category._id)
          })).filter(group => group.materials.length > 0)

          // 添加未分类的素材
          const ungroupedMaterials = processedMaterials.filter(m => !getCategoryId(m))
          if (ungroupedMaterials.length > 0) {
            grouped.push({
              categoryId: '',
              categoryName: '未分类',
              materials: ungroupedMaterials
            })
          }
        } else {
          const catName = this.data.selectedCategoryName || this.data.categories.find(c => c._id === selectedCategory)?.name || '全部素材'
          grouped = [{
            categoryId: '',
            categoryName: catName,
            materials: processedMaterials
          }]
        }
      }
      // 默认状态（未选中任何分类）：按所有二级分类分组，按 order 排序
      else {
        if (subCategories.length > 0) {
          // 按 order 排序后分组
          const sortedSubCategories = [...subCategories].sort((a, b) => (a.order || 0) - (b.order || 0))
          grouped = sortedSubCategories.map(category => ({
            categoryId: category._id,
            categoryName: category.name,
            materials: processedMaterials.filter(m => getCategoryId(m) === category._id)
          })).filter(group => group.materials.length > 0)

          // 添加未分类的素材
          const ungroupedMaterials = processedMaterials.filter(m => !getCategoryId(m))
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
      }

      console.log('分组后的数据:', grouped)

      // 更新数据
      let updateData = {
        groupedMaterials: grouped,
        hasMore: hasMore,
        currentPage: isLoadMore ? currentPage + 1 : 0,
        loading: false,
        loadingMore: false
      }

      if (isLoadMore) {
        // 加载更多：合并数据
        updateData.materials = [...this.data.materials, ...processedMaterials]
      } else {
        // 首次加载
        updateData.materials = processedMaterials
      }

      this.setData(updateData)

      console.log('分页信息:', {
        currentPage: this.data.currentPage,
        hasMore: this.data.hasMore,
        totalMaterials: this.data.materials.length
      })
    } catch (err) {
      console.error('loadMaterials error:', err)
      this.setData({
        materials: [],
        groupedMaterials: [],
        hasMore: false,
        loading: false,
        loadingMore: false
      })
    }
  },

  async selectCategory(e) {
    // 支持 picker 和点击两种方式
    const id = e.detail?.value || e.currentTarget?.dataset?.id
    // 如果是从 picker 选择，需要从 categories 中查找名称
    let name = e.currentTarget?.dataset?.name
    if (!name && id && this.data.categories) {
      const cat = this.data.categories.find(c => c._id === id)
      if (cat) name = cat.name
    }

    // 先重置二级分类和子分类选择
    this.setData({
      selectedCategory: id || '',
      selectedSubCategory: '',
      selectedSubCategoryName: '',
      selectedCategoryName: name || '',
      sideScrollTop: 0,
      materialScrollTop: 0,
      subCategories: [] // 先清空，避免显示旧数据
    })

    if (id) {
      // 加载该一级分类下的二级分类，等待加载完成
      const subCategories = await this.loadSubCategories(id)
      // 使用回调确保 subCategories 更新后再加载素材
      this.setData({ subCategories: subCategories }, () => {
        this.loadMaterials()
      })
    } else {
      // 全部状态：加载所有一级分类下的二级分类
      await this.loadAllSubCategories()
      this.loadMaterials()
    }
  },

  // 加载二级分类（使用云函数避免 _openid 限制）
  async loadSubCategories(parentId) {
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

      // 筛选出该父分类下的二级分类
      const subCategories = allCategories.filter(cat => cat.parent_id === parentId)
        .sort((a, b) => (a.order || 0) - (b.order || 0))

      // 返回新的 subCategories，供调用方使用
      this._currentSubCategories = subCategories
      return subCategories
    } catch (err) {
      console.error('loadSubCategories error:', err)
      this._currentSubCategories = []
      return []
    }
  },

  // 加载所有二级分类（用于全部状态），按一级分类的顺序排列
  async loadAllSubCategories() {
    try {
      const userId = wx.getStorageSync('userId')
      const { type } = this.data

      console.log('loadAllSubCategories, userId:', userId, 'type:', type)

      // 使用云函数查询（不受 _openid 限制）
      const res = await wx.cloud.callFunction({
        name: 'getAppCategories',
        data: {
          action: 'userMaterialCategories',
          userId: userId,
          userType: type
        }
      })

      const allCategories = res.result?.data || []
      console.log('分类查询结果:', allCategories.length, '条', allCategories)

      // 二级分类 = level=2 或有 parent_id
      const subCategories = allCategories.filter(cat => cat.level === 2 || cat.parent_id)

      console.log('二级分类:', subCategories)
      this._currentSubCategories = subCategories
      this.setData({ subCategories: subCategories })
      return subCategories
    } catch (err) {
      console.error('loadAllSubCategories error:', err)
      this.setData({ subCategories: [] })
      this._currentSubCategories = []
      return []
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
    }, () => {
      // 等 setData 完成后加载素材
      this.loadMaterials()
    })
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

  // 跳转批量抠图（文章页面）
  goToBatchCut() {
    const articleId = '391fc5be69dde943003b0c9e63433847'
    wx.navigateTo({
      url: `/pages/article-detail/article-detail?id=${articleId}`
    })
  },

  // 跳转上传页面
  goToUpload() {
    console.log('=== goToUpload ===')
    console.log('当前 this.data.type =', this.data.type)
    const url = `/pages/material-upload/material-upload?type=${this.data.type}`
    console.log('跳转 URL:', url)
    wx.navigateTo({ url })
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

    // 预览原图（大图）
    const previewUrl = item.url
    wx.previewImage({
      current: previewUrl,
      urls: [previewUrl]
    })
  },

  // 编辑素材名称
  editMaterialName(e) {
    const item = e.currentTarget?.dataset?.item || e
    // 优先取 name，其次取 title，最后取 displayName
    const currentName = item.name || item.title || item.displayName || ''
    this.setData({
      showEditMaterialModal: true,
      editingMaterial: item,
      editMaterialName: currentName
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

  // 保存素材名称（通过云函数更新）
  async saveMaterialName() {
    const { editingMaterial, editMaterialName } = this.data

    if (!editMaterialName.trim()) {
      wx.showToast({ title: '请输入素材名称', icon: 'none' })
      return
    }

    wx.showLoading({ title: '保存中...' })

    try {
      const res = await wx.cloud.callFunction({
        name: 'adminMaterial',
        data: {
          action: 'updateName',
          materialId: editingMaterial._id,
          data: { name: editMaterialName.trim() }
        }
      })

      wx.hideLoading()
      if (res.result && res.result.success) {
        wx.showToast({ title: '保存成功', icon: 'success' })
        this.hideEditMaterialModal()
        this.loadMaterials()
      } else {
        wx.showToast({ title: res.result?.error || '保存失败', icon: 'none' })
      }
    } catch (err) {
      console.error('saveMaterialName error:', err)
      wx.hideLoading()
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  // 删除素材（通过云函数删除）
  async deleteMaterial(e) {
    const { id } = e.currentTarget.dataset

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个素材吗？',
      success: async res => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })

          try {
            const result = await wx.cloud.callFunction({
              name: 'adminMaterial',
              data: {
                action: 'delete',
                materialId: id
              }
            })

            wx.hideLoading()
            if (result.result && result.result.success) {
              wx.showToast({ title: '删除成功', icon: 'success' })
              this.loadMaterials()
            } else {
              wx.showToast({ title: result.result?.error || '删除失败', icon: 'none' })
            }
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
    // 兼容 category_id 和 category2_id
    const currentCategoryId = item.category_id || item.category2_id || ''

    this.setData({
      showChangeCategoryModal: true,
      changingMaterial: item,
      pickerTopCategories: this.data.topCategories,
      pickerSubCategories: [],
      pickerSelectedTopCategory: '',
      pickerSelectedSubCategory: currentCategoryId,
      pickerSelectedTopCategoryName: '',
      pickerSelectedSubCategoryName: ''
    })

    // 如果素材有分类，查找其一级分类
    if (currentCategoryId) {
      await this.loadCategoriesForMaterial(currentCategoryId)
    }
  },

  // 根据素材的二级分类ID，加载对应的一级分类并选中
  async loadCategoriesForMaterial(subCategoryId) {
    if (!subCategoryId) return

    try {
      const db = wx.cloud.database()
      const userId = wx.getStorageSync('userId')

      // 查询该二级分类的信息（先查 user_material_categories，再查 material_categories）
      let catRes = await db.collection('user_material_categories').doc(subCategoryId).get()

      // 如果没找到，再查 material_categories（小程序的分类）
      if (!catRes.data || !catRes.data.parent_id) {
        catRes = await db.collection('material_categories').doc(subCategoryId).get()
      }

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

  // 加载二级分类（用于修改分类弹框，使用云函数避免 _openid 限制）
  async loadSubCategoriesForPicker(parentId) {
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

      // 筛选出该父分类下的二级分类
      const pickerSubCategories = allCategories.filter(cat => cat.parent_id === parentId)
        .sort((a, b) => (a.order || 0) - (b.order || 0))

      this.setData({ pickerSubCategories: pickerSubCategories })
      return pickerSubCategories
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

    // 更新素材分类（与后台字段保持一致：category1_id, category2_id）
    await this.updateMaterialCategory(changingMaterial, pickerSelectedTopCategory, targetCategoryId)
    this.hideChangeCategoryModal()
  },

  // 更新素材分类（通过云函数更新）
  async updateMaterialCategory(item, category1Id, category2Id) {
    wx.showLoading({ title: '更新中...' })

    try {
      const res = await wx.cloud.callFunction({
        name: 'adminMaterial',
        data: {
          action: 'updateCategory',
          materialId: item._id,
          category1Id: category1Id,
          category2Id: category2Id
        }
      })

      wx.hideLoading()
      if (res.result && res.result.success) {
        wx.showToast({ title: '更新成功', icon: 'success' })
        this.loadMaterials()
      } else {
        wx.showToast({ title: res.result?.error || '更新失败', icon: 'none' })
      }
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
      const type = this.data.type

      if (categoryLevel === 'top') {
        // 添加一级分类：将其他一级分类的 sort_order + 1，新分类 sort_order = 0
        const batch = db.batch()
        // 先将其他一级分类的 sort_order + 1
        topCategories.forEach((cat, index) => {
          batch.update(db.collection('material_categories').doc(cat._id), {
            data: { sort_order: index + 1 }
          })
        })
        // 添加新分类，sort_order = 0，同时设置兼容字段
        batch.add(db.collection('material_categories'), {
          data: {
            name: newCategoryName.trim(),
            parent_id: null,
            owner_type: type,
            owner_id: userId,
            user_type: type,
            user_id: userId,
            sort_order: 0,
            create_time: db.serverDate()
          }
        })
        await batch.commit()
      } else {
        // 添加二级分类，同时设置兼容字段
        await db.collection('material_categories').add({
          data: {
            name: newCategoryName.trim(),
            parent_id: parentCategory,
            owner_type: type,
            owner_id: userId,
            user_type: type,
            user_id: userId,
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

            // 更新素材的 category2_id 为空（与后台字段保持一致）
            await db.collection('materials')
              .where({ category2_id: id })
              .update({
                data: { category2_id: '' }
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
