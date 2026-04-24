# 数据库设计文档

## 集合说明

### users (用户表)

存储小程序用户信息。

#### 字段说明

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | String | 是 | 用户ID(主键) |
| _openid | String | 是 | 微信openid |
| nickname | String | 否 | 用户昵称 |
| avatar | String | 否 | 头像URL |
| phone | String | 否 | 手机号 |
| user_type | String | 是 | 用户类型: personal(个人用户) / enterprise(企业用户) |
| enterprise_id | String | 否 | 所属企业ID(企业用户必填) |
| company_name | String | 否 | 企业全称 |
| company_short_name | String | 否 | 企业简称 |
| industry | String | 否 | 所属行业 |
| role | String | 否 | 角色: admin(管理员) / member(成员) |
| balance | Number | 是 | 账户余额(单位:分) |
| create_time | Date | 是 | 创建时间 |
| update_time | Date | 是 | 更新时间 |

#### 索引建议
- `_openid` (唯一索引)
- `enterprise_id`
- `phone`

#### 示例数据

```json
{
  "_id": "user_123456",
  "_openid": "oxxxxxxxxxxxxx",
  "nickname": "张三",
  "avatar": "https://xxx.com/avatar.jpg",
  "phone": "13800138000",
  "user_type": "enterprise",
  "enterprise_id": "ent_789",
  "company_name": "北京科技有限公司",
  "company_short_name": "科技",
  "industry": "互联网",
  "role": "admin",
  "balance": 50000,
  "create_time": {
    "$date": "2026-03-31T12:00:00.000Z"
  },
  "update_time": {
    "$date": "2026-03-31T12:00:00.000Z"
  }
}
```

---

### enterprises (企业表)

存储企业基本信息。

#### 字段说明

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | String | 是 | 企业ID(主键) |
| company_name | String | 是 | 企业全称 |
| company_short_name | String | 是 | 企业简称 |
| industries | Array | 是 | 所属行业列表（多选，从industries表选择） |
| admin_user_id | String | 是 | 管理员用户ID |
| admin_nickname | String | 否 | 管理员昵称 |
| balance | Number | 是 | 企业账户余额(单位:分) |
| create_time | Date | 是 | 创建时间 |
| update_time | Date | 是 | 更新时间 |

#### 索引建议
- `company_name` (用于模糊查询)
- `company_short_name` (唯一索引)
- `admin_user_id`

#### 示例数据

```json
{
  "_id": "ent_789",
  "company_name": "北京科技有限公司",
  "company_short_name": "科技",
  "industries": ["互联网", "电子商务"],
  "admin_user_id": "user_123456",
  "admin_nickname": "张三",
  "balance": 500000,
  "create_time": {
    "$date": "2026-03-31T12:00:00.000Z"
  },
  "update_time": {
    "$date": "2026-03-31T12:00:00.000Z"
  }
}
```

---

### enterprise_sub_accounts (企业子账号表)

存储企业子账号信息，支持预添加未注册用户。

#### 字段说明

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | String | 是 | 子账号ID(主键) |
| enterprise_id | String | 是 | 所属企业ID |
| phone | String | 是 | 子账号手机号 |
| remark | String | 否 | 备注名称 |
| balance | Number | 是 | 分配余额(单位:分) |
| status | String | 是 | 状态: pending(待激活) / active(已激活) |
| user_id | String | 否 | 绑定的用户ID（激活后填充） |
| create_time | Date | 是 | 创建时间 |
| update_time | Date | 是 | 更新时间 |

#### 索引建议
- `enterprise_id`
- `phone` (唯一索引，同一手机号只能属于一个企业)
- `user_id`

#### 示例数据

```json
{
  "_id": "sub_001",
  "enterprise_id": "ent_789",
  "phone": "13800138001",
  "remark": "市场部-小李",
  "balance": 100000,
  "status": "pending",
  "user_id": null,
  "create_time": {
    "$date": "2026-03-31T12:00:00.000Z"
  },
  "update_time": {
    "$date": "2026-03-31T12:00:00.000Z"
  }
}
```

---

### categories (分类表)

存储产品分类信息。

#### 字段说明

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | String | 是 | 分类ID(主键) |
| name | String | 是 | 分类名称 |
| level | Number | 是 | 分类级别: 1(一级) / 2(二级) |
| parent_id | String | 否 | 父分类ID(二级分类必填) |
| sort | Number | 是 | 排序值 |
| create_time | Date | 是 | 创建时间 |

#### 索引建议
- `parent_id`
- `level`

---

### products (产品表)

存储产品信息。

#### 字段说明

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | String | 是 | 产品ID(主键) |
| name | String | 是 | 产品名称 |
| description | String | 否 | 产品描述 |
| image | String | 是 | 产品图片URL |
| category_id | String | 是 | 所属分类ID |
| create_time | Date | 是 | 创建时间 |

#### 索引建议
- `category_id`

---

### templates (模板表)

存储海报模板信息。

