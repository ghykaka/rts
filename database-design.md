# 数据库表结构设计

## 1. 用户表 `users`

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 用户ID（系统生成）|
| openid | string | 微信openid |
| nickname | string | 昵称 |
| avatar | string | 头像URL |
| phone | string | 手机号（授权后绑定）|
| user_type | string | 当前身份 `personal`个人 / `enterprise`企业 |
| industry | string | 行业属性（如：电商、餐饮、教育）|
| enterprise_name | string | 企业名称（企业用户时填写）|
| balance | number | 余额（分），新用户赠送500=5元 |
| created_at | date | 注册时间 |
| updated_at | date | 更新时间 |

---

## 2. 企业信息表 `enterprises`

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 企业ID |
| owner_user_id | string | owner用户ID |
| name | string | 企业名称 |
| industry | string | 行业 |
| created_at | date | 创建时间 |

---

## 3. 企业员工表 `enterprise_staff`

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | ID |
| enterprise_id | string | 企业主账号ID |
| staff_user_id | string | 员工用户ID |
| allocated_quota | number | 分配额度（分）|
| used_quota | number | 已用额度（分）|
| created_at | date | 添加时间 |

---

## 4. 行业表 `industries`（后台维护）

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 行业ID |
| name | string | 行业名称 |
| created_at | date | 创建时间 |

---

## 5. 素材分类表 `material_categories`

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 分类ID |
| name | string | 分类名称 |
| parent_id | string | 父分类ID（空=1级）|
| owner_id | string | 所属用户/企业ID |
| owner_type | string | `personal` / `enterprise` |
| created_at | date | 创建时间 |

---

## 6. 素材表 `materials`

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 素材ID |
| name | string | 素材名称 |
| url | string | 素材文件URL |
| type | string | `image` / `video` |
| category_id | string | 分类ID |
| tags | array | 标签数组 |
| industry | string | 行业属性 |
| owner_id | string | 所属用户/企业ID |
| owner_type | string | `personal` / `enterprise` |
| created_at | date | 创建时间 |

---

## 7. 定价配置表 `pricing`

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | ID |
| service_type | string | 服务类型（如 `image_generate`、`video_generate`）|
| name | string | 功能名称 |
| one_time_price | number | 单次付费价格（分）|
| balance_price | number | 余额扣减价格（分）|
| is_active | boolean | 是否启用 |
| created_at | date | 创建时间 |

---

## 8. 订单表 `orders`

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 订单ID |
| user_id | string | 用户ID |
| service_type | string | 服务类型 |
| coze_workflow_id | string | COZE工作流ID |
| status | string | `pending`处理中 / `completed`已完成 / `failed`失败 |
| input_params | object | 输入参数 |
| output_url | string | 生成的图片/视频URL |
| cost_amount | number | 消耗金额（分）|
| cost_type | string | 消耗方式 `balance`余额 / `one_time`单次付费 |
| started_at | date | 开始时间 |
| completed_at | date | 完成时间 |
| created_at | date | 创建时间 |

---

## 9. 充值记录表 `recharges`

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 充值ID |
| user_id | string | 用户ID |
| enterprise_id | string | 企业ID（企业充值时）|
| amount | number | 充值金额（分）|
| payment_method | string | 支付方式 `wechat_pay` |
| status | string | `pending` / `completed` / `failed` |
| transaction_id | string | 微信支付订单号 |
| created_at | date | 创建时间 |

---

## 10. 模板分类表 `template_categories`

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 分类ID |
| name | string | 分类名称 |
| parent_id | string | 父分类ID（空=1级）|
| sort | number | 排序 |
| created_at | date | 创建时间 |

**一级分类示例**：广告风格、实景风格、动漫风格、人物风格

**二级分类示例**：
- 广告风格 → 大牌广告、港风招贴、野广告风格
- 实景风格 → 白天场景、夜晚场景、静物写真
- 动漫风格 → 日本漫画、3D、欧美、国风、像素风
- 人物风格 → 帅哥、美女、老人、儿童、人物组合

