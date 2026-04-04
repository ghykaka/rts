// pages/enterprise/enterprise.js
const app = getApp()

Page({
  data: {
    tabs: ['产品素材', '模板素材'],
    currentTab: 0,
    materials: [],
    loading: false
  },

  onLoad() {
    this.loadMaterials()
  },

  switchTab(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ currentTab: index })
    this.loadMaterials()
  },

  async loadMaterials() {
    this.setData({ loading: true })
    try {
      const res = await wx.cloud.callFunction({
        name: 'getMaterials',
        data: {
          ownerType: 'enterprise',
          ownerId: app.globalData.userId,
          type: this.data.currentTab === 0 ? 'image' : 'template'
        }
      })
      
      if (res.result.success) {
        this.setData({ materials: res.result.data })
      }
    } catch (err) {
      console.error('loadMaterials error:', err)
    } finally {
      this.setData({ loading: false })
    }
  },

  async uploadMaterial() {
    wx.chooseMedia({
      count: 9,
      mediaType: ['image'],
      success: async res => {
        wx.showLoading({ title: '上传中...' })
        
        for (const file of res.tempFiles) {
          const cloudPath = `enterprise/${Date.now()}-${Math.random()}.${file.filePath.split('.').pop()}`
          await wx.cloud.uploadFile({
            cloudPath,
            filePath: file.filePath
          })
        }
        
        wx.hideLoading()
        wx.showToast({ title: '上传成功', icon: 'success' })
        this.loadMaterials()
      }
    })
  }
})
