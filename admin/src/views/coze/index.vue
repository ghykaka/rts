<template>
  <div class="coze-container">
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>Coze 工作流列表</span>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="名称">
          <el-input v-model="searchForm.name" placeholder="输入名称搜索" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="searchForm.description" placeholder="输入描述搜索" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column label="图标" width="60" align="center">
          <template #default="{ row }">
            <el-avatar :size="36" shape="square">
              <img v-if="row.icon_url" :src="row.icon_url" @error="handleImgError" />
              <span v-else>{{ row.workflow_name?.charAt(0) || 'W' }}</span>
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="工作流名称" min-width="150">
          <template #default="{ row }">
            <div class="name-cell">
              <span>{{ row.workflow_name }}</span>
              <el-icon class="copy-btn" @click="handleCopyName(row.workflow_name)" title="复制名称">
                <DocumentCopy />
              </el-icon>
              <el-tag type="success" size="small">
                {{ row.workflow_mode_name }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="描述" min-width="260">
          <template #default="{ row }">
            <span class="desc-text" :title="row.description">{{ row.description || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag type="success" size="small">
              {{ row.publish_status_name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建者" width="100">
          <template #default="{ row }">
            {{ row.creator?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ row.created_at_str || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="180">
          <template #default="{ row }">
            {{ row.updated_at_str || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>

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

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="工作流详情" width="600px">
      <el-descriptions :column="2" border v-if="detailData">
        <el-descriptions-item label="工作流名称">{{ detailData.workflow_name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detailData.workflow_mode_name }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detailData.publish_status_name }}</el-descriptions-item>
        <el-descriptions-item label="创建者">{{ detailData.creator?.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ detailData.created_at_str }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{ detailData.updated_at_str }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ detailData.description || '-' }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="detailLoading" style="text-align: center; padding: 20px;">
        <el-icon class="is-loading"><Loading /></el-icon> 加载中...
      </div>
      <div v-if="inputParams.length > 0" class="input-params">
        <h4>输入参数</h4>
        <el-table :data="inputParams" border size="small">
          <el-table-column prop="name" label="字段名称" min-width="120" />
          <el-table-column prop="type" label="字段类型" width="120" align="center" />
          <el-table-column prop="required" label="是否必填" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                {{ row.required ? '必填' : '可选' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="说明" min-width="200" />
        </el-table>
      </div>
      <div v-else-if="inputSchema" class="input-schema">
        <h4>输入参数结构</h4>
        <pre>{{ inputSchema }}</pre>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { Refresh, Loading, DocumentCopy } from '@element-plus/icons-vue'
import api from '@/api'

export default {
  name: 'CozeWorkflows',
  components: { Refresh, Loading, DocumentCopy },
  setup() {
    const store = useStore()
    const loading = ref(false)
    const tableData = ref([])
    const error = ref('')
    const detailVisible = ref(false)
    const detailLoading = ref(false)
    const detailData = ref(null)
    const inputSchema = ref('')
    const inputParams = ref([])

    const searchForm = reactive({
      name: '',
      description: ''
    })

    const pagination = reactive({
      page: 1,
      pageSize: 10,
      total: 0
    })

    const loadData = async () => {
      loading.value = true
      error.value = ''
      
      try {
        const token = store.state.token
        const res = await api.getCozeWorkflows({
          pageNum: pagination.page,
          pageSize: pagination.pageSize,
          name: searchForm.name || undefined,
          description: searchForm.description || undefined,
          status: 'published'
        }, token)
        
        const result = res.result || res
        if (result.success) {
          tableData.value = result.data || []
          pagination.total = result.total || 0
          if (tableData.value.length === 0) {
            ElMessage.info('暂无已发布的工作流')
          }
        } else {
          error.value = result.error || '获取工作流列表失败'
          ElMessage.error(result.error || '获取工作流列表失败')
        }
      } catch (err) {
        console.error('获取工作流列表失败:', err)
        error.value = err.message || '获取工作流列表失败'
        ElMessage.error('获取工作流列表失败')
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      pagination.page = 1
      loadData()
    }

    const handleReset = () => {
      searchForm.name = ''
      searchForm.description = ''
      handleSearch()
    }

    const handleViewDetail = async (row) => {
      detailVisible.value = true
      detailLoading.value = true
      detailData.value = row
      inputSchema.value = ''
      inputParams.value = []
      
      try {
        const token = store.state.token
        const res = await api.getCozeWorkflowDetail(row.workflow_id, token)
        const result = res.result || res
        console.log('工作流详情响应:', JSON.stringify(result, null, 2))
        
        if (result.success && result.data) {
          const detail = result.data.detail
          
          if (detail) {
            // 获取 input 结构体
            let inputData = null
            if (detail.input) {
              inputData = detail.input
            } else if (detail.workflow_detail?.input) {
              inputData = detail.workflow_detail.input
            } else if (detail.workflow_detail?.input_schema) {
              inputData = detail.workflow_detail.input_schema
            }
            
            if (inputData) {
              // 解析 input 数据，转换为表格形式
              const params = []
              
              // 处理嵌套结构，如 { "OpenAPIWorkflowInput": { type, properties, required } }
              let schemaData = inputData
              if (inputData.OpenAPIWorkflowInput || inputData.openapi_workflow_input) {
                schemaData = inputData.OpenAPIWorkflowInput || inputData.openapi_workflow_input
              }
              
              // Coze API 返回的参数结构可能是 properties 或 parameters
              let properties = schemaData.properties || schemaData.parameters || {}
              const required = schemaData.required || []
              
              // 如果 inputData 直接包含 parameters，使用它
              if (!properties && inputData.parameters) {
                properties = inputData.parameters
              }
              
              for (const [name, config] of Object.entries(properties)) {
                params.push({
                  name,
                  type: config.type || 'string',
                  required: config.required !== undefined ? config.required : required.includes(name),
                  description: config.description || '-'
                })
              }
              
              if (params.length > 0) {
                inputParams.value = params
              } else {
                // 如果没有 properties，整体转为字符串显示
                inputSchema.value = JSON.stringify(inputData, null, 2)
              }
            } else {
              inputSchema.value = JSON.stringify(detail, null, 2)
            }
          } else {
            inputSchema.value = '暂无输入参数信息'
          }
        } else {
          inputSchema.value = '获取详情失败: ' + (result.error || '未知错误')
        }
      } catch (err) {
        console.error('获取工作流详情失败:', err)
        inputSchema.value = '获取详情失败: ' + err.message
      } finally {
        detailLoading.value = false
      }
    }

    const handleImgError = (e) => {
      e.target.style.display = 'none'
    }

    const handleCopyName = async (name) => {
      try {
        await navigator.clipboard.writeText(name)
        ElMessage.success('已复制工作流名称')
      } catch (err) {
        ElMessage.error('复制失败')
      }
    }

    onMounted(() => {
      loadData()
    })

    return {
      loading,
      tableData,
      error,
      detailVisible,
      detailLoading,
      detailData,
      inputSchema,
      inputParams,
      searchForm,
      pagination,
      loadData,
      handleSearch,
      handleReset,
      handleViewDetail,
      handleImgError,
      handleCopyName
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

.search-form {
  margin-bottom: 16px;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-btn {
  cursor: pointer;
  color: #409eff;
  font-size: 14px;
  transition: color 0.2s;
}

.copy-btn:hover {
  color: #66b1ff;
}

.desc-text {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #666;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.error-alert {
  margin-top: 16px;
}

.input-schema {
  margin-top: 16px;
}

.input-schema h4 {
  margin-bottom: 8px;
  color: #333;
}

.input-schema pre {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
}

.input-params {
  margin-top: 16px;
}

.input-params h4 {
  margin-bottom: 12px;
  color: #333;
}
</style>
