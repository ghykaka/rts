# 让她生 - 后台管理系统

## 项目结构

```
admin/
├── src/
│   ├── api/              # API 接口
│   ├── assets/          # 静态资源
│   ├── router/          # 路由配置
│   ├── store/           # Vuex 状态管理
│   ├── views/           # 页面组件
│   │   ├── layout/      # 后台布局
│   │   ├── login/       # 登录页
│   │   ├── user/        # 用户管理
│   │   ├── recharge/    # 充值记录
│   │   └── material/    # 素材管理
│   ├── App.vue
│   └── main.js
├── package.json
└── vite.config.js
```

## 安装依赖

```bash
cd admin
npm install
```

## 开发

```bash
npm run dev
```

## 部署

### 方式一：腾讯云静态网站托管

1. 构建项目：`npm run build`
2. 上传 dist 目录到云开发静态网站托管

### 方式二：本地运行预览

```bash
npm run preview
```

## 后台功能

- [x] 管理员登录
- [x] 用户管理（查看、搜索、调整余额）
- [x] 充值记录（查看、统计）
- [x] 素材管理（查看、删除、批量添加）

## 需要上传的云函数

在微信开发者工具中上传以下云函数：

1. `adminLogin` - 管理员登录
2. `adminGetUsers` - 获取用户列表
3. `adminUpdateUser` - 更新用户信息
4. `adminGetRecharges` - 获取充值记录
5. `adminGetMaterials` - 获取素材列表
6. `adminAddMaterial` - 添加素材

## 创建管理员账号

在云开发控制台手动添加数据到 `admin_users` 集合：

```json
{
  "username": "admin",
  "password": "5f4dcc3b5aa765d61d8327deb882cf99",
  "role": "admin",
  "created_at": Date
}
```

**初始密码**: `password`（加密后）

**修改密码方法**:
```javascript
// 在 Node.js 中生成
const crypto = require('crypto')
const password = crypto.createHash('md5').update('your_password' + 'salt').digest('hex')
```

## 数据库集合

确保以下集合存在：

- `admin_users` - 管理员表
- `users` - 用户表
- `recharges` - 充值记录表
- `materials` - 素材表
