const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { id, balance, nickName, phone } = event

  console.log('=== 更新用户 ===')
  console.log('params:', { id, balance, nickName, phone })

  if (!id) {
    return {
      success: false,
      error: '缺少用户ID'
    }
  }

  try {
    const updateData = {
      update_time: db.serverDate()
    }

    if (balance !== undefined) {
      updateData.balance = balance
    }
    if (nickName !== undefined) {
      updateData.nickName = nickName
    }
    if (phone !== undefined) {
      updateData.phone = phone
    }

    await db.collection('users').doc(id).update({
      data: updateData
    })

    console.log('用户更新成功:', id)

    return {
      success: true
    }

  } catch (err) {
    console.error('更新用户失败:', err)
    return {
      success: false,
      error: '更新失败'
    }
  }
}
