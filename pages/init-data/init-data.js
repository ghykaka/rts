// pages/init-data/init-data.js
const app = getApp()

Page({
  data: {
    loading: false,
    result: null
  },

  async initData() {
    if (this.data.loading) return
    this.setData({ loading: true, result: null })

    try {
      const db = wx.cloud.database()
      let categoriesCount = 0
      let subCategoriesCount = 0
      let templatesCount = 0
      let fieldsCount = 0
      let pricingCount = 0
      let productsCount = 0

      // 1. 创建模板分类（一级分类）
      const categories = [
        { name: '广告风格', parent_id: '', sort: 1, created_at: new Date() },
        { name: '实景风格', parent_id: '', sort: 2, created_at: new Date() },
        { name: '人物风格', parent_id: '', sort: 3, created_at: new Date() },
        { name: '动漫风格', parent_id: '', sort: 4, created_at: new Date() }
      ]

      const categoryIds = {}
      for (const cat of categories) {
        const res = await db.collection('template_categories').add({ data: cat })
        categoryIds[cat.name] = res._id
        categoriesCount++
      }

      console.log('一级分类创建完成:', categoryIds)

      // 创建二级分类
      const subCategories = [
        { name: '大牌广告', parent_id: categoryIds['广告风格'], sort: 1, created_at: new Date() },
        { name: '港风招贴', parent_id: categoryIds['广告风格'], sort: 2, created_at: new Date() },
        { name: '野广告风格', parent_id: categoryIds['广告风格'], sort: 3, created_at: new Date() },
        { name: '白天场景', parent_id: categoryIds['实景风格'], sort: 1, created_at: new Date() },
        { name: '夜晚场景', parent_id: categoryIds['实景风格'], sort: 2, created_at: new Date() },
        { name: '静物写真', parent_id: categoryIds['实景风格'], sort: 3, created_at: new Date() },
        { name: '日本漫画', parent_id: categoryIds['动漫风格'], sort: 1, created_at: new Date() },
        { name: '3D风格', parent_id: categoryIds['动漫风格'], sort: 2, created_at: new Date() },
        { name: '欧美风格', parent_id: categoryIds['动漫风格'], sort: 3, created_at: new Date() },
        { name: '国风', parent_id: categoryIds['动漫风格'], sort: 4, created_at: new Date() }
      ]

      console.log('准备创建二级分类，父分类ID:', categoryIds)
      console.log('二级分类数据:', subCategories)

      const subCategoryIds = {}
      for (const cat of subCategories) {
        console.log('创建二级分类:', cat.name, 'parent_id:', cat.parent_id)
        const res = await db.collection('template_categories').add({ data: cat })
        subCategoryIds[cat.name] = res._id
        subCategoriesCount++
      }

      console.log('二级分类创建完成:', subCategoryIds)

      // 2. 创建行业标签
      const industries = ['美妆', '服装', '餐饮', '教育', '母婴', '数码']
      for (const name of industries) {
        await db.collection('industries').add({
          data: { name, created_at: new Date() }
        })
      }

      // 3. 创建模板
      const templates = [
        { name: '大牌广告模板1', category_id: subCategoryIds['大牌广告'], industry: '美妆,服装', cover_url: 'https://picsum.photos/400/600?random=1', output_type: 'image', is_active: true, sort: 1, created_at: new Date() },
        { name: '大牌广告模板2', category_id: subCategoryIds['大牌广告'], industry: '数码', cover_url: 'https://picsum.photos/400/600?random=2', output_type: 'image', is_active: true, sort: 2, created_at: new Date() },
        { name: '港风招贴模板1', category_id: subCategoryIds['港风招贴'], industry: '服装,餐饮', cover_url: 'https://picsum.photos/400/600?random=3', output_type: 'image', is_active: true, sort: 1, created_at: new Date() },
        { name: '港风招贴模板2', category_id: subCategoryIds['港风招贴'], industry: '美妆', cover_url: 'https://picsum.photos/400/600?random=4', output_type: 'image', is_active: true, sort: 2, created_at: new Date() },
        { name: '野广告风格模板', category_id: subCategoryIds['野广告风格'], industry: '通用', cover_url: 'https://picsum.photos/400/600?random=5', output_type: 'image', is_active: true, sort: 1, created_at: new Date() },
        { name: '白天场景模板1', category_id: subCategoryIds['白天场景'], industry: '餐饮,母婴', cover_url: 'https://picsum.photos/400/600?random=6', output_type: 'image', is_active: true, sort: 1, created_at: new Date() },
        { name: '白天场景模板2', category_id: subCategoryIds['白天场景'], industry: '教育', cover_url: 'https://picsum.photos/400/600?random=7', output_type: 'image', is_active: true, sort: 2, created_at: new Date() },
        { name: '夜晚场景模板', category_id: subCategoryIds['夜晚场景'], industry: '餐饮,服装', cover_url: 'https://picsum.photos/400/600?random=8', output_type: 'image', is_active: true, sort: 1, created_at: new Date() },
        { name: '静物写真模板', category_id: subCategoryIds['静物写真'], industry: '数码,美妆', cover_url: 'https://picsum.photos/400/600?random=9', output_type: 'image', is_active: true, sort: 1, created_at: new Date() },
        { name: '日本漫画模板', category_id: subCategoryIds['日本漫画'], industry: '服装,母婴', cover_url: 'https://picsum.photos/400/600?random=10', output_type: 'image', is_active: true, sort: 1, created_at: new Date() },
        { name: '3D风格模板', category_id: subCategoryIds['3D风格'], industry: '数码', cover_url: 'https://picsum.photos/400/600?random=11', output_type: 'image', is_active: true, sort: 1, created_at: new Date() },
        { name: '欧美风格模板', category_id: subCategoryIds['欧美风格'], industry: '服装,美妆', cover_url: 'https://picsum.photos/400/600?random=12', output_type: 'image', is_active: true, sort: 1, created_at: new Date() },
        { name: '国风模板', category_id: subCategoryIds['国风'], industry: '餐饮,教育', cover_url: 'https://picsum.photos/400/600?random=13', output_type: 'image', is_active: true, sort: 1, created_at: new Date() }
      ]

      console.log('开始创建模板，二级分类ID:', subCategoryIds)

      const templateIds = []
      for (const tpl of templates) {
        console.log('创建模板:', tpl.name, '分类ID:', tpl.category_id)
        const res = await db.collection('templates').add({ data: tpl })
        templateIds.push(res._id)
        templatesCount++
      }

      console.log('模板创建完成，共', templatesCount, '个')

      // 4. 创建产品分类（使用现有material_categories表结构）
      const productCategories = [
        { name: '美妆', parent_id: '', sort: 1, is_active: true, created_at: new Date() },
        { name: '服装', parent_id: '', sort: 2, is_active: true, created_at: new Date() },
        { name: '数码', parent_id: '', sort: 3, is_active: true, created_at: new Date() }
      ]

      const productCategoryIds = {}
      for (const cat of productCategories) {
        try {
          const res = await db.collection('categories').add({ data: cat })
          productCategoryIds[cat.name] = res._id
        } catch (e) {
          console.log('创建分类失败，可能集合不存在:', e.message)
          // 如果集合不存在，跳过产品数据创建
          throw new Error('请先创建categories集合')
        }
      }

      // 创建产品二级分类
      const productSubCategories = [
        { name: '口红', parent_id: productCategoryIds['美妆'], sort: 1, is_active: true, created_at: new Date() },
        { name: '粉底', parent_id: productCategoryIds['美妆'], sort: 2, is_active: true, created_at: new Date() },
        { name: '眼影', parent_id: productCategoryIds['美妆'], sort: 3, is_active: true, created_at: new Date() },
        { name: '面膜', parent_id: productCategoryIds['美妆'], sort: 4, is_active: true, created_at: new Date() },
        { name: '连衣裙', parent_id: productCategoryIds['服装'], sort: 1, is_active: true, created_at: new Date() },
        { name: 'T恤', parent_id: productCategoryIds['服装'], sort: 2, is_active: true, created_at: new Date() },
        { name: '牛仔裤', parent_id: productCategoryIds['服装'], sort: 3, is_active: true, created_at: new Date() },
        { name: '手机', parent_id: productCategoryIds['数码'], sort: 1, is_active: true, created_at: new Date() },
        { name: '耳机', parent_id: productCategoryIds['数码'], sort: 2, is_active: true, created_at: new Date() }
      ]

      const productSubCategoryIds = {}
      for (const cat of productSubCategories) {
        const res = await db.collection('categories').add({ data: cat })
        productSubCategoryIds[cat.name] = res._id
      }

      // 5. 创建产品
      const products = [
        { name: '迪奥口红999', image_url: 'https://picsum.photos/400/400?random=20', category_id: productSubCategoryIds['口红'], description: '经典正红色', sort: 1, is_active: true, created_at: new Date() },
        { name: '香奈儿口红', image_url: 'https://picsum.photos/400/400?random=21', category_id: productSubCategoryIds['口红'], description: '优雅气质', sort: 2, is_active: true, created_at: new Date() },
        { name: '阿玛尼粉底液', image_url: 'https://picsum.photos/400/400?random=22', category_id: productSubCategoryIds['粉底'], description: '轻薄服帖', sort: 1, is_active: true, created_at: new Date() },
        { name: '雅诗兰黛粉底', image_url: 'https://picsum.photos/400/400?random=23', category_id: productSubCategoryIds['粉底'], description: '持久遮瑕', sort: 2, is_active: true, created_at: new Date() },
        { name: 'NARS眼影盘', image_url: 'https://picsum.photos/400/400?random=24', category_id: productSubCategoryIds['眼影'], description: '日常百搭', sort: 1, is_active: true, created_at: new Date() },
        { name: '纪梵希眼影', image_url: 'https://picsum.photos/400/400?random=25', category_id: productSubCategoryIds['眼影'], description: '高级质感', sort: 2, is_active: true, created_at: new Date() },
        { name: 'SK-II面膜', image_url: 'https://picsum.photos/400/400?random=26', category_id: productSubCategoryIds['面膜'], description: '深层补水', sort: 1, is_active: true, created_at: new Date() },
        { name: '海蓝之谜面膜', image_url: 'https://picsum.photos/400/400?random=27', category_id: productSubCategoryIds['面膜'], description: '奢华修复', sort: 2, is_active: true, created_at: new Date() },
        { name: '真丝连衣裙', image_url: 'https://picsum.photos/400/400?random=28', category_id: productSubCategoryIds['连衣裙'], description: '优雅知性', sort: 1, is_active: true, created_at: new Date() },
        { name: '雪纺连衣裙', image_url: 'https://picsum.photos/400/400?random=29', category_id: productSubCategoryIds['连衣裙'], description: '清新自然', sort: 2, is_active: true, created_at: new Date() },
        { name: '纯棉T恤', image_url: 'https://picsum.photos/400/400?random=30', category_id: productSubCategoryIds['T恤'], description: '舒适透气', sort: 1, is_active: true, created_at: new Date() },
        { name: '条纹T恤', image_url: 'https://picsum.photos/400/400?random=31', category_id: productSubCategoryIds['T恤'], description: '经典百搭', sort: 2, is_active: true, created_at: new Date() }
      ]

      for (const product of products) {
        await db.collection('products').add({ data: product })
        productsCount++
      }

      this.setData({
        result: {
          success: true,
          message: '初始化数据创建成功！',
          categories: categoriesCount,
          subCategories: subCategoriesCount,
          templates: templatesCount,
          products: productsCount
        }
      })

      wx.showToast({ title: '数据初始化成功', icon: 'success' })

    } catch (err) {
      console.error('initData error:', err)
      this.setData({
        result: {
          success: false,
          message: '初始化失败：' + err.message
        }
      })
      wx.showToast({ title: '初始化失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  goBack() {
    wx.navigateBack()
  }
})
