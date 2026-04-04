// 临时脚本：更新企业账号余额
// 在控制台运行此脚本或添加到任意页面的 onLoad 中执行
const updateEnterpriseBalance = async () => {
  try {
    const db = wx.cloud.database()
    const userInfo = wx.getStorageSync('userInfo')

    if (!userInfo || !userInfo._id) {
      console.log('未找到用户信息')
      return
    }

    // 更新余额为 5000 分（50 元）
    const result = await db.collection('users').doc(userInfo._id).update({
      data: {
        balance: 5000,
        update_time: db.serverDate()
      }
    })

    console.log('更新成功:', result)

    // 更新本地存储
    wx.setStorageSync('userInfo', {
      ...userInfo,
      balance: 5000
    })

    console.log('本地存储已更新，余额: 50.00 元')
    wx.showToast({ title: '余额已更新为50元', icon: 'success' })
  } catch (err) {
    console.error('更新失败:', err)
    wx.showToast({ title: '更新失败', icon: 'none' })
  }
}

// 执行更新
updateEnterpriseBalance()
