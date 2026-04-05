<template>
  <div class="user-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户ID">
          <el-input v-model="searchForm.userId" placeholder="输入用户ID" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="输入手机号" clearable />
        </el-form-item>
        <el-form-item label="用户类型">
          <el-select v-model="searchForm.userType" placeholder="全部" clearable>
            <el-option label="全部" value="" />
            <el-option label="个人" value="personal" />
            <el-option label="企业" value="enterprise" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 用户列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <span class="total">共 {{ total }} 人</span>
        </div>
      </template>
      
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="_id" label="用户ID" width="220" />
        <el-table-column prop="nickName" label="昵称" min-width="120">
          <template #default="{ row }">
            {{ row.nickName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="user_type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.user_type === 'enterprise' ? 'success' : 'default'" size="small">
              {{ row.user_type === 'enterprise' ? '企业' : '个人' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额" width="100">
          <template #default="{ row }">
            ¥ {{ ((row.balance || 0) / 100).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="total_generated" label="生成次数" width="90" />
        <el-table-column prop="created_at" label="注册时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="primary" link @click="handleEditBalance(row)">调整余额</el-button>
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
    
    <!-- 用户详情弹窗 -->
    <el-dialog v-model="detailVisible" title="用户详情" width="600px">
      <el-descriptions :column="2" border v-if="currentUser">
        <el-descriptions-item label="用户ID">{{ currentUser._id }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentUser.nickName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentUser.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="用户类型">
          <el-tag :type="currentUser.user_type === 'enterprise' ? 'success' : 'default'" size="small">
            {{ currentUser.user_type === 'enterprise' ? '企业' : '个人' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="余额">
          ¥ {{ ((currentUser.balance || 0) / 100).toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="生成次数">{{ currentUser.total_generated || 0 }}</el-descriptions-item>
        <el-descriptions-item label="注册时间" :span="2">
          {{ formatTime(currentUser.created_at) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    
    <!-- 调整余额弹窗 -->
    <el-dialog v-model="balanceVisible" title="调整余额" width="400px">
      <el-form :model="balanceForm" label-width="80px">
        <el-form-item label="当前余额">
          ¥ {{ ((balanceForm.currentBalance || 0) / 100).toFixed(2) }}
        </el-form-item>
        <el-form-item label="调整方式">
          <el-radio-group v-model="balanceForm.type">
            <el-radio label="add">增加</el-radio>
            <el-radio label="reduce">减少</el-radio>
            <el-radio label="set">设为</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="金额">
          <el-input-number 
            v-model="balanceForm.amount" 
            :min="0" 
            :precision="2"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="balanceVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateBalance" :loading="balanceLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import api from '@/api'

export default {
  name: 'UserManagement',
  setup() {
    const store = useStore()
    const loading = ref(false)
    const tableData = ref([])
    const total = ref(0)
    const searchForm = reactive({
      userId: '',
      phone: '',
      userType: ''
    })
    const pagination = reactive({
      page: 1,
      pageSize: 20
    })
    
    const detailVisible = ref(false)
    const currentUser = ref(null)
    
    const balanceVisible = ref(false)
    const balanceLoading = ref(false)
    const balanceForm = reactive({
      userId: '',
      currentBalance: 0,
      type: 'add',
      amount: 0
    })
    
    const loadData = async () => {
      loading.value = true
      try {
        const token = store.state.token
        const res = await api.getUsers({
          ...searchForm,
          page: pagination.page,
          pageSize: pagination.pageSize
        }, token)
        
        if (res.result && res.result.success) {
          tableData.value = res.result.data || []
          total.value = res.result.total || 0
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
      searchForm.userId = ''
      searchForm.phone = ''
      searchForm.userType = ''
      handleSearch()
    }
    
    const handleView = (row) => {
      currentUser.value = row
      detailVisible.value = true
    }
    
    const handleEditBalance = (row) => {
      balanceForm.userId = row._id
      balanceForm.currentBalance = row.balance || 0
      balanceForm.type = 'add'
      balanceForm.amount = 0
      balanceVisible.value = true
    }
    
    const handleUpdateBalance = async () => {
      balanceLoading.value = true
      try {
        const token = store.state.token
        let newBalance
        const amountCent = Math.round(balanceForm.amount * 100)
        
        if (balanceForm.type === 'set') {
          newBalance = amountCent
        } else if (balanceForm.type === 'add') {
          newBalance = balanceForm.currentBalance + amountCent
        } else {
          newBalance = Math.max(0, balanceForm.currentBalance - amountCent)
        }
        
        const res = await api.updateUserBalance(balanceForm.userId, newBalance, token)
        
        if (res.result && res.result.success) {
          ElMessage.success('余额更新成功')
          balanceVisible.value = false
          loadData()
        } else {
          ElMessage.error(res.result?.error || '更新失败')
        }
      } catch (err) {
        ElMessage.error('更新失败')
      } finally {
        balanceLoading.value = false
      }
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
      searchForm,
      pagination,
      detailVisible,
      currentUser,
      balanceVisible,
      balanceLoading,
      balanceForm,
      loadData,
      handleSearch,
      handleReset,
      handleView,
      handleEditBalance,
      handleUpdateBalance,
      formatTime
    }
  }
}
</script>

<style scoped>
.user-container {
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

.card-header .total {
  color: #999;
  font-size: 14px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
