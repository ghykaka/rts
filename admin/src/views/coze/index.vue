<template>
  <div class="coze-container">
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>Coze 工作流列表</span>
          <el-button type="primary" @click="loadData" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column label="图标" width="60" align="center">
          <template #default="{ row }">
            <el-avatar :size="36" shape="square">
              <img v-if="row.icon_url" :src="row.icon_url" @error="handleImgError" />
              <span v-else>{{ row.workflow_name?.charAt(0) || 'W' }}</span>
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="工作流名称" min-width="180">
          <template #default="{ row }">
            <div class="name-cell">
              <span>{{ row.workflow_name }}</span>
              <el-tag :type="row.workflow_mode === 'workflow' ? 'success' : 'warning'" size="small">
                {{ row.workflow_mode_name }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="描述" min-width="200">
          <template #default="{ row }">
            <span class="desc-text" :title="row.description">{{ row.description || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.publish_status === 'published_online' ? 'success' : 'info'" size="small">
              {{ row.publish_status_name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建者" width="100">
          <template #default="{ row }">
            {{ row.creator || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ row.created_at || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="160">
          <template #default="{ row }">
            {{ row.updated_at || '-' }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 错误提示 -->
      <el-alert
        v-if="error"
        :title="error"
        type="error"
        show-icon
        class="error-alert"
        :closable="false"
      />
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import api from '@/api'

export default {
  name: 'CozeWorkflows',
  components: { Refresh },
  setup() {
    const store = useStore()
    const loading = ref(false)
    const tableData = ref([])
    const error = ref('')

    const loadData = async () => {
      loading.value = true
      error.value = ''
      
      try {
        const token = store.state.token
        const res = await api.getCozeWorkflows({
          pageNum: 1,
          pageSize: 100
        }, token)
        
        if (res.success) {
          tableData.value = res.data || []
          if (tableData.value.length === 0) {
            ElMessage.info('暂未配置 Coze 工作流')
          }
        } else {
          error.value = res.error || '获取工作流列表失败'
          ElMessage.error(res.error || '获取工作流列表失败')
        }
      } catch (err) {
        console.error('获取工作流列表失败:', err)
        error.value = err.message || '获取工作流列表失败'
        ElMessage.error('获取工作流列表失败')
      } finally {
        loading.value = false
      }
    }

    const handleImgError = (e) => {
      e.target.style.display = 'none'
    }

    onMounted(() => {
      loadData()
    })

    return {
      loading,
      tableData,
      error,
      loadData,
      handleImgError
    }
  }
}
</script>

<style scoped>
.coze-container {
  height: 100%;
}

.table-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.desc-text {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #666;
}

.error-alert {
  margin-top: 16px;
}
</style>
