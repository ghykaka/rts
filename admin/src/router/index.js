import { createRouter, createWebHashHistory } from 'vue-router'
import store from '../store'

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('../views/layout/index.vue'),
    redirect: '/user/personal',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'user',
        name: 'UserManagement',
        redirect: '/user/personal',
        meta: { title: '用户管理', icon: 'User' },
        children: [
          {
            path: 'personal',
            name: 'PersonalUsers',
            component: () => import('../views/user/personal.vue'),
            meta: { title: '个人用户', parentTitle: '用户管理' }
          },
          {
            path: 'enterprise',
            name: 'EnterpriseUsers',
            component: () => import('../views/user/enterprise.vue'),
            meta: { title: '企业用户', parentTitle: '用户管理' }
          }
        ]
      },
      {
        path: 'recharge',
        name: 'Recharge',
        component: () => import('../views/recharge/index.vue'),
        meta: { title: '充值记录', icon: 'Money' }
      },
      {
        path: 'order',
        name: 'Order',
        component: () => import('../views/order/index.vue'),
        meta: { title: '订单管理', icon: 'List' }
      },
      {
        path: 'material',
        name: 'Material',
        component: () => import('../views/material/index.vue'),
        meta: { title: '素材管理', icon: 'Folder' }
      },
      {
        path: 'coze',
        name: 'CozeWorkflows',
        component: () => import('../views/coze/index.vue'),
        meta: { title: 'Coze工作流', icon: 'Connection' }
      },
      {
        path: 'workflow-products',
        name: 'WorkflowProducts',
        component: () => import('../views/workflow-products/index.vue'),
        meta: { title: '工作流产品', icon: 'Goods' }
      },
      {
        path: 'workflow-functions',
        name: 'WorkflowFunctions',
        component: () => import('../views/workflow-functions/index.vue'),
        meta: { title: '功能管理', icon: 'Connection' }
      },
      {
        path: 'template',
        name: 'Template',
        component: () => import('../views/template/index.vue'),
        meta: { title: '模板管理', icon: 'Document' }
      },
      {
        path: 'platform',
        name: 'PlatformConfig',
        redirect: '/platform/generate-sizes',
        meta: { title: '平台配置', icon: 'Tools' },
        children: [
          {
            path: 'generate-sizes',
            name: 'GenerateSizes',
            component: () => import('../views/generate-sizes/index.vue'),
            meta: { title: '生成物尺寸', parentTitle: '平台配置' }
          },
          {
            path: 'industry',
            name: 'Industry',
            component: () => import('../views/industry/index.vue'),
            meta: { title: '行业管理', parentTitle: '平台配置' }
          },
          {
            path: 'category',
            name: 'Category',
            component: () => import('../views/category/index.vue'),
            meta: { title: '模板分类', parentTitle: '平台配置' }
          },
          {
            path: 'home-config',
            name: 'HomeConfig',
            component: () => import('../views/homeConfig/index.vue'),
            meta: { title: '首页配置', parentTitle: '平台配置' }
          },
      {
        path: 'article',
        name: 'Article',
        component: () => import('../views/article/index.vue'),
        meta: { title: '文章管理', parentTitle: '平台配置' }
      },
      {
        path: 'recharge-config',
        name: 'RechargeConfig',
        component: () => import('../views/recharge-config/index.vue'),
        meta: { title: '充值金额配置', parentTitle: '平台配置' }
      }
        ]
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  // 使用 hash 模式，避免刷新 404
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 让她生后台` : '让她生后台'
  
  // 检查登录状态
  if (to.meta.requiresAuth) {
    const token = store.state.token || localStorage.getItem('admin_token')
    if (!token) {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
