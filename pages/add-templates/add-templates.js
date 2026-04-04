// pages/add-templates/add-templates.js
Page({
  data: {
    loading: false
  },

  async addTemplates() {
    if (this.data.loading) return
    this.setData({ loading: true })

    const db = wx.cloud.database()
    
    try {
      // 获取分类ID
      const catRes = await db.collection('template_categories').where({
        name: '海报图片'
      }).get()
      
      if (!catRes.data || catRes.data.length === 0) {
        wx.showToast({ title: '请先运行初始化数据', icon: 'none' })
        this.setData({ loading: false })
        return
      }
      
      const categoryId = catRes.data[0]._id
      
      // 添加模板
      await db.collection('templates').add({
        data: {
          name: '产品海报生成',
          category_id: categoryId,
          industry: '通用',
          coze_workflow_id: 'workflow_001',
          prompt: '生成一张精美的产品海报',
          description: '输入产品信息，自动生成精美海报',
          output_type: 'image',
          is_active: true,
          sort: 1,
          created_at: new Date()
        }
      })
      
      await db.collection('templates').add({
        data: {
          name: '营销视频生成',
          category_id: categoryId,
          industry: '通用',
          coze_workflow_id: 'workflow_002',
          prompt: '生成营销视频',
          description: '输入营销内容，自动生成视频',
          output_type: 'video',
          is_active: true,
          sort: 2,
          created_at: new Date()
        }
      })
      
      wx.showToast({ title: '模板添加成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
      
    } catch (err) {
      console.error('addTemplates error:', err)
      wx.showToast({ title: '添加失败: ' + err.message, icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  }
})
