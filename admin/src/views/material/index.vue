<template>
  <div class="material-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="素材名称">
          <el-input v-model="searchForm.name" placeholder="输入素材名称" clearable />
        </el-form-item>
        <el-form-item label="素材类型">
          <el-select v-model="searchForm.type" placeholder="全部" clearable>
            <el-option label="全部" value="" />
            <el-option label="图片" value="image" />
            <el-option label="视频" value="video" />
            <el-option label="音频" value="audio" />
          </el-select>
        </el-form-item>
        <el-form-item label="归属用户">
          <el-input v-model="searchForm.userId" placeholder="输入用户ID" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 素材列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>素材列表</span>
          <el-button type="primary" @click="handleBatchAdd">批量添加素材</el-button>
        </div>
      </template>
      
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="name" label="素材名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)" size="small">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="user_id" label="归属用户" width="200" />
        <el-table-column prop="size" label="大小" width="100">
          <template #default="{ row }">
            {{ formatSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="上传时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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
    
    <!-- 查看素材弹窗 -->
    <el-dialog v-model="viewVisible" title="素材详情" width="600px">
      <div class="material-preview" v-if="currentMaterial">
        <div class="preview-info">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="素材名称">{{ currentMaterial.name }}</el-descriptions-item>
            <el-descriptions-item label="素材类型">
              <el-tag :type="getTypeColor(currentMaterial.type)" size="small">
                {{ getTypeText(currentMaterial.type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="归属用户">{{ currentMaterial.user_id }}</el-descriptions-item>
            <el-descriptions-item label="文件大小">{{ formatSize(currentMaterial.size) }}</el-descriptions-item>
            <el-descriptions-item label="文件URL">
              <el-input v-model="currentMaterial.url" readonly />
            </el-descriptions-item>
            <el-descriptions-item label="上传时间">
              {{ formatTime(currentMaterial.created_at) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
    
    <!-- 批量添加素材弹窗 -->
    <el-dialog v-model="batchVisible" title="批量添加素材" width="600px">
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="目标用户">
          <el-select 
            v-model="batchForm.userId" 
            placeholder="选择用户" 
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="user in userList"
              :key="user._id"
              :label="`${user.nickName || '用户'} - ${user._id}`"
              :value="user._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="素材类型">
          <el-select v-model="batchForm.type" placeholder="选择类型">
            <el-option label="图片" value="image" />
            <el-option label="视频" value="video" />
            <el-option label="音频" value="audio" />
          </el-select>
        </el-form-item>
        <el-form-item label="上传素材">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="50"
            :on-exceed="handleExceed"
            :file-list="fileList"
            multiple
            drag
            action="#"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">支持多选，最多50个文件</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpload" :loading="uploadLoading">开始上传</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'

export default {
  name: 'MaterialManagement',
  setup() {
    const loading = ref(false)
    const tableData = ref([])
    const total = ref(0)
    const userList = ref([])
    const searchForm = reactive({
      name: '',
      type: '',
      userId: ''
    })
    const pagination = reactive({
      page: 1,
      pageSize: 20
    })
    
    const viewVisible = ref(false)
    const currentMaterial = ref(null)
    
    const batchVisible = ref(false)
    const uploadLoading = ref(false)
    const fileList = ref([])
    const batchForm = reactive({
      userId: '',
      type: 'image'
    })
    
    const loadData = async () => {
      loading.value = true
      try {
        const res = await api.getMaterials({
          ...searchForm,
          page: pagination.page,
          pageSize: pagination.pageSize
        })
        
        if (res.success) {
          tableData.value = res.data || []
          total.value = res.total || 0
        }
      } catch (err) {
        console.error(err)
        ElMessage.error('加载数据失败')
      } finally {
        loading.value = false
      }
    }
    
    const loadUsers = async () => {
      try {
        const res = await api.getUsers({ page: 1, pageSize: 1000 })
        if (res.success) {
          userList.value = res.data || []
        }
      } catch (err) {
        console.error(err)
      }
    }
    
    const handleSearch = () => {
      pagination.page = 1
      loadData()
    }
    
    const handleReset = () => {
      searchForm.name = ''
      searchForm.type = ''
      searchForm.userId = ''
      handleSearch()
    }
    
    const handleView = (row) => {
      currentMaterial.value = { ...row }
      viewVisible.value = true
    }
    
    const handleDelete = (row) => {
      ElMessageBox.confirm('确定删除该素材吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await api.deleteMaterial(row._id)
          if (res.success) {
            ElMessage.success('删除成功')
            loadData()
          } else {
            ElMessage.error(res.error || '删除失败')
          }
        } catch (err) {
          ElMessage.error('删除失败')
        }
      }).catch(() => {})
    }
    
    const handleBatchAdd = () => {
      batchForm.userId = ''
      batchForm.type = 'image'
      fileList.value = []
      batchVisible.value = true
      loadUsers()
    }
    
    const handleExceed = () => {
      ElMessage.warning('最多只能上传50个文件')
    }
    
    const handleUpload = async () => {
      if (!batchForm.userId) {
        ElMessage.warning('请选择目标用户')
        return
      }
      
      const uploadFiles = fileList.value
      if (uploadFiles.length === 0) {
        ElMessage.warning('请选择要上传的文件')
        return
      }
      
      uploadLoading.value = true
      let successCount = 0
      
      try {
        for (const file of uploadFiles) {
          const formData = new FormData()
          formData.append('file', file.raw)
          formData.append('userId', batchForm.userId)
          formData.append('type', batchForm.type)
          formData.append('name', file.name)
          
          const res = await api.addMaterial(formData)
          if (res.success) {
            successCount++
          }
        }
        
        ElMessage.success(`上传完成，成功 ${successCount}/${uploadFiles.length} 个`)
        batchVisible.value = false
        loadData()
      } catch (err) {
        ElMessage.error('上传失败')
      } finally {
        uploadLoading.value = false
      }
    }
    
    const getTypeColor = (type) => {
      const colors = {
        image: '',
        video: 'warning',
        audio: 'success'
      }
      return colors[type] || 'info'
    }
    
    const getTypeText = (type) => {
      const texts = {
        image: '图片',
        video: '视频',
        audio: '音频'
      }
      return texts[type] || type
    }
    
    const formatSize = (bytes) => {
      if (!bytes) return '-'
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
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
      userList,
      searchForm,
      pagination,
      viewVisible,
      currentMaterial,
      batchVisible,
      uploadLoading,
      fileList,
      batchForm,
      loadData,
      handleSearch,
      handleReset,
      handleView,
      handleDelete,
      handleBatchAdd,
      handleExceed,
      handleUpload,
      getTypeColor,
      getTypeText,
      formatSize,
      formatTime
    }
  }
}
</script>

<style scoped>
.material-container {
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

.material-preview {
  padding: 10px 0;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
