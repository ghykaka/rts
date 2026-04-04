// cloudfunctions/initData/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  // 只允许在测试环境调用（可通过配置限制）
  try {
    // 0. 确保集合存在 - 使用空添加来创建集合
    const collections = ['template_categories', 'industries', 'templates', 'template_fields', 'template_pricing', 'materials', 'material_categories']
    for (const coll of collections) {
      try {
        await db.collection(coll).count()
      } catch (e) {
        // 集合不存在，尝试创建
        await db.createCollection(coll)
      }
    }

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
    }

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
    
    const subCategoryIds = {}
    for (const cat of subCategories) {
      const res = await db.collection('template_categories').add({ data: cat })
      subCategoryIds[cat.name] = res._id
    }
    
    // 2. 创建行业标签
    const industries = ['美妆', '服装', '餐饮', '教育', '母婴', '数码']
    for (const name of industries) {
      await db.collection('industries').add({
        data: { name, created_at: new Date() }
      })
    }
    
    // 3. 创建模板（使用二级分类）
    const templates = [
      {
        name: '大牌广告模板1',
        category_id: subCategoryIds['大牌广告'],
        industry: '美妆,服装',
        coze_workflow_id: 'workflow_001',
        prompt: '生成一张大牌广告风格海报',
        description: '高端大牌广告风格',
        cover_url: 'https://via.placeholder.com/400x600/FF6B6B/FFFFFF?text=大牌广告1',
        preview_urls: [],
        output_type: 'image',
        aspect_ratio: '3:4',
        is_active: true,
        sort: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '大牌广告模板2',
        category_id: subCategoryIds['大牌广告'],
        industry: '数码',
        coze_workflow_id: 'workflow_001',
        prompt: '生成一张大牌广告风格海报',
        description: '高端大牌广告风格',
        cover_url: 'https://via.placeholder.com/400x600/4ECDC4/FFFFFF?text=大牌广告2',
        preview_urls: [],
        output_type: 'image',
        aspect_ratio: '3:4',
        is_active: true,
        sort: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '港风招贴模板1',
        category_id: subCategoryIds['港风招贴'],
        industry: '服装,餐饮',
        coze_workflow_id: 'workflow_002',
        prompt: '生成一张港风招贴海报',
        description: '复古港风招贴风格',
        cover_url: 'https://via.placeholder.com/400x600/FFE66D/333333?text=港风招贴1',
        preview_urls: [],
        output_type: 'image',
        aspect_ratio: '3:4',
        is_active: true,
        sort: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '港风招贴模板2',
        category_id: subCategoryIds['港风招贴'],
        industry: '美妆',
        coze_workflow_id: 'workflow_002',
        prompt: '生成一张港风招贴海报',
        description: '复古港风招贴风格',
        cover_url: 'https://via.placeholder.com/400x600/FF9F43/FFFFFF?text=港风招贴2',
        preview_urls: [],
        output_type: 'image',
        aspect_ratio: '3:4',
        is_active: true,
        sort: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '野广告风格模板',
        category_id: subCategoryIds['野广告风格'],
        industry: '通用',
        coze_workflow_id: 'workflow_003',
        prompt: '生成一张野广告风格海报',
        description: '街头野广告风格',
        cover_url: 'https://via.placeholder.com/400x600/EE5A24/FFFFFF?text=野广告',
        preview_urls: [],
        output_type: 'image',
        aspect_ratio: '3:4',
        is_active: true,
        sort: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '白天场景模板1',
        category_id: subCategoryIds['白天场景'],
        industry: '餐饮,母婴',
        coze_workflow_id: 'workflow_004',
        prompt: '生成一张白天场景海报',
        description: '明亮白天实景风格',
        cover_url: 'https://via.placeholder.com/400x600/26C6DA/FFFFFF?text=白天场景1',
        preview_urls: [],
        output_type: 'image',
        aspect_ratio: '3:4',
        is_active: true,
        sort: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '白天场景模板2',
        category_id: subCategoryIds['白天场景'],
        industry: '教育',
        coze_workflow_id: 'workflow_004',
        prompt: '生成一张白天场景海报',
        description: '明亮白天实景风格',
        cover_url: 'https://via.placeholder.com/400x600/42A5F5/FFFFFF?text=白天场景2',
        preview_urls: [],
        output_type: 'image',
        aspect_ratio: '3:4',
        is_active: true,
        sort: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '夜晚场景模板',
        category_id: subCategoryIds['夜晚场景'],
        industry: '餐饮,服装',
        coze_workflow_id: 'workflow_005',
        prompt: '生成一张夜晚场景海报',
        description: '夜晚氛围实景风格',
        cover_url: 'https://via.placeholder.com/400x600/7C4DFF/FFFFFF?text=夜晚场景',
        preview_urls: [],
        output_type: 'image',
        aspect_ratio: '3:4',
        is_active: true,
        sort: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '静物写真模板',
        category_id: subCategoryIds['静物写真'],
        industry: '数码,美妆',
        coze_workflow_id: 'workflow_006',
        prompt: '生成一张静物写真海报',
        description: '精致静物写实风格',
        cover_url: 'https://via.placeholder.com/400x600/AB47BC/FFFFFF?text=静物写真',
        preview_urls: [],
        output_type: 'image',
        aspect_ratio: '3:4',
        is_active: true,
        sort: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '日本漫画模板',
        category_id: subCategoryIds['日本漫画'],
        industry: '服装,母婴',
        coze_workflow_id: 'workflow_007',
        prompt: '生成一张日本漫画海报',
        description: '日式漫画风格',
        cover_url: 'https://via.placeholder.com/400x600/EC407A/FFFFFF?text=日本漫画',
        preview_urls: [],
        output_type: 'image',
        aspect_ratio: '3:4',
        is_active: true,
        sort: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '3D风格模板',
        category_id: subCategoryIds['3D风格'],
        industry: '数码',
        coze_workflow_id: 'workflow_008',
        prompt: '生成一张3D风格海报',
        description: '立体3D渲染风格',
        cover_url: 'https://via.placeholder.com/400x600/5C6BC0/FFFFFF?text=3D风格',
        preview_urls: [],
        output_type: 'image',
        aspect_ratio: '3:4',
        is_active: true,
        sort: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '欧美风格模板',
        category_id: subCategoryIds['欧美风格'],
        industry: '服装,美妆',
        coze_workflow_id: 'workflow_009',
        prompt: '生成一张欧美风格海报',
        description: '欧美流行风格',
        cover_url: 'https://via.placeholder.com/400x600/EF5350/FFFFFF?text=欧美风格',
        preview_urls: [],
        output_type: 'image',
        aspect_ratio: '3:4',
        is_active: true,
        sort: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '国风模板',
        category_id: subCategoryIds['国风'],
        industry: '餐饮,教育',
        coze_workflow_id: 'workflow_010',
        prompt: '生成一张国风海报',
        description: '中国传统文化风格',
        cover_url: 'https://via.placeholder.com/400x600/8D6E63/FFFFFF?text=国风',
        preview_urls: [],
        output_type: 'image',
        aspect_ratio: '3:4',
        is_active: true,
        sort: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]
    
    const templateIds = []
    for (const tpl of templates) {
      const res = await db.collection('templates').add({ data: tpl })
      templateIds.push(res._id)
    }
    
    // 4. 创建模板动态字段配置
    const fields = [
      // 产品海报字段
      {
        template_id: templateIds[0],
        field_name: 'product_name',
        field_label: '产品名称',
        field_type: 'text',
        required: true,
        sort: 1
      },
      {
        template_id: templateIds[0],
        field_name: 'product_desc',
        field_label: '产品描述',
        field_type: 'textarea',
        required: false,
        sort: 2
      },
      {
        template_id: templateIds[0],
        field_name: 'style',
        field_label: '风格',
        field_type: 'select',
        options: '现代简约,复古怀旧,高端大气,可爱清新',
        required: true,
        sort: 3
      },
      // 营销视频字段
      {
        template_id: templateIds[1],
        field_name: 'video_content',
        field_label: '视频内容描述',
        field_type: 'textarea',
        required: true,
        sort: 1
      }
    ]
    
    for (const f of fields) {
      await db.collection('template_fields').add({ data: f })
    }
    
    // 6. 创建产品素材（materials）
    const products = []
    const productNames = [
      '口红', '粉底液', '眼影盘', '面膜', '香水', '防晒霜',
      '连衣裙', 'T恤', '牛仔裤', '外套', '鞋子', '包包',
      '奶茶', '咖啡', '蛋糕', '汉堡', '寿司', '火锅',
      '书籍', '文具', '玩具', '学习机', '课程', '教具',
      '婴儿车', '纸尿裤', '奶粉', '玩具车', '绘本', '儿童服装',
      '手机', '电脑', '平板', '耳机', '音箱', '相机'
    ]

    const industryMapping = {
      '口红': '美妆', '粉底液': '美妆', '眼影盘': '美妆', '面膜': '美妆', '香水': '美妆', '防晒霜': '美妆',
      '连衣裙': '服装', 'T恤': '服装', '牛仔裤': '服装', '外套': '服装', '鞋子': '服装', '包包': '服装',
      '奶茶': '餐饮', '咖啡': '餐饮', '蛋糕': '餐饮', '汉堡': '餐饮', '寿司': '餐饮', '火锅': '餐饮',
      '书籍': '教育', '文具': '教育', '玩具': '母婴', '学习机': '教育', '课程': '教育', '教具': '教育',
      '婴儿车': '母婴', '纸尿裤': '母婴', '奶粉': '母婴', '玩具车': '母婴', '绘本': '母婴', '儿童服装': '母婴',
      '手机': '数码', '电脑': '数码', '平板': '数码', '耳机': '数码', '音箱': '数码', '相机': '数码'
    }

    for (let i = 0; i < productNames.length; i++) {
      const colors = ['FF6B6B', '4ECDC4', 'FFE66D', 'FF9F43', 'EE5A24', '26C6DA', '42A5F5', '7C4DFF', 'AB47BC', 'EC407A', '5C6BC0', 'EF5350']
      const color = colors[Math.floor(Math.random() * colors.length)]

      const product = {
        name: productNames[i],
        url: `https://via.placeholder.com/400x400/${color}/FFFFFF?text=${encodeURIComponent(productNames[i])}`,
        type: 'image',
        category_id: '',
        tags: [productNames[i]],
        industry: industryMapping[productNames[i]] || '通用',
        owner_id: 'test_user',
        owner_type: 'personal',
        created_at: new Date()
      }
      products.push(product)
    }

    for (const p of products) {
      await db.collection('materials').add({ data: p })
    }

    // 5. 创建模板定价
    const pricing = [
      // 海报定价
      {
        template_id: templateIds[0],
        output_type: 'image',
        aspect_ratio: '1:1',
        duration: null,
        resolution: null,
        balance_price: 50, // 0.5元
        one_time_price: 100,
        is_active: true,
        created_at: new Date()
      },
      {
        template_id: templateIds[0],
        output_type: 'image',
        aspect_ratio: '16:9',
        duration: null,
        resolution: null,
        balance_price: 60,
        one_time_price: 120,
        is_active: true,
        created_at: new Date()
      },
      // 视频定价
      {
        template_id: templateIds[1],
        output_type: 'video',
        aspect_ratio: null,
        duration: 15,
        resolution: '720p',
        balance_price: 200,
        one_time_price: 400,
        is_active: true,
        created_at: new Date()
      },
      {
        template_id: templateIds[1],
        output_type: 'video',
        aspect_ratio: null,
        duration: 30,
        resolution: '1080p',
        balance_price: 400,
        one_time_price: 800,
        is_active: true,
        created_at: new Date()
      }
    ]
    
    for (const p of pricing) {
      await db.collection('template_pricing').add({ data: p })
    }
    
    return {
      success: true,
      message: '初始化数据创建成功',
      data: {
        categories: categories.length + subCategories.length,
        subCategories: subCategories.length,
        templates: templates.length,
        fields: fields.length,
        pricing: pricing.length,
        products: products.length
      }
    }
    
  } catch (err) {
    console.error('initData error:', err)
    return { success: false, error: err.message }
  }
}
