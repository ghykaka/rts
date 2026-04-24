<template>
  <div class="category-container">
    <div class="search-bar">
      <el-button type="primary" @click="handleAdd(null)">
        <el-icon><Plus /></el-icon> 新增一级分类
      </el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe border>
      <el-table-column prop="name" label="分类名称" min-width="200">
        <template #default="{ row }">
          <span v-if="row.level === 1" class="level-1-name">{{ row.name }}</span>
          <span v-else class="level-2-name">└ {{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="order" label="排序" width="80" align="center">
        <template #default="{ row }">
          {{ row.displayOrder || row.order }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
            {{ row.status === 'enabled' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleAddChild(row)" v-if="row.level === 1">添加子分类</el-button>
          <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="上级分类" v-if="form.level === 2">
          <el-select v-model="form.parentId" placeholder="请选择上级分类" clearable>
            <el-option v-for="item in parentOptions" :key="item._id" :label="item.name" :value="item._id" />
          </el-select>
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
const parentOptions = ref([])

const form = reactive({
  name: '',
  parentId: '',
  level: 1,
  order: 0,
  status: 'enabled'
})

const formRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await api.getCategories(token())
    const result = res.result || res
    if (result.success) {
      const list = result.list || []
      
      // 获取一级分类，按 order 排序
      const level1List = list
        .filter(item => item.level === 1)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
      
      // 构建树形结构：一级分类 + 其二级分类
      const treeData = []
      level1List.forEach((level1, index) => {
        // 添加一级分类，显示的排序号是 (1), (2), (3)...
        treeData.push({
          ...level1,
          displayOrder: index + 1
        })
        
        // 获取该一级分类的二级分类，按 order 排序
        const level2List = list
          .filter(item => item.level === 2 && item.parentId === level1._id)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
        
        level2List.forEach((level2, idx) => {
          treeData.push({
            ...level2,
            displayOrder: idx + 1
          })
        })
      })
      
      tableData.value = treeData
      parentOptions.value = level1List
    } else {
      ElMessage.error(result.error || '加载失败')
    }
  } catch (err) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = (parent) => {
  editingId.value = ''
  Object.assign(form, { name: '', parentId: '', level: parent ? 2 : 1, order: 0, status: 'enabled' })
  if (parent) form.parentId = parent._id
  dialogTitle.value = parent ? '新增子分类' : '新增一级分类'
  dialogVisible.value = true
}

const handleAddChild = (row) => handleAdd(row)

const handleEdit = (row) => {
  editingId.value = row._id
  Object.assign(form, {
    name: row.name,
    parentId: row.parentId || '',
    level: row.level,
    order: row.order || 0,
    status: row.status
  })
  dialogTitle.value = '编辑分类'
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除分类"${row.name}"吗？`, '提示', { type: 'warning' })
    const res = await api.deleteCategory(row._id, token())
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
      res = await api.updateCategory({ id: editingId.value, ...form }, token())
    } else {
      res = await api.addCategory(form, token())
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

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.category-container { padding: 20px; }
.search-bar { margin-bottom: 16px; }
.level-1-name {
  font-weight: bold;
  color: #303133;
}
.level-2-name {
  color: #606266;
  padding-left: 16px;
}
</style>
