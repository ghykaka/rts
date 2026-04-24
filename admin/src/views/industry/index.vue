<template>
  <div class="industry-container">
    <div class="search-bar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon> 新增行业
      </el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe border>
      <el-table-column prop="name" label="行业名称" />
      <el-table-column prop="order" label="排序" width="80" align="center" />
      <el-table-column prop="status" label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
            {{ row.status === 'enabled' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="行业名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入行业名称" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.order" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="enabled">启用</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import api from '@/api'
import store from '@/store'

const token = () => store.state.token

const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitting = ref(false)
const formRef = ref(null)
const editingId = ref('')

const form = reactive({
  name: '',
  order: 0,
  status: 'enabled'
})

const formRules = {
  name: [{ required: true, message: '请输入行业名称', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await api.getIndustries(token())
    const result = res.result || res
    if (result.success) {
      tableData.value = result.list || []
    } else {
      ElMessage.error(result.error || '加载失败')
    }
  } catch (err) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  editingId.value = ''
  Object.assign(form, { name: '', order: 0, status: 'enabled' })
  dialogTitle.value = '新增行业'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  editingId.value = row._id
  Object.assign(form, {
    name: row.name,
    order: row.order || 0,
    status: row.status
  })
  dialogTitle.value = '编辑行业'
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除行业"${row.name}"吗？`, '提示', { type: 'warning' })
    const res = await api.deleteIndustry(row._id, token())
    const result = res.result || res
    if (result.success) {
      ElMessage.success('删除成功')
      loadData()
    } else {
      ElMessage.error(result.error || '删除失败')
    }
  } catch (err) {
    if (err !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
  } catch (err) {
    return
  }
  submitting.value = true
  try {
    let res
    if (editingId.value) {
      res = await api.updateIndustry({ id: editingId.value, ...form }, token())
    } else {
      res = await api.addIndustry(form, token())
    }
    const result = res.result || res
    if (result.success) {
      ElMessage.success(editingId.value ? '更新成功' : '添加成功')
      dialogVisible.value = false
      loadData()
    } else {
      ElMessage.error(result.error || '操作失败')
    }
  } finally {
    submitting.value = false
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.industry-container { padding: 20px; }
.search-bar { margin-bottom: 16px; }
</style>
