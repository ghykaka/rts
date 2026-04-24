const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * 批量更新企业素材的enterprise_id字段
 * 
 * 逻辑：
 * 1. 查询所有 user_type='enterprise' 的素材
 * 2. 对于缺少enterprise_id的素材，通过 user_id 查询 enterprises 表获取对应的企业ID
 * 3. 更新素材的 enterprise_id 字段
 */
exports.main = async (event, context) => {
  console.log('开始批量更新企业素材enterprise_id...');
  
  try {
    // 1. 查询所有企业素材
    const materialsRes = await db.collection('materials')
      .where({
        user_type: 'enterprise'
      })
      .limit(500)  // 限制每次处理数量
      .get();
    
    const materials = materialsRes.data || [];
    console.log(`找到 ${materials.length} 条企业素材`);
    
    if (materials.length === 0) {
      return { success: true, message: '没有需要更新的企业素材', updated: 0 };
    }
    
    // 2. 收集需要查询的user_id
    const userIds = [...new Set(materials.map(m => m.user_id).filter(Boolean))];
    console.log(`共有 ${userIds.length} 个不同的user_id需要查询`);
    
    // 3. 批量查询enterprises表，构建映射
    const userToEnterpriseMap = {};
    
    for (const userId of userIds) {
      const entRes = await db.collection('enterprises')
        .where({
          admin_user_id: userId
        })
        .limit(1)
        .get();
      
      if (entRes.data && entRes.data.length > 0) {
        userToEnterpriseMap[userId] = entRes.data[0]._id;
        console.log(`映射: ${userId} -> ${entRes.data[0]._id}`);
      } else {
        console.log(`警告: 未找到user_id=${userId}对应的企业`);
      }
    }
    
    // 4. 批量更新素材
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (const material of materials) {
      const userId = material.user_id;
      const enterpriseId = userToEnterpriseMap[userId];
      
      // 没有找到对应的enterprise_id，跳过
      if (!enterpriseId) {
        console.log(`跳过: ${material._id} - 未找到企业`);
        skippedCount++;
        continue;
      }
      
      // 已经有正确的enterprise_id，跳过
      if (material.enterprise_id && material.enterprise_id === enterpriseId) {
        skippedCount++;
        continue;
      }
      
      try {
        await db.collection('materials').doc(material._id).update({
          data: {
            enterprise_id: enterpriseId,
            update_time: new Date()
          }
        });
        console.log(`更新成功: ${material._id} -> ${enterpriseId}`);
        updatedCount++;
      } catch (err) {
        console.log(`更新失败: ${material._id} - ${err.message}`);
        errorCount++;
        errors.push({ id: material._id, error: err.message });
      }
    }
    
    // 5. 返回结果
    const result = {
      success: true,
      total: materials.length,
      updated: updatedCount,
      skipped: skippedCount,
      errors: errorCount,
      errorDetails: errors
    };
    
    console.log('更新完成:', result);
    return result;
    
  } catch (err) {
    console.error('执行出错:', err);
    return { success: false, error: err.message };
  }
};
