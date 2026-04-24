const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { page = 1, pageSize = 20, userId, phone, userType, enterpriseName } = event

  console.log('=== 获取用户列表 ===')
  console.log('params:', { page, pageSize, userId, phone, userType, enterpriseName })

  try {
    // 企业用户查询：名称模糊匹配 company_name 和 company_short_name
    if (userType === 'enterprise') {
      let baseQuery = db.collection('enterprises')
      
      // 构建 OR 条件：企业名称模糊匹配（全称或简称）
      const nameOrCond = db.command.or(
        {
          company_name: enterpriseName 
            ? db.RegExp({ regexp: enterpriseName, options: 'i' }) 
            : db.RegExp({ regexp: '.*', options: 's' })
        },
        {
          company_short_name: enterpriseName 
            ? db.RegExp({ regexp: enterpriseName, options: 'i' }) 
            : db.RegExp({ regexp: '.*', options: 's' })
        }
      )
      
      // 如果有 userId，需要将条件合并到每个 or 分支中
      let whereCondition
      if (userId) {
        whereCondition = db.command.or(
          {
            company_name: enterpriseName 
              ? db.RegExp({ regexp: enterpriseName, options: 'i' }) 
              : db.RegExp({ regexp: '.*', options: 's' }),
            admin_user_id: userId
          },
          {
            company_short_name: enterpriseName 
              ? db.RegExp({ regexp: enterpriseName, options: 'i' }) 
              : db.RegExp({ regexp: '.*', options: 's' }),
            admin_user_id: userId
          }
        )
      } else {
        whereCondition = nameOrCond
      }
      
      baseQuery = baseQuery.where(whereCondition)

      // 获取企业列表
      const entCountResult = await baseQuery.count()

      const entListResult = await baseQuery
        .orderBy('create_time', 'desc')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .get()

      let userList = entListResult.data || []

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

    // 普通用户查询 - 必须是 user_type = 'personal'
    const where = {
      user_type: 'personal'
    }

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
    let userList = listResult.data || []
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
