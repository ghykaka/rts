<template>
  <div class="layout-container">
    <!-- 顶部导航栏 -->
    <div class="top-header">
      <div class="header-left">
        <div class="logo">让她生 · 管理后台</div>
        
        <el-menu
          mode="horizontal"
          :default-active="activeMenu"
          router
          class="top-menu"
        >
          <el-sub-menu index="/user">
            <template #title>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/user/personal">
              <span>个人用户</span>
            </el-menu-item>
            <el-menu-item index="/user/enterprise">
              <span>企业用户</span>
            </el-menu-item>
          </el-sub-menu>
          
          <el-menu-item index="/recharge">
            <span>充值记录</span>
          </el-menu-item>
          
          <el-menu-item index="/material">
            <span>素材管理</span>
          </el-menu-item>
          
          <el-menu-item index="/coze">
            <span>Coze工作流</span>
          </el-menu-item>
          
          <el-menu-item index="/workflow-products">
            <span>工作流产品</span>
          </el-menu-item>
          
          <el-menu-item index="/workflow-functions">
            <span>功能管理</span>
          </el-menu-item>

          <el-menu-item index="/template">
            <span>模板管理</span>
          </el-menu-item>

          <el-sub-menu index="/platform">
            <template #title>
              <span>平台配置</span>
            </template>
            <el-menu-item index="/platform/generate-sizes">
              <span>生成物尺寸</span>
            </el-menu-item>
            <el-menu-item index="/platform/industry">
              <span>行业管理</span>
            </el-menu-item>
            <el-menu-item index="/platform/category">
              <span>模板分类</span>
            </el-menu-item>
            <el-menu-item index="/platform/home-config">
              <span>首页配置</span>
            </el-menu-item>
            <el-menu-item index="/platform/article">
              <span>文章管理</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
      
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <el-icon><UserFilled /></el-icon>
            <span>{{ username }}</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    
    <!-- 面包屑导航 -->
    <div class="breadcrumb-bar">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ currentRoute }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <!-- 主内容 -->
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

export default {
  name: 'Layout',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    
    const activeMenu = computed(() => route.path)
    const currentRoute = computed(() => route.meta.title || (route.meta.parentTitle ? route.meta.parentTitle + ' - ' + route.meta.title : ''))
    const username = computed(() => store.state.userInfo.username || '管理员')
    
    const handleCommand = (command) => {
      if (command === 'logout') {
        store.dispatch('logout')
        ElMessage.success('已退出登录')
        router.push('/login')
      }
    }
    
    return {
      activeMenu,
      currentRoute,
      username,
      handleCommand
    }
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

/* 顶部导航栏 */
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  height: 100%;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  margin-right: 40px;
  letter-spacing: 1px;
  white-space: nowrap;
}

/* 顶部菜单 */
.top-menu {
  border: none;
  background: transparent;
  height: 60px;
  line-height: 60px;
  flex: 1;
}

::deep(.el-menu-item),
::deep(.el-sub-menu__title) {
  color: #ffffff !important;
  font-size: 16px !important;
  font-weight: bold !important;
  height: 60px;
  line-height: 60px;
  padding: 0 14px !important;
  border-bottom: 3px solid transparent;
  min-width: auto;
}

::deep(.el-menu-item .el-icon),
::deep(.el-sub-menu__title .el-icon) {
  color: #ffffff;
  margin-right: 4px;
  font-size: 16px;
}

::deep(.el-menu-item:hover),
::deep(.el-sub-menu__title:hover) {
  background: rgba(255, 255, 255, 0.15) !important;
  color: #ffffff !important;
}

::deep(.el-menu-item.is-active) {
  color: #ffffff !important;
  border-bottom-color: #ffd700 !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

::deep(.el-sub-menu .el-menu) {
  background: #fff !important;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

::deep(.el-sub-menu .el-menu .el-menu-item) {
  color: #303133 !important;
  font-size: 14px !important;
  font-weight: normal !important;
  height: 40px;
  line-height: 40px;
}

::deep(.el-sub-menu .el-menu .el-menu-item:hover) {
  background: #f5f7fa !important;
  color: #667eea !important;
}

::deep(.el-sub-menu .el-menu .el-menu-item.is-active) {
  color: #667eea !important;
}

/* 覆盖 Element Plus el-sub-menu popup 样式 */
::deep(.el-menu--horizontal .el-menu .el-sub-menu__title) {
  color: #303133 !important;
  font-size: 14px !important;
  font-weight: normal !important;
}

::deep(.el-menu--horizontal .el-menu .el-sub-menu__title:hover) {
  background: #f5f7fa !important;
  color: #667eea !important;
}

.sub-menu-title {
  font-size: 15px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.2);
}

.main {
  background: #f5f7fa;
  padding: 20px;
}

/* 面包屑 */
.breadcrumb-bar {
  background: #fff;
  padding: 12px 24px;
  border-bottom: 1px solid #ebeef5;
}

::deep(.el-breadcrumb__item) {
  font-size: 14px;
}

::deep(.el-breadcrumb__inner) {
  color: #606266;
}

::deep(.el-breadcrumb__inner.is-link:hover) {
  color: #667eea;
}

::deep(.el-breadcrumb__separator) {
  color: #c0c4cc;
}

/* 主内容区 */
.main-content {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
}
</style>
