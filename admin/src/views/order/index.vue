<template>
  <div class="order-container">
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
        </div>
      </template>
      
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="处理中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="失败" value="failed" />
            <el-option label="待处理" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户手机">
          <el-input v-model="searchForm.userId" placeholder="用户ID" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column label="订单号" width="180">
          <template #default="{ row }">
            <el-link type="primary" @click="handleViewDetail(row._id)">
              {{ row._id.slice(-12).toUpperCase() }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="用户" min-width="140">
          <template #default="{ row }">
            <div>{{ row.userNickname || '-' }}</div>
            <div class="text-secondary">{{ row.userPhone || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="功能名称" min-width="140">
          <template #default="{ row }">
            {{ row.functionName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="模板" min-width="100">
          <template #default="{ row }">
            {{ row.templateName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="80" align="right">
          <template #default="{ row }">
            <span class="price">¥{{ row.costAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="支付方式" width="80" align="center">
          <template #default="{ row }">
            {{ row.costType === 'balance' ? '余额' : '微信' }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ row.createdAt }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewDetail(row._id)">详情</el-button>
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
    </el-card>

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="900px" @closed="currentDetail = null">
      <div v-if="currentDetail" class="order-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h4>订单信息</h4>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="订单号">
              <span class="order-id">{{ currentDetail.order._id.slice(-12).toUpperCase() }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(currentDetail.order.status)" size="small">
                {{ getStatusText(currentDetail.order.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ currentDetail.order.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="完成时间">{{ currentDetail.order.completedAt || '-' }}</el-descriptions-item>
            <el-descriptions-item label="支付金额">
              <span class="price">¥{{ currentDetail.order.costAmount.toFixed(2) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="支付方式">
              {{ currentDetail.order.costType === 'balance' ? '余额' : '微信支付' }}
            </el-descriptions-item>
            <el-descriptions-item label="支付单号" v-if="currentDetail.order.wxOutTradeNo" :span="2">
              {{ currentDetail.order.wxOutTradeNo }}
            </el-descriptions-item>
            <el-descriptions-item label="错误信息" v-if="currentDetail.order.errorMsg" :span="2">
              <span class="text-danger">{{ currentDetail.order.errorMsg }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 用户信息 -->
        <div class="detail-section" v-if="currentDetail.user">
          <h4>用户信息</h4>
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="用户ID">{{ currentDetail.user._id }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ currentDetail.user.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{ currentDetail.user.nickname || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 工作流信息 -->
        <div class="detail-section" v-if="currentDetail.workflow.workflowProductName || currentDetail.workflow.cozeWorkflowId">
          <h4>工作流信息</h4>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="产品名称">{{ currentDetail.workflow.workflowProductName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="COZE状态">{{ currentDetail.workflow.cozeStatus || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 用户输入参数（已过滤系统字段） -->
        <div class="detail-section" v-if="hasRawInputParams">
          <h4>用户输入</h4>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item v-for="(value, key) in filteredRawInputParams" :key="key" :label="key">
              <template v-if="isImageUrl(value)">
                <el-image :src="value" :preview-src-list="[value]" style="width: 60px; height: 60px" fit="cover" />
              </template>
              <template v-else>{{ value }}</template>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 生成结果 -->
        <div class="detail-section" v-if="hasOutputResult">
          <h4>生成结果</h4>
          <div class="output-list">
            <div v-for="(value, key) in currentDetail.outputResult" :key="key" class="output-item">
              <span class="output-key">{{ key }}</span>
              <template v-if="isImageUrl(value)">
                <a :href="value" target="_blank">
                  <img :src="value" class="output-image" />
                </a>
              </template>
              <template v-else>
                <span class="output-value">{{ value }}</span>
              </template>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button v-if="currentDetail?.order.status === 'failed'" type="warning" @click="handleRetry">
          重试工作流
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import api from '@/api'

export default {
  name: 'AdminOrder',
  setup() {
    const store = useStore()
    const loading = ref(false)
    const tableData = ref([])
    const detailVisible = ref(false)
    const currentDetail = ref(null)

    const searchForm = reactive({
      status: '',
      userId: ''
    })

    const pagination = reactive({
      page: 1,
      pageSize: 20,
      total: 0
    })

    const loadData = async () => {
      loading.value = true
      
      try {
        const token = store.state.token
        const res = await api.getAdminOrders({
          page: pagination.page,
          pageSize: pagination.pageSize,
          status: searchForm.status || undefined,
          userId: searchForm.userId || undefined
        }, token)
        
        const result = res.result || res
        if (result.success) {
          tableData.value = result.data || []
          pagination.total = result.total || 0
        } else {
          ElMessage.error(result.error || '获取列表失败')
        }
      } catch (err) {
        console.error('获取列表失败:', err)
        ElMessage.error('获取列表失败')
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      pagination.page = 1
      loadData()
    }

    const handleReset = () => {
      searchForm.status = ''
      searchForm.userId = ''
      handleSearch()
    }

    const handleViewDetail = async (orderId) => {
      detailVisible.value = true
      currentDetail.value = null
      
      try {
        const token = store.state.token
        const res = await api.getAdminOrderDetail(orderId, token)
        const result = res.result || res
        
        if (result.success) {
          currentDetail.value = result.data
        } else {
          ElMessage.error(result.error || '获取详情失败')
        }
      } catch (err) {
        console.error('获取详情失败:', err)
        ElMessage.error('获取详情失败')
      }
    }

    const handleRetry = async () => {
      if (!currentDetail.value) return
      
      try {
        const token = store.state.token
        const res = await api.retryOrderWorkflow(currentDetail.value.order._id, token)
        const result = res.result || res
        
        if (result.success) {
          ElMessage.success(result.message || '已重试')
          detailVisible.value = false
          loadData()
        } else {
          ElMessage.error(result.error || '重试失败')
        }
      } catch (err) {
        ElMessage.error('重试失败')
      }
    }

    const getStatusType = (status) => {
      const map = {
        'pending': 'info',
        'processing': 'warning',
        'completed': 'success',
        'failed': 'danger'
      }
      return map[status] || 'info'
    }

    const getStatusText = (status) => {
      const map = {
        'pending': '待处理',
        'processing': '处理中',
        'completed': '已完成',
        'failed': '失败'
      }
      return map[status] || status
    }

    const isImageUrl = (value) => {
      if (!value || typeof value !== 'string') return false
      // 微信云存储图片
      if (value.startsWith('cloud://')) return true
      // 带文件扩展名的 URL
      if (/\.(jpg|jpeg|png|gif|webp|bmp)\?*/i.test(value)) return true
      // HTTP/HTTPS 图片 URL
      if (value.startsWith('http://') || value.startsWith('https://')) {
        const lower = value.toLowerCase()
        // 常见的图片关键词或扩展名
        if (lower.includes('image') || lower.includes('img') || 
            lower.includes('.jpg') || lower.includes('.jpeg') || 
            lower.includes('.png') || lower.includes('.gif') ||
            lower.includes('.webp') || lower.includes('.bmp') ||
            lower.includes('/pic/') || lower.includes('/image/') ||
            lower.includes('cos.')) {
          return true
        }
      }
      return false
    }

    const isLongText = (value) => {
      return typeof value === 'string' && value.length > 100
    }

    const truncate = (str, len) => {
      return str.length > len ? str.slice(0, len) + '...' : str
    }

    // 系统字段黑名单（不显示在后台）
    const systemFields = new Set([
      'size_category', 'size_name', 'size_value', 'size_id', 'size',
      'template_id', 'template_name', 'template_cover', 'template',
      'material_id', 'material_name', 'material_url', 'material',
      'workflow_product_id', 'coze_workflow_id', 'function_id',
      'category', 'name', 'value', 'url', 'cover', 'image', 'id',
      'user_id', 'created_at', 'updated_at', 'status', 'order_id'
    ])

    // 过滤后的用户输入参数（移除系统字段）
    const filteredRawInputParams = computed(() => {
      if (!currentDetail.value?.rawInputParams) return {}
      const params = {}
      for (const [key, value] of Object.entries(currentDetail.value.rawInputParams)) {
        if (systemFields.has(key.toLowerCase()) || systemFields.has(key)) continue
        if (value === undefined || value === null || value === '') continue
        if (typeof value === 'object') continue
        params[key] = value
      }
      return params
    })

    const hasRawInputParams = computed(() => {
      return Object.keys(filteredRawInputParams.value).length > 0
    })

    const hasOutputResult = computed(() => {
      if (!currentDetail.value?.outputResult) return false
      return Object.keys(currentDetail.value.outputResult).length > 0
    })

    onMounted(() => {
      loadData()
    })

    return {
      loading,
      tableData,
      searchForm,
      pagination,
      detailVisible,
      currentDetail,
      filteredRawInputParams,
      hasRawInputParams,
      hasOutputResult,
      loadData,
      handleSearch,
      handleReset,
      handleViewDetail,
      handleRetry,
      getStatusType,
      getStatusText,
      isImageUrl,
      isLongText,
      truncate
    }
  }
}
</script>

<style scoped>
.order-container {
  height: 100%;
}

.table-card {
  height: 100%;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
}

.search-form {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.text-secondary {
  font-size: 12px;
  color: #909399;
}

.price {
  color: #E6A23C;
  font-weight: 500;
}

.text-danger {
  color: #F56C6C;
}

.order-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h4 {
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
  color: #409EFF;
}

.output-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.output-item {
  background: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
  max-width: 300px;
}

.output-key {
  font-weight: 600;
  color: #606266;
  display: block;
  margin-bottom: 4px;
}

.output-value {
  word-break: break-all;
}

.output-image {
  width: 150px;
  height: 150px;
  object-fit: contain;
  border-radius: 4px;
  cursor: pointer;
}

.order-id {
  font-family: monospace;
  color: #409EFF;
}
</style>