---

## 11. 模板表 `templates`

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 模板ID |
| name | string | 模板名称 |
| description | string | 描述 |
| cover_url | string | 封面图URL |
| preview_urls | array | 预览图URL数组 |
| category_id | string | 分类ID |
| industry | string | 行业属性（可多个，用逗号分隔）|
| coze_workflow_id | string | COZE工作流ID |
| prompt | string | 提示词（默认传给工作流的）|
| output_type | string | 输出类型 `image` / `video` |
| aspect_ratio | string | 比例（如 `9:16`、`3:4`、`4:3`、`1:1`）|
| duration | string | 视频时长（如 `5s`、`10s`，仅视频）|
| resolution | string | 分辨率（如 `480p`、`720p`、`1080p`）|
| is_active | boolean | 是否启用 |
| sort | number | 排序 |
| created_at | date | 创建时间 |
| updated_at | date | 更新时间 |

---

## 11. 模板输入字段表 `template_fields`

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 字段ID |
| template_id | string | 模板ID |
| field_name | string | 字段名称（给用户看的，如"价格文案"）|
| field_key | string | 字段名（传给COZE的，如`price`）|
| field_type | string | 字段类型 `text` / `image` |
| max_length | number | 最大字符数（文本时）|
| is_required | boolean | 是否必填 |
| placeholder | string | 占位提示 |
| default_value | string | 默认值 |
| sort | number | 排序 |

**示例**（海报模板）：
| field_name | field_key | field_type | max_length | is_required |
|------------|-----------|------------|------------|-------------|
| 价格文案 | price | text | 20 | false |
| 自定义文案 | wenan | text | 40 | false |
| 个人专属二维码 | qr_img | image | - | false |

---

## 12. 模板定价表 `template_pricing`

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | ID |
| template_id | string | 模板ID |
| aspect_ratio | string | 图片比例（如 `9:16`，图片时填写）|
| duration | string | 视频时长（如 `10s`，视频时填写）|
| resolution | string | 分辨率（如 `1080p`）|
| one_time_price | number | 单次付费价格（分）|
| balance_price | number | 余额扣减价格（分）|
| is_active | boolean | 是否启用 |
| created_at | date | 创建时间 |

**定价示例**（某图片模板）：
| aspect_ratio | one_time_price | balance_price |
|--------------|-----------------|----------------|
| 9:16 | 100(1元) | 80(0.8元) |
| 3:4 | 150(1.5元) | 120(1.2元) |
| 4:3 | 150(1.5元) | 120(1.2元) |
| 1:1 | 80(0.8元) | 60(0.6元) |

**定价示例**（某视频模板）：
| duration | resolution | one_time_price | balance_price |
|----------|------------|-----------------|----------------|
| 5s | 480p | 200(2元) | 150(1.5元) |
| 10s | 720p | 500(5元) | 400(4元) |
| 10s | 1080p | 800(8元) | 600(6元) |

---

## 表关系图

```
users (用户)
  ├── user_type = personal → 个人用户
  │     └── orders (订单)
  │     └── materials (素材)
  │     └── material_categories (素材分类)
  │     └── recharges (充值)
  │
  └── user_type = enterprise → 企业用户
        └── enterprises (企业信息)
        └── enterprise_staff (员工)
              └── staff_user_id → users (员工账号)
        └── materials (素材) ← 子账号也能用
        └── material_categories (素材分类)
        └── recharges (充值)

industries (行业) ───→ materials.industry (素材行业属性)
pricing (定价) ───→ orders.cost_amount (订单扣费)
templates (模板) ──→ template_fields (输入字段)
templates (模板) ──→ template_pricing (按属性定价)
```

---

## 下一步

1. **确认表结构** - 有需要调整的吗？
2. **开始实现** - 你希望先做哪个功能？
   - 用户体系（微信登录）
   - 素材库
   - 订单系统
   - 会员/充值/企业配额
