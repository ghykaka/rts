# 让她生小程序

## 项目结构

```
├── app.js / app.json / app.wxss    # 小程序入口
├── cloudfunctions/                  # 云函数
│   ├── login/                       # 微信登录
│   ├── getUserInfo/                 # 获取用户信息
│   ├── getTemplates/                # 获取模板列表
│   ├── getTemplateDetail/          # 获取模板详情
│   ├── getTemplateCategories/      # 获取模板分类
│   ├── createOrder/                # 创建订单
│   ├── getOrders/                  # 获取订单列表
│   ├── createRecharge/             # 充值
│   ├── getMaterials/               # 获取素材
│   └── getMaterialCategories/     # 获取素材分类
├── pages/                          # 页面
│   ├── index/                      # 首页
│   ├── works/                      # 作品库
│   ├── profile/                    # 我的
│   ├── template-detail/            # 模板详情
│   ├── materials/                  # 素材库
│   ├── recharge/                   # 充值
│   ├── enterprise/                 # 企业素材库
│   └── login/                      # 登录
└── assets/                        # 静态资源
```

## 使用步骤

### 1. 开通 CloudBase

1. 登录 [腾讯云 CloudBase 控制台](https://console.cloud.tencent.com/tcb)
2. 创建环境（选择免费配额）
3. 获取环境ID

### 2. 配置 AppID

修改 `project.config.json` 中的 `appid` 为你的小程序AppID

### 3. 创建数据库集合

在 CloudBase 控制台创建以下13个集合：
- users
- enterprises
- enterprise_staff
- industries
- material_categories
- materials
- pricing
- orders
- recharges
- template_categories
- templates
- template_fields
- template_pricing

### 4. 上传云函数

在微信开发者工具中，右键点击每个云函数文件夹，选择"上传并部署"

### 5. 添加静态资源

在 `assets` 目录下添加必要的图标和图片

### 6. 配置微信支付

1. 在 CloudBase 控制台开通微信支付
2. 修改 `cloudfunctions/createRecharge/index.js` 中的 `subMchId`

## 功能说明

- **微信登录**：新用户自动赠送5元余额
- **模板浏览**：按分类浏览模板
- **生成图片/视频**：选择模板、填写参数、生成作品
- **订单管理**：查看生成记录
- **素材库**：个人/企业素材管理
- **充值**：微信支付充值余额
- **企业功能**：企业账户、员工管理、素材库

## 开发指南

### 添加模板

1. 在 `template_categories` 集合添加分类
2. 在 `templates` 集合添加模板
3. 在 `template_fields` 集合添加输入字段
4. 在 `template_pricing` 集合添加定价

### 添加行业

在 `industries` 集合添加行业，如：电商、餐饮、教育、酒水/零售/快消
