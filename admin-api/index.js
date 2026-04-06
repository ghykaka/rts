const express = require('express')
const cloud = require('@cloudbase/node-sdk')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

// 手动 CORS 配置
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

app.use(express.json())

// 托管前端静态文件
app.use(express.static(path.join(__dirname, 'dist')))

// API 路由...

// 初始化云开发 SDK
let cloudApp = null

function getCloudApp() {
  if (!cloudApp) {
    cloudApp = cloud.init({
      secretId: process.env.SECRET_ID,
      secretKey: process.env.SECRET_KEY,
      env: process.env.ENV_ID || 'liandaofutou-2gdayw0068d938b3'
    })
  }
  return cloudApp
}

// 调用云函数
async function callCloudFunction(name, data = {}) {
  try {
    const app = getCloudApp()
    const res = await app.callFunction({
      name: name,
      data: data
    })
    
    console.log(`云函数 ${name} 响应:`, JSON.stringify(res))
    
    if (res.data) {
      return res.data
    }
    return res
  } catch (err) {
    console.error(`调用云函数 ${name} 失败:`, err.message)
    throw err
  }
}

// 验证管理员 token
async function verifyAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ success: false, error: '未登录' })
  }
  req.adminToken = token
  next()
}

// ============ 路由 ============

// 管理员登录
app.post('/admin/login', async (req, res) => {
  try {
    const result = await callCloudFunction('adminlogin', req.body)
    res.json(result)
  } catch (err) {
    res.status(500).json({ success: false, error: '登录失败' })
  }
})

// 获取用户列表
app.get('/admin/users', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, pageSize = 20, userId, phone, userType, enterpriseName } = req.query
    const result = await callCloudFunction('admingetusers', {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      userId: userId || undefined,
      phone: phone || undefined,
      userType: userType || undefined,
      enterpriseName: enterpriseName || undefined
    })
    res.json(result)
  } catch (err) {
    res.status(500).json({ success: false, error: '获取用户列表失败' })
  }
})

// 更新用户
app.put('/admin/users/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const result = await callCloudFunction('adminupdateuser', {
      id,
      ...req.body
    })
    res.json(result)
  } catch (err) {
    res.status(500).json({ success: false, error: '更新用户失败' })
  }
})

// 更新用户余额
app.put('/admin/users/:id/balance', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { balance } = req.body
    const result = await callCloudFunction('adminupdateuser', {
      id,
      balance
    })
    res.json(result)
  } catch (err) {
    res.status(500).json({ success: false, error: '更新余额失败' })
  }
})

// 更新企业余额
app.put('/admin/enterprises/:id/balance', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { balance } = req.body
    // 直接操作数据库更新企业余额
    const app = getCloudApp()
    const db = app.database()
    
    const result = await db.collection('enterprises').doc(id).update({
      data: {
        balance: balance,
        update_time: new Date()
      }
    })
    
    res.json({ success: true, data: result })
  } catch (err) {
    console.error('更新企业余额失败:', err)
    res.status(500).json({ success: false, error: '更新企业余额失败' })
  }
})

// 获取充值记录
app.get('/admin/recharges', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, pageSize = 20, phone, outTradeNo, transactionId, status, startDate, endDate } = req.query
    
    console.log('=== Railway 收到参数 ===')
    console.log('req.query:', req.query)
    console.log('status:', status, 'type:', typeof status)
    
    const cloudData = {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      phone: phone || undefined,
      outTradeNo: outTradeNo || undefined,
      transactionId: transactionId || undefined,
      status: status || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    }
    
    console.log('传给云函数的数据:', cloudData)
    
    const result = await callCloudFunction('admingetrecharges', cloudData)
    console.log('云函数返回:', JSON.stringify(result).substring(0, 500))
    res.json(result)
  } catch (err) {
    console.error('获取充值记录失败:', err)
    res.status(500).json({ success: false, error: '获取充值记录失败' })
  }
})

// 手动确认充值订单
app.post('/admin/recharges/:outTradeNo/confirm', verifyAdmin, async (req, res) => {
  try {
    const { outTradeNo } = req.params
    console.log('手动确认订单:', outTradeNo)
    const result = await callCloudFunction('confirmRecharge', { outTradeNo })
    res.json(result)
  } catch (err) {
    res.status(500).json({ success: false, error: '确认充值失败' })
  }
})

// 获取素材列表
app.get('/admin/materials', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, pageSize = 20, userId } = req.query
    const result = await callCloudFunction('admingetmaterials', {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      userId: userId || ''
    })
    res.json(result)
  } catch (err) {
    res.status(500).json({ success: false, error: '获取素材列表失败' })
  }
})

// 添加素材
app.post('/admin/materials', verifyAdmin, async (req, res) => {
  try {
    const result = await callCloudFunction('adminaddmaterial', req.body)
    res.json(result)
  } catch (err) {
    res.status(500).json({ success: false, error: '添加素材失败' })
  }
})

// 删除素材
app.delete('/admin/materials/:id', verifyAdmin, async (req, res) => {
  try {
    // admin_delete_material 云函数暂未部署
    res.json({ success: false, error: '删除功能未启用' })
  } catch (err) {
    res.status(500).json({ success: false, error: '删除素材失败' })
  }
})

// 获取 Coze 工作流列表
app.get('/admin/coze/workflows', verifyAdmin, async (req, res) => {
  try {
    const { pageNum = 1, pageSize = 30, workflowMode } = req.query
    const result = await callCloudFunction('getcozeworkflows', {
      pageNum: parseInt(pageNum),
      pageSize: parseInt(pageSize),
      workflowMode: workflowMode || undefined
    })
    res.json(result)
  } catch (err) {
    console.error('获取 Coze 工作流列表失败:', err)
    res.status(500).json({ success: false, error: '获取 Coze 工作流列表失败' })
  }
})

// 根路由 - 返回前端页面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// 前端路由通配符 (Vue Router history 模式)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// Railway 启动
app.listen(PORT, () => {
  console.log(`Admin API running on port ${PORT}`)
})

module.exports = app
