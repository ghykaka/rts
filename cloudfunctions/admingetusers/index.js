const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { page = 1, pageSize = 20, userId, phone, userType, enterpriseName } = event

  console.log('=== 获取用户列表 ===')
  console.log('params:', { page, pageSize, userId, phone, userType, enterpriseName })

  try {
    // 企业用户查询
    if (userType === 'enterprise') {
      const entWhere = {}
      if (userId) {
        entWhere.admin_user_id = userId
      }
      if (phone) {
        entWhere.admin_phone = db.RegExp({
          regexp: phone,
          options: 'i'
        })
      }
      if (enterpriseName) {
        entWhere.company_name = db.RegExp({
          regexp: enterpriseName,
          options: 'i'
        })
      }

      // 获取企业列表
      const entCountResult = await db.collection('enterprises')
        .where(entWhere)
        .count()

      const entListResult = await db.collection('enterprises')
        .where(entWhere)
        .orderBy('create_time', 'desc')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .get()

      const userList = entListResult.data || []

      // 获取每个企业的素材统计和子账号信息
      for (const ent of userList) {
        // 统计该企业的素材数量
        const countRes = await db.collection('materials')
          .where({ enterprise_id: ent._id })
          .count()
        ent.materialCount = countRes.total

        // 计算总大小
        const sizeRes = await db.collection('materials')
          .where({ enterprise_id: ent._id })
          .field({ size: true })
          .get()
        ent.materialSize = sizeRes.data.reduce((sum, m) => sum + (m.size || 0), 0)

        // 管理员信息
        ent.phone = ent.admin_phone || ''
        ent.nickName = ent.admin_nickname || ''

        // 子账号统计 - 从 users 表查询
        const subAccountRes = await db.collection('users')
          .where({ enterprise_id: ent._id })
          .field({ phone: true, remark: true, balance: true })
          .get()
        ent.subAccountCount = subAccountRes.data.length
        ent.subAccounts = subAccountRes.data.map(sa => ({
          phone: sa.phone || '',
          remark: sa.remark || '',
          balance: sa.balance || 0
        }))
      }

      console.log('企业查询结果:', {
        total: entCountResult.total,
        count: userList.length
      })

      return {
        success: true,
        data: userList,
        total: entCountResult.total
      }
    }

    // 普通用户查询
    const where = {}

    if (userId) {
      where._id = userId
    }
    if (phone) {
      where.phone = db.RegExp({
        regexp: phone,
        options: 'i'
      })
    }

    // 获取总数
    const countResult = await db.collection('users')
      .where(where)
      .count()

    // 获取列表
    const listResult = await db.collection('users')
      .where(where)
      .orderBy('created_at', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    // 获取素材统计信息
    const userList = listResult.data || []
    if (userList.length > 0) {
      for (const user of userList) {
        // 统计素材数量
        const countRes = await db.collection('materials')
          .where({ user_id: user._id })
          .count()
        user.materialCount = countRes.total

        // 计算总大小
        const sizeRes = await db.collection('materials')
          .where({ user_id: user._id })
          .field({ size: true })
          .get()
        user.materialSize = sizeRes.data.reduce((sum, m) => sum + (m.size || 0), 0)
      }
    }

    console.log('普通用户查询结果:', {
      total: countResult.total,
      count: userList.length
    })

    return {
      success: true,
      data: userList,
      total: countResult.total
    }

  } catch (err) {
    console.error('获取用户列表失败:', err)
    return {
      success: false,
      error: '获取数据失败: ' + err.message
    }
  }
}
