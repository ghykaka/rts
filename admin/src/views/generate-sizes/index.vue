<template>
  <div class="generate-sizes-container">
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>生成物尺寸</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加尺寸
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="全部" clearable style="width: 120px" @change="handleSearch">
            <el-option label="线上图" value="线上图" />
            <el-option label="线下图" value="线下图" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="searchForm.name" placeholder="输入名称搜索" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.isEnabled" placeholder="全部" clearable style="width: 100px" @change="handleSearch">
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column label="分类" width="100">
          <template #default="{ row }">
            <el-tag :type="row.category === '线上图' ? 'success' : 'warning'" size="small">
              {{ row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="名称" min-width="140">
          <template #default="{ row }">
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="尺寸示意图" width="80" align="center">
          <template #default="{ row }">
            <el-image 
              v-if="row.example_image" 
              :src="row.example_image" 
              style="width: 40px; height: 40px; border-radius: 4px;"
              fit="cover"
              :preview-src-list="[row.example_image]"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="描述" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="尺寸值" width="140">
          <template #default="{ row }">
            <span style="font-family: monospace">{{ row.size_value }}</span>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="80" align="center">
          <template #default="{ row }">
            {{ row.sort ?? 0 }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_enabled ? 'success' : 'info'" size="small">
              {{ row.is_enabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @closed="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="线上图" value="线上图" />
            <el-option label="线下图" value="线下图" />
          </el-select>
        </el-form-item>

        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="如：9:16、60x160展架" />
        </el-form-item>

        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="简要描述该尺寸用途" />
        </el-form-item>

        <el-form-item label="尺寸值" prop="sizeValue">
          <el-input v-model="form.sizeValue" placeholder="如：900x1600、1000x1000" />
        </el-form-item>

        <el-form-item label="尺寸示意图">
          <div class="image-upload-wrapper">
            <el-input v-model="form.exampleImage" placeholder="请输入图片URL" style="width: 280px;" />
            <input 
              ref="fileInput" 
              type="file" 
              accept="image/*" 
              style="display: none" 
              @change="handleFileChange"
            />
            <el-button type="primary" size="small" style="margin-left: 10px;" @click="triggerFileInput">
              {{ uploading ? '上传中...' : '上传图片' }}
            </el-button>
            <el-image 
              v-if="form.exampleImage" 
              :src="form.exampleImage" 
              style="width: 80px; height: 80px; margin-top: 8px; border-radius: 4px;"
              fit="cover"
              :preview-src-list="[form.exampleImage]"
            />
          </div>
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
        </el-form-item>

        <el-form-item label="是否启用">
          <el-switch v-model="form.isEnabled" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import api from '@/api'

export default {
  name: 'GenerateSizes',
  components: { Plus },
  setup() {
    const store = useStore()
    const loading = ref(false)
    const tableData = ref([])
    const dialogVisible = ref(false)
    const dialogTitle = ref('添加尺寸')
    const submitLoading = ref(false)
    const formRef = ref(null)
    const currentEditId = ref(null)

    const searchForm = reactive({
      category: '',
      name: '',
      isEnabled: ''
    })

    const pagination = reactive({
      page: 1,
      pageSize: 10,
      total: 0
    })

    const form = reactive({
      category: '线上图',
      name: '',
      description: '',
      sizeValue: '',
      exampleImage: '',
      sort: 0,
      isEnabled: true
    })

    const rules = {
      category: [{ required: true, message: '请选择分类', trigger: 'change' }],
      name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      sizeValue: [{ required: true, message: '请输入尺寸值', trigger: 'blur' }]
    }

    const loadData = async () => {
      loading.value = true

      try {
        const token = store.state.token
        const res = await api.getGenerateSizes({
          page: pagination.page,
          pageSize: pagination.pageSize,
          category: searchForm.category || undefined,
          name: searchForm.name || undefined,
          isEnabled: searchForm.isEnabled !== '' ? searchForm.isEnabled : undefined
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
      searchForm.category = ''
      searchForm.name = ''
      searchForm.isEnabled = ''
      handleSearch()
    }

    const handleAdd = () => {
      dialogTitle.value = '添加尺寸'
      currentEditId.value = null
      resetForm()
      dialogVisible.value = true
    }

    const handleEdit = (row) => {
      dialogTitle.value = '编辑尺寸'
      currentEditId.value = row._id
      form.category = row.category
      form.name = row.name
      form.description = row.description || ''
      form.sizeValue = row.size_value || ''
      form.exampleImage = row.example_image || ''
      form.sort = row.sort || 0
      form.isEnabled = row.is_enabled !== false
      dialogVisible.value = true
    }

    const resetForm = () => {
      form.category = '线上图'
      form.name = ''
      form.description = ''
      form.sizeValue = ''
      form.exampleImage = ''
      form.sort = 0
      form.isEnabled = true
      formRef.value?.resetFields()
    }

    const handleSubmit = async () => {
      const valid = await formRef.value.validate().catch(() => false)
      if (!valid) return

      submitLoading.value = true

      try {
        const token = store.state.token
        const data = {
          category: form.category,
          name: form.name,
          description: form.description,
          sizeValue: form.sizeValue,
          exampleImage: form.exampleImage,
          sort: form.sort,
          isEnabled: form.isEnabled
        }

        let res
        if (currentEditId.value) {
          res = await api.updateGenerateSize({ id: currentEditId.value, ...data }, token)
        } else {
          res = await api.createGenerateSize(data, token)
        }

        const result = res.result || res
        if (result.success) {
          ElMessage.success(currentEditId.value ? '更新成功' : '创建成功')
          dialogVisible.value = false
          loadData()
        } else {
          ElMessage.error(result.error || '操作失败')
        }
      } catch (err) {
        console.error('操作失败:', err)
        ElMessage.error('操作失败')
      } finally {
        submitLoading.value = false
      }
    }

    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(`确定要删除尺寸"${row.name}"吗？`, '提示', {
          type: 'warning'
        })

        const token = store.state.token
        const res = await api.deleteGenerateSize(row._id, token)
        const result = res.result || res

        if (result.success) {
          ElMessage.success('删除成功')
          loadData()
        } else {
          ElMessage.error(result.error || '删除失败')
        }
      } catch (err) {
        if (err !== 'cancel') {
          console.error('删除失败:', err)
          ElMessage.error('删除失败')
        }
      }
    }

    const fileInput = ref(null)
    const uploading = ref(false)

    const triggerFileInput = () => {
      fileInput.value?.click()
    }

    const handleFileChange = async (e) => {
      const file = e.target.files?.[0]
      if (!file) return

      // 检查大小
      if (file.size / 1024 / 1024 >= 5) {
        ElMessage.error('图片大小不能超过 5MB')
        return
      }

      // 检查类型
      if (!file.type.startsWith('image/')) {
        ElMessage.error('只能上传图片文件')
        return
      }

      uploading.value = true
      try {
        const token = store.state.token
        const res = await api.uploadImageWithProgress(file, token)
        const result = res.result || res

        if (result.success) {
          form.exampleImage = result.url
          ElMessage.success('上传成功')
        } else {
          ElMessage.error(result.error || '上传失败')
        }
      } catch (err) {
        console.error('上传失败:', err)
        ElMessage.error('上传失败')
      } finally {
        uploading.value = false
        // 清空 input，允许重复选择同一文件
        if (fileInput.value) {
          fileInput.value.value = ''
        }
      }
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    onMounted(() => {
      loadData()
    })

    return {
      loading,
      tableData,
      searchForm,
      pagination,
      dialogVisible,
      dialogTitle,
      submitLoading,
      formRef,
      form,
      rules,
      loadData,
      handleSearch,
      handleReset,
      handleAdd,
      handleEdit,
      handleSubmit,
      handleDelete,
      formatDate,
      fileInput,
      uploading,
      triggerFileInput,
      handleFileChange
    }
  }
}
</script>

<style scoped>
.generate-sizes-container {
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

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
