const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { action, data } = event
  const openid = cloud.getWXContext().OPENID

  try {
    switch (action) {
      case 'get': {
        // 获取子账号列表
        const { enterpriseId } = data || {}
        if (!enterpriseId) {
          return { success: false, error: '企业ID不能为空' }
        }

        const result = await db.collection('enterprise_sub_accounts')
          .where({ enterprise_id: enterpriseId })
          .orderBy('create_time', 'desc')
          .get()

        return { success: true, data: result.data }
      }

      case 'getByPhone': {
        // 通过手机号获取子账号
        const { phone, enterprise_id } = data || {}
        if (!phone) {
          return { success: false, error: '手机号不能为空' }
        }

        let where = { phone }
        if (enterprise_id) {
          where.enterprise_id = enterprise_id
        }

        const result = await db.collection('enterprise_sub_accounts')
          .where(where)
          .limit(1)
          .get()

        return { success: true, data: result.data && result.data.length > 0 ? result.data[0] : null }
      }

      case 'add': {
        // 添加子账号
        const { enterprise_id, phone, remark = '', balance = 0 } = data || {}
        if (!enterprise_id || !phone) {
          return { success: false, error: '参数不完整' }
        }

        // 检查是否已存在
        const existRes = await db.collection('enterprise_sub_accounts')
          .where({ phone })
          .get()
        
        if (existRes.data && existRes.data.length > 0) {
          const exist = existRes.data[0]
          if (exist.enterprise_id !== enterprise_id) {
            return { success: false, error: '该手机号已被其他企业添加' }
          }
          return { success: false, error: '该子账号已存在' }
        }

        // 如果分配了余额，先检查企业余额
        if (balance > 0) {
          const entRes = await db.collection('enterprises').doc(enterprise_id).get()
          const entBalance = entRes.data.balance || 0
          
          // 计算当前所有子账号余额总和
          const subRes = await db.collection('enterprise_sub_accounts')
            .where({ enterprise_id })
            .field({ balance: true })
            .get()
          let currentSubTotal = 0
          if (subRes.data) {
            currentSubTotal = subRes.data.reduce((sum, acc) => sum + (acc.balance || 0), 0)
          }
          
          if (currentSubTotal + balance > entBalance) {
            return { success: false, error: '企业余额不足' }
          }
        }

        // 检查手机号是否已注册
        let userId = null
        let status = 'pending'
        const userRes = await db.collection('users')
          .where({ phone })
          .field({ _id: true })
          .get()
        if (userRes.data && userRes.data.length > 0) {
          userId = userRes.data[0]._id
          status = 'active'
        }

        // 扣减企业余额
        if (balance > 0) {
          const entRes = await db.collection('enterprises').doc(enterprise_id).get()
          await db.collection('enterprises').doc(enterprise_id).update({
            data: { balance: entRes.data.balance - balance }
          })
        }

        const addRes = await db.collection('enterprise_sub_accounts').add({
          data: {
            enterprise_id,
            phone,
            remark,
            balance,
            status,
            user_id: userId,
            create_time: new Date(),
            update_time: new Date()
          }
        })

        return { success: true, data: { _id: addRes._id, status } }
      }

      case 'update': {
        // 更新子账号
        const { id, remark, balance } = data || {}
        if (!id) {
          return { success: false, error: 'ID不能为空' }
        }

        // 先查询当前子账号信息
        const currentRes = await db.collection('enterprise_sub_accounts').doc(id).get()
        const currentAccount = currentRes.data
        if (!currentAccount) {
          return { success: false, error: '子账号不存在' }
        }

        const updateData = { update_time: new Date() }
        if (remark !== undefined) updateData.remark = remark
        
        // 如果更新余额，需要同步扣减企业余额
        if (balance !== undefined && balance !== currentAccount.balance) {
          const diff = balance - (currentAccount.balance || 0)
          
          if (diff > 0) {
            // 增加余额，从企业扣减
            const entRes = await db.collection('enterprises').doc(currentAccount.enterprise_id).get()
            const entBalance = entRes.data.balance || 0
            
            if (entBalance < diff) {
              return { success: false, error: '企业余额不足' }
            }
            
            // 扣减企业余额
            await db.collection('enterprises').doc(currentAccount.enterprise_id).update({
              data: { balance: entBalance - diff }
            })
          }
          
          updateData.balance = balance
        }

        await db.collection('enterprise_sub_accounts').doc(id).update({
          data: updateData
        })

        // 查询更新后的数据确认
        const afterRes = await db.collection('enterprise_sub_accounts').doc(id).get()
        
        return { success: true, data: afterRes.data }
      }

      case 'delete': {
        // 删除子账号
        const { id } = data || {}
        if (!id) {
          return { success: false, error: 'ID不能为空' }
        }

        await db.collection('enterprise_sub_accounts').doc(id).remove()
        return { success: true }
      }

      default:
        return { success: false, error: '未知操作' }
    }
  } catch (err) {
    console.error('subaccountOps error:', err)
    return { success: false, error: err.message }
  }
}
