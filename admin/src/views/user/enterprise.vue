<template>
  <div class="user-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="企业ID">
          <el-input v-model="searchForm.userId" placeholder="输入企业ID" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="输入手机号" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="企业名称">
          <el-input v-model="searchForm.enterpriseName" placeholder="输入企业名称" clearable @keyup.enter="handleSearch" />
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
          <span>企业用户列表</span>
          <span class="total">共 {{ total }} 家</span>
        </div>
      </template>
      
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column label="企业名称" min-width="140">
          <template #default="{ row }">
            {{ row.company_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="企业简称" width="120">
          <template #default="{ row }">
            {{ row.company_short_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="所属行业" min-width="150">
          <template #default="{ row }">
            <el-tooltip v-if="row.industries && row.industries.length > 0" :content="row.industries.join('、')" placement="top">
              <span>
                {{ row.industries.slice(0, 2).join('、') }}
                <span v-if="row.industries.length > 2" class="more-text">...</span>
              </span>
            </el-tooltip>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="管理员手机" width="130">
          <template #default="{ row }">
            <span>{{ row.phone || '-' }}</span>
            <el-tooltip v-if="row._id" :content="'企业ID: ' + row._id" placement="top" effect="light">
              <el-icon class="user-id-icon" :size="14"><InfoFilled /></el-icon>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="子账号" width="80" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.subAccountCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="materialCount" label="素材" width="70" align="center" />
        <el-table-column label="余额" width="100" align="right">
          <template #default="{ row }">
            ¥ {{ ((row.balance || 0) / 100).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="100">
          <template #default="{ row }">
            {{ formatTime(row.create_time).split(' ')[0] }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">详情</el-button>
            <el-button type="primary" link @click="handleEditEnterprise(row)">编辑</el-button>
            <el-button type="primary" link @click="handleEditBalance(row)">调余额</el-button>
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
    <el-dialog v-model="detailVisible" title="企业用户详情" width="900px">
      <el-descriptions :column="2" border v-if="currentUser">
        <el-descriptions-item label="企业ID">{{ currentUser._id }}</el-descriptions-item>
        <el-descriptions-item label="用户类型">
          <el-tag type="success" size="small">企业</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="企业名称">{{ currentUser.company_name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="企业简称">{{ currentUser.company_short_name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="所属行业" :span="2">
          <span v-if="currentUser.industries && currentUser.industries.length > 0">
            <el-tag v-for="ind in currentUser.industries" :key="ind" size="small" style="margin-right: 4px">{{ ind }}</el-tag>
          </span>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="管理员手机">{{ currentUser.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="管理员昵称">{{ currentUser.nickName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="素材数量">{{ currentUser.materialCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="素材大小">{{ formatSize(currentUser.materialSize) }}</el-descriptions-item>
        <el-descriptions-item label="子账号数量">{{ currentUser.subAccountCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="余额">
          ¥ {{ ((currentUser.balance || 0) / 100).toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="注册时间" :span="2">
          {{ formatTime(currentUser.create_time) }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 子账号列表 -->
      <div class="sub-accounts-section" v-if="currentUser">
        <h4 class="sub-title">
          子账号列表 ({{ subAccounts.length }}个)
          <el-button type="primary" size="small" @click="handleAddSubAccount" style="margin-left: 12px">
            添加子账号
          </el-button>
        </h4>
        <el-table v-if="subAccounts.length > 0" :data="subAccounts" size="small" border max-height="300">
          <el-table-column prop="phone" label="手机号" width="130" />
          <el-table-column prop="remark" label="备注名称" min-width="150">
            <template #default="{ row }">
              <span :class="{ 'empty-text': !row.remark }">{{ row.remark || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'warning'" size="small">
                {{ row.status === 'active' ? '已激活' : '待激活' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="余额" width="100" align="right">
            <template #default="{ row }">
              <span class="balance-text">¥ {{ ((row.balance || 0) / 100).toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="用户昵称" width="100">
            <template #default="{ row }">
              <span :class="{ 'empty-text': !row.nickname }">{{ row.nickname || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEditSubAccount(row)">编辑</el-button>
              <el-button type="danger" link size="small" @click="handleDeleteSubAccount(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无子账号" :image-size="60" />
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 编辑企业弹窗 -->
    <el-dialog v-model="enterpriseEditVisible" title="编辑企业" width="600px">
      <el-form :model="enterpriseForm" label-width="100px" v-if="enterpriseForm">
        <el-form-item label="企业ID">
          <el-input v-model="enterpriseForm._id" disabled />
        </el-form-item>
        <el-form-item label="企业名称" required>
          <el-input v-model="enterpriseForm.company_name" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item label="企业简称" required>
          <el-input v-model="enterpriseForm.company_short_name" placeholder="请输入企业简称" />
        </el-form-item>
        <el-form-item label="所属行业" required>
          <el-select v-model="enterpriseForm.industries" multiple placeholder="请选择行业（可多选）" style="width: 100%">
            <el-option
              v-for="item in industryOptions"
              :key="item._id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="enterpriseEditVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEnterprise" :loading="enterpriseLoading">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 添加/编辑子账号弹窗 -->
    <el-dialog v-model="subAccountVisible" :title="subAccountForm._id ? '编辑子账号' : '添加子账号'" width="500px">
      <el-form :model="subAccountForm" label-width="100px">
        <el-form-item label="手机号" required>
          <el-input v-model="subAccountForm.phone" placeholder="请输入子账号手机号" :disabled="!!subAccountForm._id" />
        </el-form-item>
        <el-form-item label="备注名称">
          <el-input v-model="subAccountForm.remark" placeholder="请输入备注名称，如：市场部-小李" />
        </el-form-item>
        <el-form-item label="分配余额">
          <el-input-number
            v-model="subAccountForm.balance"
            :min="0"
            :precision="2"
            controls-position="right"
            style="width: 100%"
            placeholder="请输入分配余额"
          />
          <div class="form-tip">单位：元</div>
        </el-form-item>
        <el-form-item label="当前状态" v-if="subAccountForm._id">
          <el-tag :type="subAccountForm.status === 'active' ? 'success' : 'warning'">
            {{ subAccountForm.status === 'active' ? '已激活' : '待激活' }}
          </el-tag>
          <span v-if="subAccountForm.status === 'pending'" class="form-tip" style="margin-left: 8px">
            （该手机号尚未注册小程序）
          </span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="subAccountVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveSubAccount" :loading="subAccountLoading">保存</el-button>
      </template>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import api from '@/api'

export default {
  name: 'EnterpriseUsers',
  components: { InfoFilled },
  setup() {
    const store = useStore()
    const loading = ref(false)
    const tableData = ref([])
    const total = ref(0)
    const searchForm = reactive({
      userId: '',
      phone: '',
      enterpriseName: ''
    })
    const pagination = reactive({
      page: 1,
      pageSize: 20
    })
    
    const detailVisible = ref(false)
    const currentUser = ref(null)
    const subAccounts = ref([])
    
    // 编辑企业
    const enterpriseEditVisible = ref(false)
    const enterpriseLoading = ref(false)
    const enterpriseForm = ref(null)
    const industryOptions = ref([])
    
    // 子账号
    const subAccountVisible = ref(false)
    const subAccountLoading = ref(false)
    const subAccountForm = reactive({
      _id: '',
      enterprise_id: '',
      phone: '',
      remark: '',
      balance: 0,
      status: 'pending'
    })
    
    // 调整余额
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
          userId: searchForm.userId,
          phone: searchForm.phone,
          userType: 'enterprise',
          enterpriseName: searchForm.enterpriseName,
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
      searchForm.enterpriseName = ''
      handleSearch()
    }
    
    const loadSubAccounts = async (enterpriseId) => {
      try {
        const token = store.state.token
        const res = await api.getEnterpriseSubAccounts(enterpriseId, token)
        if (res.result && res.result.success) {
          subAccounts.value = res.result.data || []
        }
      } catch (err) {
        console.error('加载子账号失败', err)
      }
    }
    
    const handleView = async (row) => {
      currentUser.value = row
      subAccounts.value = []
      detailVisible.value = true
      
      // 加载子账号列表
      if (row._id) {
        await loadSubAccounts(row._id)
      }
    }
    
    // 编辑企业
    const handleEditEnterprise = async (row) => {
      // 加载行业列表
      if (industryOptions.value.length === 0) {
        const token = store.state.token
        const res = await api.getIndustries(token)
        if (res.result && res.result.success) {
          industryOptions.value = res.result.list || []
        }
      }
      
      enterpriseForm.value = {
        _id: row._id,
        company_name: row.company_name || '',
        company_short_name: row.company_short_name || '',
        industries: row.industries || []
      }
      enterpriseEditVisible.value = true
    }
    
    const handleSaveEnterprise = async () => {
      if (!enterpriseForm.value.company_name) {
        ElMessage.warning('请输入企业名称')
        return
      }
      if (!enterpriseForm.value.company_short_name) {
        ElMessage.warning('请输入企业简称')
        return
      }
      if (!enterpriseForm.value.industries || enterpriseForm.value.industries.length === 0) {
        ElMessage.warning('请选择至少一个行业')
        return
      }
      
      enterpriseLoading.value = true
      try {
        const token = store.state.token
        const res = await api.updateEnterprise({
          id: enterpriseForm.value._id,
          company_name: enterpriseForm.value.company_name,
          company_short_name: enterpriseForm.value.company_short_name,
          industries: enterpriseForm.value.industries
        }, token)
        
        if (res.result && res.result.success) {
          ElMessage.success('企业信息更新成功')
          enterpriseEditVisible.value = false
          loadData()
          
          // 如果详情弹窗打开，更新详情数据
          if (currentUser.value && currentUser.value._id === enterpriseForm.value._id) {
            currentUser.value = {
              ...currentUser.value,
              company_name: enterpriseForm.value.company_name,
              company_short_name: enterpriseForm.value.company_short_name,
              industries: enterpriseForm.value.industries
            }
          }
        } else {
          ElMessage.error(res.result?.error || '更新失败')
        }
      } catch (err) {
        ElMessage.error('更新失败')
      } finally {
        enterpriseLoading.value = false
      }
    }
    
    // 子账号管理
    const handleAddSubAccount = () => {
      subAccountForm._id = ''
      subAccountForm.enterprise_id = currentUser.value._id
      subAccountForm.phone = ''
      subAccountForm.remark = ''
      subAccountForm.balance = 0
      subAccountForm.status = 'pending'
      subAccountVisible.value = true
    }
    
    const handleEditSubAccount = (row) => {
      subAccountForm._id = row._id
      subAccountForm.enterprise_id = row.enterprise_id
      subAccountForm.phone = row.phone
      subAccountForm.remark = row.remark || ''
      subAccountForm.balance = (row.balance || 0) / 100
      subAccountForm.status = row.status || 'pending'
      subAccountVisible.value = true
    }
    
    const handleSaveSubAccount = async () => {
      if (!subAccountForm.phone) {
        ElMessage.warning('请输入手机号')
        return
      }
      if (!/^1\d{10}$/.test(subAccountForm.phone)) {
        ElMessage.warning('手机号必须是11位数字，以1开头')
        return
      }
      
      console.log('添加子账号, enterprise_id:', subAccountForm.enterprise_id, 'currentUser._id:', currentUser.value?._id)
      
      subAccountLoading.value = true
      try {
        const token = store.state.token
        
        let res
        if (subAccountForm._id) {
          // 更新
          res = await api.updateSubAccount({
            id: subAccountForm._id,
            remark: subAccountForm.remark,
            balance: Math.round(subAccountForm.balance * 100)
          }, token)
        } else {
          // 添加
          res = await api.addSubAccount({
            enterprise_id: subAccountForm.enterprise_id,
            phone: subAccountForm.phone,
            remark: subAccountForm.remark,
            balance: Math.round(subAccountForm.balance * 100)
          }, token)
        }
        
        if (res.result && res.result.success) {
          ElMessage.success(subAccountForm._id ? '子账号更新成功' : '子账号添加成功')
          subAccountVisible.value = false
          await loadSubAccounts(currentUser.value._id)
        } else {
          ElMessage.error(res.result?.error || '操作失败')
        }
      } catch (err) {
        ElMessage.error('操作失败')
      } finally {
        subAccountLoading.value = false
      }
    }
    
    const handleDeleteSubAccount = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除子账号 ${row.phone} 吗？`,
          '删除确认',
          { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
        )
        
        const token = store.state.token
        const res = await api.deleteSubAccount(row._id, token)
        
        if (res.result && res.result.success) {
          ElMessage.success('删除成功')
          await loadSubAccounts(currentUser.value._id)
        } else {
          ElMessage.error(res.result?.error || '删除失败')
        }
      } catch (err) {
        if (err !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
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
        
        const res = await api.updateEnterprise({
          id: balanceForm.userId,
          balance: newBalance
        }, token)
        
        if (res.result && res.result.success) {
          ElMessage.success('余额更新成功')
          balanceVisible.value = false
          loadData()
          
          // 如果详情弹窗打开，更新详情数据
          if (currentUser.value && currentUser.value._id === balanceForm.userId) {
            currentUser.value.balance = newBalance
          }
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
    
    const formatSize = (bytes) => {
      if (!bytes || bytes === 0) return '0'
      const mb = bytes / (1024 * 1024)
      return mb.toFixed(2)
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
      subAccounts,
      enterpriseEditVisible,
      enterpriseLoading,
      enterpriseForm,
      industryOptions,
      subAccountVisible,
      subAccountLoading,
      subAccountForm,
      balanceVisible,
      balanceLoading,
      balanceForm,
      loadData,
      handleSearch,
      handleReset,
      handleView,
      handleEditEnterprise,
      handleSaveEnterprise,
      handleAddSubAccount,
      handleEditSubAccount,
      handleSaveSubAccount,
      handleDeleteSubAccount,
      handleEditBalance,
      handleUpdateBalance,
      formatTime,
      formatSize
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

.user-id-icon {
  margin-left: 4px;
  color: #409eff;
  cursor: pointer;
  vertical-align: middle;
}

.sub-accounts-section {
  margin-top: 20px;
}

.sub-title {
  margin-bottom: 12px;
  font-size: 14px;
  color: #303133;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.empty-text {
  color: #c0c4cc;
}

.balance-text {
  color: #67c23a;
  font-weight: 500;
}

.form-tip {
  color: #909399;
  font-size: 12px;
  line-height: 1.4;
  margin-top: 4px;
}

.more-text {
  color: #909399;
}
</style>
