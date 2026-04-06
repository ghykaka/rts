<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
      <div class="logo">
        <span v-if="!isCollapse">让她生</span>
        <span v-else>管理</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        class="menu"
      >
        <el-sub-menu index="/user">
          <template #title>
            <el-icon><User /></el-icon>
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
          <el-icon><Money /></el-icon>
          <template #title>充值记录</template>
        </el-menu-item>
        
        <el-menu-item index="/material">
          <el-icon><Folder /></el-icon>
          <template #title>素材管理</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <!-- 头部 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentRoute }}</el-breadcrumb-item>
          </el-breadcrumb>
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
      </el-header>
      
      <!-- 主内容 -->
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
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
    const isCollapse = ref(false)
    
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
      isCollapse,
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
}

.aside {
  background: #304156;
  transition: width 0.3s;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  background: #263445;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  overflow: hidden;
  white-space: nowrap;
}

.menu {
  border-right: none;
  background: #304156;
}

.menu:not(.el-menu--collapse) {
  width: 200px;
}

:deep(.el-menu) {
  background: transparent;
}

:deep(.el-menu-item) {
  color: #bfcbd9;
}

:deep(.el-menu-item:hover),
:deep(.el-menu-item.is-active) {
  background: #263445 !important;
  color: #409eff !important;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.collapse-btn:hover {
  color: #409eff;
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
  color: #666;
}

.user-info:hover {
  color: #409eff;
}

.main {
  background: #f5f7fa;
  padding: 20px;
}
</style>
