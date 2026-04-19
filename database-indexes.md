/**
 * 数据库索引创建脚本
 * 
 * 使用方法：
 * 1. 确保已安装 tcb CLI: npm install -g @cloudbase/cli
 * 2. 在项目根目录运行: tcb db index create -e <环境ID> -f create_indexes.js
 * 
 * 或者通过腾讯云控制台手动创建索引（推荐）
 */

module.exports = {
  // user_material_categories 集合需要创建的索引
  user_material_categories: [
    // 复合索引：用于按用户类型和用户ID查询
    {
      name: 'idx_user_query',
      fields: {
        user_type: 'asc',
        user_id: 'asc',
        parent_id: 'asc'
      }
    },
    // 复合索引：用于按用户类型和用户ID排序查询
    {
      name: 'idx_user_order',
      fields: {
        user_type: 'asc',
        user_id: 'asc',
        order: 'asc'
      }
    }
  ],

  // materials 集合需要创建的索引
  materials: [
    // 复合索引：用于按用户类型和用户ID查询素材
    {
      name: 'idx_owner_query',
      fields: {
        owner_type: 'asc',
        owner_id: 'asc'
      }
    },
    // 复合索引：用于按用户类型和用户ID查询素材（后台格式）
    {
      name: 'idx_user_query',
      fields: {
        user_type: 'asc',
        user_id: 'asc'
      }
    },
    // 索引：用于按分类查询
    {
      name: 'idx_category',
      fields: {
        category_id: 'asc'
      }
    }
  ]
}
