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
