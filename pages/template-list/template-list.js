// pages/template-list/template-list.js
const app = getApp()

Page({
  data: {
    currentCategory: '', // 当前选中的分类
    categories: ['广告风格', '实景风格', '人物风格', '动漫风格'],
    templates: [],
    column0: [], // 第0列模板
    column1: [], // 第1列模板
    column2: [], // 第2列模板
    loading: false,
    page: 1,
    pageSize: 30,
    hasMore: true,
    categoryIdMap: {}, // 分类名到ID的映射
    subCategoryMap: {} // 一级分类ID到二级分类ID列表的映射
  },

  onLoad(options) {
    // 如果从首页传入名称,设置标题
    if (options.name) {
      const name = decodeURIComponent(options.name)
      wx.setNavigationBarTitle({
        title: name
      })
    }

    this.loadCategories()
    this.loadTemplates()
  },

  // 加载分类列表
  async loadCategories() {
    try {
      const db = wx.cloud.database()
      const res = await db.collection('template_categories')
        .where({
          parent_id: '' // 只查询一级分类
        })
        .orderBy('sort', 'asc')
        .get()

      console.log('一级分类查询结果:', res.data)

      if (res.data && res.data.length > 0) {
        const categories = res.data.map(c => c.name)
        const categoryIdMap = {}
        res.data.forEach(c => {
          categoryIdMap[c.name] = c._id
        })

        // 预加载所有二级分类
        const parentIds = res.data.map(c => c._id)
        console.log('查询二级分类，parent_ids:', parentIds)

        const subRes = await db.collection('template_categories')
          .where({
            parent_id: db.command.in(parentIds)
          })
          .get()

        console.log('二级分类查询结果:', subRes.data)

        const subCategoryMap = {}
        subRes.data.forEach(cat => {
          if (!subCategoryMap[cat.parent_id]) {
            subCategoryMap[cat.parent_id] = []
          }
          subCategoryMap[cat.parent_id].push(cat._id)
        })

        this.setData({
          categories,
          categoryIdMap,
          subCategoryMap
        })

        console.log('分类加载完成:', { categoryIdMap, subCategoryMap })
      }
    } catch (err) {
      console.error('loadCategories error:', err)
    }
  },

  // 选择分类
  selectCategory(e) {
    const category = e.currentTarget.dataset.name
    this.setData({
      currentCategory: category,
      templates: [],
      column0: [],
      column1: [],
      column2: [],
      page: 1,
      hasMore: true
    })
    this.loadTemplates()
  },

  // 加载模板列表
  async loadTemplates() {
    if (this.data.loading) return

    // 如果是第一页,显示loading
    if (this.data.page === 1) {
      this.setData({ loading: true })
    }

    const db = wx.cloud.database()

    try {
      // 构建查询条件（移除 is_active 条件，先查所有数据）
      let query = {}

      // 如果选择了分类,添加分类筛选
      if (this.data.currentCategory) {
        const categoryId = this.data.categoryIdMap[this.data.currentCategory]
        const subCategoryIds = this.data.subCategoryMap[categoryId] || []

        console.log('选择分类:', this.data.currentCategory, '一级分类ID:', categoryId, '二级分类ID列表:', subCategoryIds)

        if (subCategoryIds.length > 0) {
          // 查询该一级分类下所有二级分类的模板
          const res = await db.collection('templates')
            .where({
              category_id: db.command.in(subCategoryIds)
            })
            .orderBy('sort', 'asc')
            .orderBy('created_at', 'desc')
            .skip((this.data.page - 1) * this.data.pageSize)
            .limit(this.data.pageSize)
            .get()

          console.log('模板查询结果（带分类）:', res.data)

          // 为每个模板添加分类名称
          const templates = res.data.map(t => ({
            ...t,
            category_name: this.data.currentCategory
          }))

          // 分配到三列
          const column0 = []
          const column1 = []
          const column2 = []
          templates.forEach((t, index) => {
            if (index % 3 === 0) column0.push(t)
            else if (index % 3 === 1) column1.push(t)
            else column2.push(t)
          })

          this.setData({
            templates: this.data.page === 1 ? templates : [...this.data.templates, ...templates],
            column0: this.data.page === 1 ? column0 : [...this.data.column0, ...column0],
            column1: this.data.page === 1 ? column1 : [...this.data.column1, ...column1],
            column2: this.data.page === 1 ? column2 : [...this.data.column2, ...column2],
            hasMore: templates.length >= this.data.pageSize,
            loading: false
          })
        } else {
          // 如果没有找到二级分类,返回空列表
          this.setData({
            templates: [],
            hasMore: false,
            loading: false
          })
        }
      } else {
        // 全部分类,需要查询每个模板的分类名称
        const res = await db.collection('templates')
          .where(query)
          .orderBy('sort', 'asc')
          .orderBy('created_at', 'desc')
          .skip((this.data.page - 1) * this.data.pageSize)
          .limit(this.data.pageSize)
          .get()

        console.log('模板查询结果（全部）:', res.data)

        // 为每个模板添加分类名称
        const templates = await this.addCategoryNames(res.data)

        console.log('准备设置 templates 数据:', templates.length, '个')

        // 分配到三列
        const column0 = []
        const column1 = []
        const column2 = []
        templates.forEach((t, index) => {
          if (index % 3 === 0) column0.push(t)
          else if (index % 3 === 1) column1.push(t)
          else column2.push(t)
        })

        console.log('列数据分配完成:', { column0: column0.length, column1: column1.length, column2: column2.length })

        this.setData({
          templates: this.data.page === 1 ? templates : [...this.data.templates, ...templates],
          column0: this.data.page === 1 ? column0 : [...this.data.column0, ...column0],
          column1: this.data.page === 1 ? column1 : [...this.data.column1, ...column1],
          column2: this.data.page === 1 ? column2 : [...this.data.column2, ...column2],
          hasMore: templates.length >= this.data.pageSize,
          loading: false
        })

        console.log('setData 完成，当前 templates 长度:', this.data.templates.length)
      }
    } catch (err) {
      console.error('loadTemplates error:', err)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 为模板添加分类名称
  async addCategoryNames(templates) {
    if (!templates || templates.length === 0) return []

    // 获取所有分类ID
    const categoryIds = [...new Set(templates.map(t => t.category_id).filter(Boolean))]

    if (categoryIds.length === 0) {
      return templates.map(t => ({ ...t, category_name: '通用' }))
    }

    // 批量查询分类
    const db = wx.cloud.database()
    const categoryRes = await db.collection('template_categories')
      .where({
        _id: db.command.in(categoryIds)
      })
      .get()

    // 创建分类ID到名称的映射
    const categoryMap = {}
    categoryRes.data.forEach(cat => {
      categoryMap[cat._id] = cat.name
    })

    // 为每个模板添加分类名称
    return templates.map(t => ({
      ...t,
      category_name: categoryMap[t.category_id] || '通用'
    }))
  },

  // 获取指定列的模板
  getColumnTemplates(colIndex) {
    const colTemplates = this.data.templates.filter((_, index) => index % 3 === colIndex)
    console.log(`获取第${colIndex}列模板:`, colTemplates.length, '个')
    return colTemplates
  },

  // 加载更多
  loadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 })
      this.loadTemplates()
    }
  },

  // 触底加载
  onReachBottom() {
    this.loadMore()
  },

  // 选择模板,跳转到产品选择页
  selectTemplate(e) {
    const { id, name, cover, description } = e.currentTarget.dataset

    // 传递模板信息到下一个页面
    wx.navigateTo({
      url: `/pages/product-select/product-select?templateId=${id}&templateName=${encodeURIComponent(name)}&templateCover=${encodeURIComponent(cover || '')}&templateDesc=${encodeURIComponent(description || '')}`
    })
  }
})
