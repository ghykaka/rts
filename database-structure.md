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
| industry | String | 是 | 所属行业 |
| admin_user_id | String | 是 | 管理员用户ID |
| admin_nickname | String | 否 | 管理员昵称 |
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
  "industry": "互联网",
  "admin_user_id": "user_123456",
  "admin_nickname": "张三",
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