#### 字段说明

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | String | 是 | 模板ID(主键) |
| name | String | 是 | 模板名称 |
| description | String | 否 | 模板描述 |
| cover | String | 是 | 模板封面URL |
| category_id | String | 是 | 所属分类ID |
| create_time | Date | 是 | 创建时间 |

#### 索引建议
- `category_id`

---

### template_pricing (模板定价表)

存储模板不同尺寸的定价信息。

#### 字段说明

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | String | 是 | 定价ID(主键) |
| template_id | String | 是 | 模板ID |
| aspect_ratio | String | 是 | 尺寸比例: 9:16 / 3:4 / 4:3 / 1:1 |
| balance_price | Number | 是 | 余额价格(单位:分) |

#### 索引建议
- `template_id`

---

### orders (订单表)

存储用户的海报生成订单。

#### 字段说明

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | String | 是 | 订单ID(主键) |
| user_id | String | 是 | 用户ID |
| template_id | String | 是 | 模板ID |
| template_name | String | 是 | 模板名称 |
| template_cover | String | 是 | 模板封面 |
| product_id | String | 是 | 产品ID |
| product_name | String | 是 | 产品名称 |
| product_image | String | 是 | 产品图片 |
| aspect_ratio | String | 是 | 尺寸比例 |
| price_text | String | 否 | 价格文案 |
| custom_text | String | 否 | 自定义文案 |
| qr_code_url | String | 否 | 二维码URL |
| balance_price | Number | 是 | 消耗金额(单位:分) |
| status | String | 是 | 状态: generating(生成中) / completed(已完成) / failed(失败) |
| poster_url | String | 否 | 海报URL |
| create_time | Date | 是 | 创建时间 |
| update_time | Date | 是 | 更新时间 |

#### 索引建议
- `user_id`
- `status`
- `create_time`

---

## user_material_categories (后台素材分类表)

存储后台管理系统创建的素材分类信息。

#### 字段说明

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | String | 是 | 分类ID(主键) |
| name | String | 是 | 分类名称 |
| parent_id | String | 否 | 父分类ID(一级分类为null) |
| user_type | String | 是 | 用户类型: personal(个人) / enterprise(企业) |
| user_id | String | 是 | 用户ID |
| order | Number | 是 | 排序值(越小越靠前) |
| create_time | Date | 是 | 创建时间 |
| update_time | Date | 是 | 更新时间 |

#### 索引建议 (重要！)

**⚠️ 必须创建以下索引，否则查询会超时！**

| 索引名称 | 字段顺序 | 说明 |
|---------|---------|------|
| idx_user_query | user_type + user_id + parent_id | 按用户查询分类（必需） |
| idx_user_order | user_type + user_id + order | 按用户排序查询（必需） |

#### 示例数据

```json
{
  "_id": "cat_001",
  "name": "酒水类",
  "parent_id": null,
  "user_type": "enterprise",
  "user_id": "user_123",
  "order": 0,
  "create_time": {
    "$date": "2026-03-31T12:00:00.000Z"
  },
  "update_time": {
    "$date": "2026-03-31T12:00:00.000Z"
  }
}
```

---

## materials (素材表)

存储用户上传的素材信息。

#### 字段说明

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | String | 是 | 素材ID(主键) |
| title | String | 是 | 素材名称/标题 |
| name | String | 否 | 素材名称(兼容字段) |
| url | String | 是 | 素材文件URL |
| thumbnail_url | String | 否 | 缩略图URL |
| type | String | 是 | 素材类型: image/video |
| owner_type | String | 是 | 所有者类型: personal/enterprise |
| owner_id | String | 是 | 所有者ID |
| user_type | String | 否 | 用户类型(后台格式) |
| user_id | String | 否 | 用户ID(后台格式) |
| category_id | String | 否 | 分类ID(一级分类) |
| category1_id | String | 否 | 一级分类ID |
| category2_id | String | 否 | 二级分类ID |
| create_time | Date | 是 | 创建时间 |
| update_time | Date | 是 | 更新时间 |

#### 索引建议

| 索引名称 | 字段顺序 | 说明 |
|---------|---------|------|
| idx_owner_query | owner_type + owner_id | 按所有者查询(必需) |
| idx_user_query | user_type + user_id | 按用户查询(后台格式) |
| idx_category | category_id | 按分类查询 |

---

## 数据库权限设置

### users
- 读权限: 所有用户可读
- 写权限: 仅创建者可写

### enterprises
- 读权限: 所有用户可读
- 写权限: 仅创建者可写

### categories
- 读权限: 所有用户可读
- 写权限: 仅管理员可写

### products
- 读权限: 所有用户可读
- 写权限: 仅管理员可写

### templates
- 读权限: 所有用户可读
- 写权限: 仅管理员可写

### template_pricing
- 读权限: 所有用户可读
- 写权限: 仅管理员可写

### orders
- 读权限: 所有用户可读
- 写权限: 仅创建者可写
