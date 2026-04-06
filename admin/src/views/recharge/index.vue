<template>
  <div class="recharge-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户手机">
          <el-input v-model="searchForm.phone" placeholder="输入手机号" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="支付订单号">
          <el-input v-model="searchForm.outTradeNo" placeholder="输入订单号" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="微信订单号">
          <el-input v-model="searchForm.transactionId" placeholder="输入微信订单号" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 充值记录列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <el-radio-group v-model="currentTab" @change="handleTabChange">
            <el-radio-button label="success">支付成功</el-radio-button>
            <el-radio-button label="pending">待支付</el-radio-button>
            <el-radio-button label="">全部</el-radio-button>
          </el-radio-group>
          <div class="stats">
            <span>总充值: ¥{{ (totalAmount / 100).toFixed(2) }}</span>
            <span class="divider">|</span>
            <span>成功笔数: {{ successCount }}</span>
          </div>
        </div>
      </template>
      
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="out_trade_no" label="支付订单号" width="180" />
        <el-table-column label="用户手机" width="140">
          <template #default="{ row }">
            <span>{{ row.user_phone || '-' }}</span>
            <el-tooltip v-if="row.user_id" :content="'用户ID: ' + row.user_id" placement="top" effect="light">
              <el-icon class="user-id-icon" :size="14"><InfoFilled /></el-icon>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="用户" min-width="150">
          <template #default="{ row }">
            <el-tag :type="row.user_type === 'enterprise' ? 'success' : 'default'" size="small">
              {{ row.user_type === 'enterprise' ? '企业' : '个人' }}
            </el-tag>
            <span class="user-name">
              {{ row.user_type === 'enterprise' ? (row.user_companyName || '-') : (row.user_nickName || '-') }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="充值账户" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'enterprise' ? 'warning' : 'info'" size="small">
              {{ row.type === 'enterprise' ? '企业' : '个人' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount_cent" label="充值金额" width="100">
          <template #default="{ row }">
            ¥ {{ ((row.amount_cent || 0) / 100).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payment_method" label="支付方式" width="90">
          <template #default="{ row }">
            {{ row.payment_method === 'wechat_pay' ? '微信支付' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="wechat_transaction_id" label="微信订单号" min-width="180">
          <template #default="{ row }">
            <span :class="{ 'transaction-id': row.wechat_transaction_id }">{{ row.wechat_transaction_id || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="paid_at" label="支付时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.paid_at) }}
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import api from '@/api'

export default {
  name: 'RechargeRecord',
  components: { InfoFilled },
  setup() {
    const store = useStore()
    const loading = ref(false)
    const tableData = ref([])
    const total = ref(0)
    const totalAmount = ref(0)
    const successCount = ref(0)
    const currentTab = ref('success')
    
    const searchForm = reactive({
      phone: '',
      outTradeNo: '',
      transactionId: '',
      dateRange: []
    })
    
    const pagination = reactive({
      page: 1,
      pageSize: 20
    })
    
    const loadData = async () => {
      loading.value = true
      try {
        const token = store.state.token
        const params = {
          page: pagination.page,
          pageSize: pagination.pageSize,
          status: currentTab.value,
          phone: searchForm.phone || undefined,
          outTradeNo: searchForm.outTradeNo || undefined,
          transactionId: searchForm.transactionId || undefined
        }
        
        // 处理日期范围
        if (searchForm.dateRange && searchForm.dateRange.length === 2) {
          params.startDate = searchForm.dateRange[0]
          params.endDate = searchForm.dateRange[1]
        }
        
        const res = await api.getRecharges(params, token)
        
        if (res.result && res.result.success) {
          tableData.value = res.result.data || []
          total.value = res.result.total || 0
          totalAmount.value = res.result.totalAmount || 0
          successCount.value = res.result.successCount || 0
        }
      } catch (err) {
        console.error(err)
        ElMessage.error('加载数据失败')
      } finally {
        loading.value = false
      }
    }
    
    const handleSearch = () => {
      pagination.page = 1
      loadData()
    }
    
    const handleReset = () => {
      searchForm.phone = ''
      searchForm.outTradeNo = ''
      searchForm.transactionId = ''
      searchForm.dateRange = []
      currentTab.value = 'success'
      handleSearch()
    }
    
    const handleTabChange = () => {
      pagination.page = 1
      loadData()
    }
    
    const getStatusType = (status) => {
      const types = {
        pending: 'warning',
        success: 'success',
        failed: 'danger'
      }
      return types[status] || 'info'
    }
    
    const getStatusText = (status) => {
      const texts = {
        pending: '待支付',
        success: '成功',
        failed: '失败'
      }
      return texts[status] || status
    }
    
    const formatTime = (timestamp) => {
      if (!timestamp) return '-'
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleString('zh-CN')
    }
    
    onMounted(() => {
      loadData()
    })
    
    return {
      loading,
      tableData,
      total,
      totalAmount,
      successCount,
      currentTab,
      searchForm,
      pagination,
      loadData,
      handleSearch,
      handleReset,
      handleTabChange,
      getStatusType,
      getStatusText,
      formatTime
    }
  }
}
</script>

<style scoped>
.recharge-container {
  height: 100%;
}

.search-card {
  margin-bottom: 16px;
}

.table-card {
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats {
  color: #666;
  font-size: 14px;
}

.stats .divider {
  margin: 0 10px;
  color: #ddd;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.user-id-icon {
  margin-left: 4px;
  color: #909399;
  cursor: pointer;
  vertical-align: middle;
}

.user-name {
  margin-left: 8px;
}

.transaction-id {
  font-family: monospace;
  font-size: 12px;
}
</style>
