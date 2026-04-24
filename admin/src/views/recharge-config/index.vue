<template>
  <div class="recharge-config-container">
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>充值金额配置</span>
          <el-button type="primary" @click="handleAdd">添加金额</el-button>
        </div>
      </template>
      
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="amount" label="充值金额(元)" width="150">
          <template #default="{ row }">
            ¥{{ row.amount }}
          </template>
        </el-table-column>
        <el-table-column prop="bonus" label="赠送余额(元)" width="150">
          <template #default="{ row }">
            <span class="bonus-text">+{{ row.bonus }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
              {{ row.enabled ? '开启' : '关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button 
              :type="row.enabled ? 'warning' : 'success'" 
              size="small" 
              @click="handleToggle(row)"
            >
              {{ row.enabled ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑充值金额' : '添加充值金额'" 
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="充值金额" prop="amount">
          <el-input-number 
            v-model="form.amount" 
            :min="1" 
            :max="99999"
            :precision="0"
            placeholder="请输入充值金额"
            style="width: 100%"
          />
          <span class="form-tip">单位：元，只填数字，如：50、100、200</span>
        </el-form-item>
        <el-form-item label="赠送余额" prop="bonus">
          <el-input-number 
            v-model="form.bonus" 
            :min="0" 
            :max="99999"
            :precision="0"
            placeholder="请输入赠送金额"
            style="width: 100%"
          />
          <span class="form-tip">充{{ form.amount || 0 }}元，额外赠送的余额（单位：元）</span>
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-switch v-model="form.enabled" />
          <span class="form-tip">{{ form.enabled ? '开启后用户可在小程序中看到并选择此金额' : '关闭后用户看不到此金额' }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api } from '@/api'
import store from '@/store'

const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const form = ref({
  id: '',
  amount: 50,
  bonus: 0,
  enabled: true
})

const rules = {
  amount: [{ required: true, message: '请输入充值金额', trigger: 'blur' }],
  bonus: [{ required: true, message: '请输入赠送余额', trigger: 'blur' }]
}

const token = () => store.state.token || localStorage.getItem('admin_token')

// 格式化时间
const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

// 获取列表
const fetchList = async () => {
  loading.value = true
  try {
    const res = await api.getRechargeConfigs(token())
    if (res.result.success) {
      tableData.value = res.result.list || []
    } else {
      ElMessage.error(res.result.error || '获取列表失败')
    }
  } catch (err) {
    ElMessage.error(err.message || '获取列表失败')
  } finally {
    loading.value = false
  }
}

// 添加
const handleAdd = () => {
  isEdit.value = false
  form.value = {
    id: '',
    amount: 50,
    bonus: 0,
    enabled: true
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  form.value = {
    id: row._id,
    amount: row.amount,
    bonus: row.bonus,
    enabled: row.enabled
  }
  dialogVisible.value = true
}

// 提交
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  submitting.value = true
  try {
    const data = {
      amount: form.value.amount,
      bonus: form.value.bonus,
      enabled: form.value.enabled
    }
    
    let res
    if (isEdit.value) {
      data.id = form.value.id
      res = await api.updateRechargeConfig(data, token())
    } else {
      res = await api.addRechargeConfig(data, token())
    }
    
    if (res.result.success) {
      ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
      dialogVisible.value = false
      fetchList()
    } else {
      ElMessage.error(res.result.error || '操作失败')
    }
  } catch (err) {
    ElMessage.error(err.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

// 切换状态
const handleToggle = async (row) => {
  const action = row.enabled ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}此充值金额吗？`, '提示', {
      type: 'warning'
    })
    
    const res = await api.toggleRechargeConfig(row._id, !row.enabled, token())
    if (res.result.success) {
      ElMessage.success(`${action}成功`)
      fetchList()
    } else {
      ElMessage.error(res.result.error || `${action}失败`)
    }
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(err.message || `${action}失败`)
    }
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除此充值金额吗？此操作不可恢复。', '警告', {
      type: 'warning'
    })
    
    const res = await api.deleteRechargeConfig(row._id, token())
    if (res.result.success) {
      ElMessage.success('删除成功')
      fetchList()
    } else {
      ElMessage.error(res.result.error || '删除失败')
    }
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(err.message || '删除失败')
    }
  }
}

// 初始化集合
const initCollections = async () => {
  try {
    await api.initCollections(token())
  } catch (err) {
    console.log('初始化集合:', err)
  }
}

onMounted(async () => {
  await initCollections()
  fetchList()
})
</script>

<style scoped>
.recharge-config-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bonus-text {
  color: #67c23a;
  font-weight: bold;
}

.form-tip {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}
</style>
