<template>
  <div class="material-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="素材名称">
          <el-input v-model="searchForm.keyword" placeholder="输入素材名称搜索" clearable @keyup.enter="handleSearch" style="width: 150px" />
        </el-form-item>
        <el-form-item label="用户类型">
          <el-select v-model="searchForm.userType" placeholder="全部" clearable style="width: 120px" @change="handleSearchUserTypeChange">
            <el-option label="全部" value="" />
            <el-option label="个人用户" value="personal" />
            <el-option label="企业用户" value="enterprise" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="searchForm.userType === 'personal'" label="手机号">
          <div class="search-user">
            <el-input v-model="searchForm.phone" placeholder="输入手机号" clearable style="width: 140px" @keyup.enter="handleSearchQueryUser" />
            <el-button type="primary" size="small" @click="handleSearchQueryUser" :loading="searchLoading">查询</el-button>
          </div>
          <div v-if="searchUserList.length > 0 && !searchForm.userId" class="user-list">
            <div v-for="user in searchUserList" :key="user._id" class="user-item" @click="selectSearchUser(user)">
              <span>{{ user.phone }}</span>
            </div>
          </div>
          <div v-if="searchForm.userId" class="user-selected">
            <el-tag type="success" size="small">已选</el-tag>
            <span style="margin-left: 8px">{{ searchForm.userId === 'all' ? '全部个人用户' : searchForm.phone }}</span>
            <el-button type="danger" size="small" link style="margin-left: 8px" @click="clearSearchUser">清除</el-button>
          </div>
        </el-form-item>
        <el-form-item v-if="searchForm.userType === 'enterprise'" label="企业名称">
          <div class="search-user">
            <el-input v-model="searchForm.enterpriseName" placeholder="输入企业名称" clearable style="width: 140px" @keyup.enter="handleSearchQueryUser" />
            <el-button type="primary" size="small" @click="handleSearchQueryUser" :loading="searchLoading">查询</el-button>
          </div>
          <div v-if="searchEnterpriseList.length > 0 && !searchForm.userId" class="user-list">
            <div v-for="ent in searchEnterpriseList" :key="ent._id" class="user-item" @click="selectSearchEnterprise(ent)">
              <span>{{ ent.company_short_name || ent.company_name }}</span>
              <span style="color: #999; margin-left: 8px">{{ ent.phone || '-' }}</span>
            </div>
          </div>
          <div v-if="searchForm.userId" class="user-selected">
            <el-tag type="warning" size="small">已选</el-tag>
            <span style="margin-left: 8px">{{ searchForm.userId === 'all' ? '全部企业用户' : selectedSearchEnterpriseName }}</span>
            <el-button type="danger" size="small" link style="margin-left: 8px" @click="clearSearchUser">清除</el-button>
          </div>
        </el-form-item>
        <el-form-item v-if="searchForm.userId && searchForm.userId !== 'all'" label="一级分类">
          <el-select v-model="searchForm.category1Id" placeholder="全部" clearable style="width: 150px" @change="handleSearchCategory1Change">
            <el-option v-for="cat in searchCategory1List" :key="cat._id" :label="cat.name" :value="cat._id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="searchForm.userId && searchForm.userId !== 'all'" label="二级分类">
          <el-select v-model="searchForm.category2Id" placeholder="全部" clearable style="width: 150px">
            <el-option v-for="cat in searchCategory2List" :key="cat._id" :label="cat.name" :value="cat._id" />
          </el-select>
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
          <div>
            <el-button v-if="selectedRows.length > 0" type="danger" @click="handleBatchDelete">
              批量删除 ({{ selectedRows.length }})
            </el-button>
            <el-button type="primary" @click="handleManageCategories">管理分类</el-button>
            <el-button type="success" @click="handleBatchUpload">批量上传</el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange" ref="tableRef">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag type="info" size="small">图片</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="缩略图" width="80">
          <template #default="{ row }">
            <div v-if="row.thumbnail_url" class="thumb-square">
              <el-image 
                :src="row.thumbnail_url" 
                :preview-src-list="[row.thumbnail_url]" 
                preview-teleported
                :hide-on-click-modal="true"
                fit="contain"
              />
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="原图" width="80">
          <template #default="{ row }">
            <div v-if="row.url" class="thumb-square">
              <el-image 
                :src="row.url" 
                :preview-src-list="[row.url]" 
                preview-teleported
                :hide-on-click-modal="true"
                fit="contain"
              />
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="素材名称" min-width="150" show-overflow-tooltip />
        <el-table-column label="一级分类" width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.category1_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="二级分类" width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.category2_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="所属用户" width="160">
          <template #default="{ row }">
            <div v-if="row.user_type === 'enterprise'">
              <el-tag type="warning" size="small">企业</el-tag>
              {{ row.company_short_name || row.company_name || '-' }}
            </div>
            <div v-else>
              <el-tag type="info" size="small">个人</el-tag>
              {{ row.user_phone || '-' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="100">
          <template #default="{ row }">
            {{ formatSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="上传时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.create_time) }}
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
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>
    
    <!-- 编辑素材弹窗 -->
    <el-dialog v-model="editVisible" title="编辑素材" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="素材名称">
          <el-input v-model="editForm.title" placeholder="请输入素材名称" />
        </el-form-item>
        <el-form-item label="一级分类">
          <el-select v-model="editForm.category1_id" placeholder="选择一级分类" clearable style="width: 100%">
            <el-option v-for="cat in category1List" :key="cat._id" :label="cat.name" :value="cat._id" />
          </el-select>
        </el-form-item>
        <el-form-item label="二级分类">
          <el-select v-model="editForm.category2_id" placeholder="选择二级分类" clearable style="width: 100%">
            <el-option v-for="cat in category2List" :key="cat._id" :label="cat.name" :value="cat._id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit" :loading="saveLoading">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 批量上传弹窗 -->
    <el-dialog v-model="uploadVisible" title="批量上传素材" width="700px">
      <el-form :model="uploadForm" label-width="100px">
        <!-- 用户类型选择 -->
        <el-form-item label="用户类型" required>
          <el-radio-group v-model="uploadForm.user_type" @change="handleUserTypeChange">
            <el-radio value="personal">个人用户</el-radio>
            <el-radio value="enterprise">企业用户</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 个人用户：输入手机号 -->
        <el-form-item v-if="uploadForm.user_type === 'personal'" label="用户手机号" required>
          <div class="user-search">
            <el-input v-model="uploadForm.phone" placeholder="输入用户手机号" clearable style="width: 200px" @keyup.enter="handleSearchUser" />
            <el-button type="primary" @click="handleSearchUser" :loading="searchLoading">查询</el-button>
          </div>
          <!-- 查询结果列表 -->
          <div v-if="personalList.length > 0 && !uploadForm.userId" class="enterprise-list">
            <div v-for="user in personalList" :key="user._id" class="enterprise-item" @click="selectPersonal(user)">
              <span>手机: {{ user.phone }}</span>
            </div>
          </div>
          <div v-if="uploadForm.userId" class="user-info">
            <el-tag type="success">已选择用户</el-tag>
            <span style="margin-left: 10px">手机: {{ uploadForm.phone }}</span>
          </div>
        </el-form-item>
        
        <!-- 企业用户：输入企业名称 -->
        <el-form-item v-if="uploadForm.user_type === 'enterprise'" label="企业名称" required>
          <div class="user-search">
            <el-input v-model="uploadForm.enterpriseName" placeholder="输入企业名称" clearable style="width: 200px" @keyup.enter="handleSearchUser" />
            <el-button type="primary" @click="handleSearchUser" :loading="searchLoading">查询</el-button>
          </div>
          <div v-if="enterpriseList.length > 0 && !uploadForm.userId" class="enterprise-list">
            <div v-for="ent in enterpriseList" :key="ent._id" class="enterprise-item" @click="selectEnterprise(ent)">
              <span>{{ ent.company_short_name || ent.company_name }}</span>
              <span style="color: #999; margin-left: 10px">手机: {{ ent.phone || '-' }}</span>
            </div>
          </div>
          <div v-if="uploadForm.userId" class="user-info">
            <el-tag type="warning">已选择企业</el-tag>
            <span style="margin-left: 10px">{{ selectedEnterpriseName }}</span>
          </div>
        </el-form-item>
        
        <el-form-item v-if="uploadForm.userId" label="一级分类">
          <el-select v-model="uploadForm.category1_id" placeholder="选择一级分类" clearable style="width: 100%" @change="handleUploadCategory1Change">
            <el-option v-for="cat in category1List" :key="cat._id" :label="cat.name" :value="cat._id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="uploadForm.userId" label="二级分类">
          <el-select v-model="uploadForm.category2_id" placeholder="选择二级分类" clearable style="width: 100%">
            <el-option v-for="cat in uploadCategory2List" :key="cat._id" :label="cat.name" :value="cat._id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!uploadForm.userId" label="分类">
          <span style="color: #999">请先选择用户</span>
        </el-form-item>
        <el-form-item label="上传图片">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="10"
            :on-exceed="handleExceed"
            :on-change="handleFileChange"
            :file-list="fileList"
            multiple
            accept="image/*"
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div style="color: #999; margin-top: 8px">最多上传20张图片，单张不超过5MB，支持 jpg、png、gif 等格式</div>
          <!-- 上传进度区域 -->
          <div v-if="uploadLoading && Object.keys(uploadProgress).length > 0" style="margin-top: 16px; padding: 12px; background: #f5f7fa; border-radius: 4px;">
            <div style="margin-bottom: 8px">
              <span>正在上传... {{ uploadCompletedFiles }} / {{ uploadTotalFiles }}</span>
              <el-progress :percentage="Math.round((uploadCompletedFiles / uploadTotalFiles) * 100)" style="margin-top: 8px" />
            </div>
            <div style="max-height: 150px; overflow-y: auto;">
              <div v-for="(prog, uid) in uploadProgress" :key="uid" style="display: flex; align-items: center; margin-bottom: 4px; font-size: 12px;">
                <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ prog.name }}</span>
                <span v-if="prog.status === 'uploading'" style="color: #409eff; margin-left: 8px">{{ Math.round((prog.loaded / prog.total) * 100) }}%</span>
                <span v-else-if="prog.status === 'done'" style="color: #67c23a; margin-left: 8px">完成</span>
                <span v-else-if="prog.status === 'error'" style="color: #f56c6c; margin-left: 8px">失败</span>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadVisible = false" :disabled="uploadLoading">取消</el-button>
        <el-button type="primary" @click="handleBatchUploadSubmit" :loading="uploadLoading" :disabled="!uploadForm.userId || fileList.length === 0">
          {{ uploadLoading ? `上传中 (${uploadCompletedFiles}/${uploadTotalFiles})` : `上传 (${fileList.length})` }}
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 分类管理弹窗 -->
    <el-dialog v-model="categoryVisible" title="管理用户素材分类" width="700px">
      <!-- 用户选择区域 -->
      <el-form label-width="100px">
        <el-form-item label="用户类型" required>
          <el-radio-group v-model="categoryUserForm.user_type" @change="handleCategoryUserTypeChange">
            <el-radio value="personal">个人用户</el-radio>
            <el-radio value="enterprise">企业用户</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 个人用户 -->
        <el-form-item v-if="categoryUserForm.user_type === 'personal'" label="用户手机号" required>
          <div class="user-search">
            <el-input v-model="categoryUserForm.phone" placeholder="输入用户手机号" clearable style="width: 200px" @keyup.enter="handleCategorySearchUser" />
            <el-button type="primary" @click="handleCategorySearchUser" :loading="categorySearchLoading">查询</el-button>
          </div>
          <!-- 查询结果列表 -->
          <div v-if="categoryPersonalList.length > 0 && !categoryUserForm.userId" class="enterprise-list">
            <div v-for="user in categoryPersonalList" :key="user._id" class="enterprise-item" @click="handleSelectCategoryPersonal(user)">
              <span>手机: {{ user.phone }}</span>
            </div>
          </div>
          <div v-if="categoryUserForm.userId" class="user-info">
            <el-tag type="success">已选择用户</el-tag>
            <span style="margin-left: 10px">手机: {{ categoryUserForm.phone }}</span>
          </div>
        </el-form-item>
        
        <!-- 企业用户 -->
        <el-form-item v-if="categoryUserForm.user_type === 'enterprise'" label="企业名称" required>
          <div class="user-search">
            <el-input v-model="categoryUserForm.enterpriseName" placeholder="输入企业名称" clearable style="width: 200px" @keyup.enter="handleCategorySearchUser" />
            <el-button type="primary" @click="handleCategorySearchUser" :loading="categorySearchLoading">查询</el-button>
          </div>
          <div v-if="categoryEnterpriseList.length > 0 && !categoryUserForm.userId" class="enterprise-list">
            <div v-for="ent in categoryEnterpriseList" :key="ent._id" class="enterprise-item" @click="handleSelectCategoryEnterprise(ent)">
              <span>{{ ent.company_short_name || ent.company_name }}</span>
              <span style="color: #999; margin-left: 10px">手机: {{ ent.phone || '-' }}</span>
            </div>
          </div>
          <div v-if="categoryUserForm.userId" class="user-info">
            <el-tag type="warning">已选择企业</el-tag>
            <span style="margin-left: 10px">{{ categorySelectedEnterprise }}</span>
          </div>
        </el-form-item>
      </el-form>
      
      <!-- 分类管理区域 -->
      <template v-if="categoryUserForm.userId">
        <el-divider content-position="left">素材分类</el-divider>
        
        <div class="category-section">
          <h4>一级分类</h4>
          <div class="category-list">
            <div v-for="cat in category1List" :key="cat._id" class="category-item">
              <span>{{ cat.name }}</span>
              <div>
                <el-button type="primary" link size="small" @click="handleEditCategory1(cat)">编辑</el-button>
                <el-button type="danger" link size="small" @click="handleDeleteCategory(cat._id)">删除</el-button>
              </div>
            </div>
            <el-button type="primary" plain @click="handleAddCategory1">新增一级分类</el-button>
          </div>
        </div>
        
        <el-divider />
        
        <div class="category-section">
          <h4>二级分类</h4>
          <div class="category-list">
            <div v-for="cat in category2List" :key="cat._id" class="category-item">
              <span>{{ cat.name }} <span style="color: #999">({{ getCategory1Name(cat.parent_id) }})</span></span>
              <div>
                <el-button type="primary" link size="small" @click="handleEditCategory2(cat)">编辑</el-button>
                <el-button type="danger" link size="small" @click="handleDeleteCategory(cat._id)">删除</el-button>
              </div>
            </div>
            <el-button type="primary" plain @click="handleAddCategory2">新增二级分类</el-button>
          </div>
        </div>
      </template>
      <el-empty v-else description="请先选择用户" />
      
      <!-- 新增/编辑分类弹窗 -->
      <el-dialog v-model="categoryFormVisible" :title="categoryForm.id ? '编辑分类' : '新增分类'" width="400px" append-to-body>
        <el-form :model="categoryForm" label-width="80px">
          <el-form-item label="分类名称" required>
            <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
          </el-form-item>
          <el-form-item v-if="categoryForm.level === 2" label="所属一级">
            <el-select v-model="categoryForm.parent_id" placeholder="选择所属一级分类" style="width: 100%">
              <el-option v-for="cat in category1List" :key="cat._id" :label="cat.name" :value="cat._id" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="categoryFormVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveCategory" :loading="categoryLoading">保存</el-button>
        </template>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import api from '@/api'

export default {
  name: 'MaterialManagement',
  components: { Plus },
  setup() {
    const loading = ref(false)
    const saveLoading = ref(false)
    const uploadLoading = ref(false)
    const searchLoading = ref(false)
    const categoryLoading = ref(false)
    const tableData = ref([])
    const total = ref(0)
    const tableRef = ref(null)
    const selectedRows = ref([])
    
    // 分类数据
    const category1List = ref([])
    const category2List = ref([])
    const uploadCategory2List = ref([])
    
    const searchForm = reactive({
      phone: '',
      userType: '',
      userId: '',  // 选中的用户ID
      enterpriseName: '',
      category1Id: '',
      category2Id: '',
      keyword: ''
    })
    
    // 搜索相关
    const searchUserList = ref([])
    const searchEnterpriseList = ref([])
    const searchCategory1List = ref([])
    const searchCategory2List = ref([])
    const selectedSearchEnterpriseName = ref('')
    
    const pagination = reactive({
      page: 1,
      pageSize: 20
    })
    
    // 编辑弹窗
    const editVisible = ref(false)
    const editForm = reactive({
      _id: '',
      title: '',
      category1_id: '',
      category2_id: ''
    })
    
    // 上传弹窗
    const uploadVisible = ref(false)
    const uploadRef = ref(null)
    const fileList = ref([])
    const uploadForm = reactive({
      phone: '',
      userId: '',
      user_type: 'personal',
      enterpriseName: '',
      enterpriseId: '',
      category1_id: '',
      category2_id: ''
    })
    const enterpriseList = ref([])
    const personalList = ref([])
    const selectedEnterpriseName = ref('')
    // 批量上传进度追踪
    const uploadProgress = ref({})  // { uid: { loaded: number, total: number, status: 'uploading'|'done'|'error', url: string } }
    const uploadTotalFiles = ref(0)
    const uploadCompletedFiles = ref(0)
    
    // 分类管理弹窗
    const categoryVisible = ref(false)
    const categoryFormVisible = ref(false)
    const categoryForm = reactive({
      id: '',
      name: '',
      level: 1,
      parent_id: ''
    })
    
    // 分类管理 - 用户选择
    const categoryUserForm = reactive({
      user_type: 'personal',
      phone: '',
      enterpriseName: '',
      userId: '',
      enterpriseId: ''
    })
    const categoryEnterpriseList = ref([])
    const categoryPersonalList = ref([])
    const categorySelectedEnterprise = ref('')
    const categorySearchLoading = ref(false)
    
    // 加载数据
    const loadData = async () => {
      loading.value = true
      try {
        const res = await api.getMaterials({
          ...searchForm,
          page: pagination.page,
          pageSize: pagination.pageSize
        }, localStorage.getItem('admin_token'))
        
        const result = res.result || res
        if (result.success) {
          tableData.value = result.data || []
          total.value = result.total || 0
        } else {
          ElMessage.error(result.error || '加载失败')
        }
      } catch (err) {
        console.error(err)
        ElMessage.error('加载失败')
      } finally {
        loading.value = false
      }
    }
    
    // 加载用户素材分类
    const loadCategories = async (userId = '', userType = '') => {
      try {
        const res = await api.getUserMaterialCategories({ userId, userType }, localStorage.getItem('admin_token'))
        const result = res.result || res
        if (result.success) {
          category1List.value = result.data.filter(c => c.level == 1) || []
          category2List.value = result.data.filter(c => c.level == 2) || []
          // 如果传入了 userId，同时更新上传弹窗的分类列表
          if (userId) {
            uploadCategory2List.value = category2List.value
          }
        }
      } catch (err) {
        console.error(err)
      }
    }
    
    // 搜索
    const handleSearch = () => {
      pagination.page = 1
      loadData()
    }
    
    // 重置
    const handleReset = () => {
      searchForm.phone = ''
      searchForm.userType = ''
      searchForm.category1Id = ''
      searchForm.category2Id = ''
      searchForm.keyword = ''
      pagination.page = 1
      loadData()
    }
    
    // 用户类型变化 - 清空用户选择
    const handleSearchUserTypeChange = () => {
      searchForm.userId = ''
      searchForm.phone = ''
      searchForm.enterpriseName = ''
      searchForm.category1Id = ''
      searchForm.category2Id = ''
      searchUserList.value = []
      searchEnterpriseList.value = []
      searchCategory1List.value = []
      searchCategory2List.value = []
    }
    
    // 搜索用户（个人或企业）
    const handleSearchQueryUser = async () => {
      searchLoading.value = true
      searchUserList.value = []
      searchEnterpriseList.value = []
      
      try {
        if (searchForm.userType === 'personal') {
          if (!searchForm.phone) {
            ElMessage.warning('请输入手机号')
            return
          }
          const res = await api.getUsers({ phone: searchForm.phone, userType: 'personal' }, localStorage.getItem('admin_token'))
          const result = res.result || res
          if (result.success && result.data && result.data.length > 0) {
            searchUserList.value = result.data
          } else {
            ElMessage.warning('未找到该手机号的用户')
          }
        } else if (searchForm.userType === 'enterprise') {
          if (!searchForm.enterpriseName) {
            ElMessage.warning('请输入企业名称')
            return
          }
          const res = await api.getUsers({ enterpriseName: searchForm.enterpriseName, userType: 'enterprise' }, localStorage.getItem('admin_token'))
          const result = res.result || res
          if (result.success && result.data && result.data.length > 0) {
            searchEnterpriseList.value = result.data
          } else {
            ElMessage.warning('未找到该企业')
          }
        }
      } catch (err) {
        ElMessage.error('查询失败')
      } finally {
        searchLoading.value = false
      }
    }
    
    // 选择个人用户
    const selectSearchUser = async (user) => {
      searchForm.userId = user.user_id || user._id
      searchForm.phone = user.phone
      searchUserList.value = []
      // 加载该用户的分类
      await loadSearchCategories()
    }
    
    // 选择企业用户
    const selectSearchEnterprise = async (ent) => {
      searchForm.userId = ent.admin_user_id || ent.user_id || ent._id
      selectedSearchEnterpriseName.value = ent.company_short_name || ent.company_name
      searchEnterpriseList.value = []
      // 加载该企业的分类
      await loadSearchCategories()
    }
    
    // 清除用户选择
    const clearSearchUser = () => {
      searchForm.userId = ''
      searchForm.category1Id = ''
      searchForm.category2Id = ''
      searchCategory1List.value = []
      searchCategory2List.value = []
      selectedSearchEnterpriseName.value = ''
    }
    
    // 加载搜索区域的分类
    const loadSearchCategories = async () => {
      if (!searchForm.userId || searchForm.userId === 'all') return
      try {
        const res = await api.getUserMaterialCategories({ 
          userId: searchForm.userId, 
          userType: searchForm.userType 
        }, localStorage.getItem('admin_token'))
        const result = res.result || res
        if (result.success) {
          searchCategory1List.value = result.data.filter(c => c.level == 1) || []
          searchCategory2List.value = result.data.filter(c => c.level == 2) || []
        }
      } catch (err) {
        console.error('加载分类失败', err)
      }
    }
    
    // 搜索区域一级分类变化
    const handleSearchCategory1Change = () => {
      searchForm.category2Id = ''
    }
    
    // 一级分类变化（保留旧方法兼容）
    const handleCategory1Change = () => {
      searchForm.category2Id = ''
      // 筛选对应的二级分类
      if (searchForm.category1Id) {
        category2List.value = category2List.value.filter(c => c.parent_id === searchForm.category1Id)
      }
    }
    
    // 上传一级分类变化
    const handleUploadCategory1Change = () => {
      uploadForm.category2_id = ''
      uploadCategory2List.value = category2List.value.filter(c => c.parent_id === uploadForm.category1_id)
    }
    
    // 编辑素材
    const handleEdit = (row) => {
      editForm._id = row._id
      editForm.title = row.title
      editForm.category1_id = row.category1_id || ''
      editForm.category2_id = row.category2_id || ''
      editVisible.value = true
    }
    
    // 保存编辑
    const handleSaveEdit = async () => {
      if (!editForm.title) {
        ElMessage.warning('请输入素材名称')
        return
      }
      saveLoading.value = true
      try {
        const res = await api.updateMaterial({
          id: editForm._id,
          title: editForm.title,
          category1_id: editForm.category1_id || null,
          category2_id: editForm.category2_id || null
        }, localStorage.getItem('admin_token'))
        
        const result = res.result || res
        if (result.success) {
          ElMessage.success('保存成功')
          editVisible.value = false
          loadData()
        } else {
          ElMessage.error(result.error || '保存失败')
        }
      } catch (err) {
        ElMessage.error('保存失败')
      } finally {
        saveLoading.value = false
      }
    }
    
    // 删除素材
    const handleDelete = (row) => {
      ElMessageBox.confirm('确定删除该素材吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await api.deleteMaterial(row._id, localStorage.getItem('admin_token'))
          const result = res.result || res
          if (result.success) {
            ElMessage.success('删除成功')
            loadData()
          } else {
            ElMessage.error(result.error || '删除失败')
          }
        } catch (err) {
          ElMessage.error('删除失败')
        }
      }).catch(() => {})
    }
    
    // 选择变化
    const handleSelectionChange = (selection) => {
      selectedRows.value = selection
    }
    
    // 批量删除
    const handleBatchDelete = () => {
      if (selectedRows.value.length === 0) {
        ElMessage.warning('请先选择要删除的素材')
        return
      }
      ElMessageBox.confirm(`确定删除选中的 ${selectedRows.value.length} 个素材吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const ids = selectedRows.value.map(row => row._id)
          const res = await api.batchDeleteMaterials({ ids }, localStorage.getItem('admin_token'))
          const result = res.result || res
          if (result.success) {
            ElMessage.success(`成功删除 ${selectedRows.value.length} 个素材`)
            selectedRows.value = []
            loadData()
          } else {
            ElMessage.error(result.error || '删除失败')
          }
        } catch (err) {
          ElMessage.error('删除失败')
        }
      }).catch(() => {})
    }
    
    // 批量上传
    const handleBatchUpload = async () => {
      uploadForm.phone = ''
      uploadForm.userId = ''
      uploadForm.user_type = 'personal'
      uploadForm.enterpriseName = ''
      uploadForm.enterpriseId = ''
      uploadForm.category1_id = ''
      uploadForm.category2_id = ''
      fileList.value = []
      uploadCategory2List.value = []
      enterpriseList.value = []
      personalList.value = []
      selectedEnterpriseName.value = ''
      uploadVisible.value = true
      await loadCategories()
    }
    
    // 用户类型变化
    const handleUserTypeChange = () => {
      uploadForm.userId = ''
      uploadForm.enterpriseId = ''
      uploadForm.phone = ''
      uploadForm.enterpriseName = ''
      enterpriseList.value = []
      personalList.value = []
      selectedEnterpriseName.value = ''
    }
    
    // 查询用户
    const handleSearchUser = async () => {
      if (uploadForm.user_type === 'personal') {
        if (!uploadForm.phone) {
          ElMessage.warning('请输入手机号')
          return
        }
        searchLoading.value = true
        try {
          const res = await api.getUsers({ phone: uploadForm.phone, userType: 'personal' }, localStorage.getItem('admin_token'))
          const result = res.result || res
          if (result.success && result.data && result.data.length > 0) {
            // 显示结果列表供选择
            personalList.value = result.data
            uploadForm.userId = ''
          } else {
            ElMessage.warning('未找到该手机号的用户')
            personalList.value = []
          }
        } catch (err) {
          ElMessage.error('查询失败')
        } finally {
          searchLoading.value = false
        }
      } else {
        if (!uploadForm.enterpriseName) {
          ElMessage.warning('请输入企业名称')
          return
        }
        searchLoading.value = true
        try {
          const res = await api.getUsers({ enterpriseName: uploadForm.enterpriseName, userType: 'enterprise' }, localStorage.getItem('admin_token'))
          const result = res.result || res
          if (result.success && result.data && result.data.length > 0) {
            enterpriseList.value = result.data
            uploadForm.userId = ''
          } else {
            ElMessage.warning('未找到该企业')
            enterpriseList.value = []
          }
        } catch (err) {
          ElMessage.error('查询失败')
        } finally {
          searchLoading.value = false
        }
      }
    }
    
    // 选择个人用户
    const selectPersonal = async (user) => {
      uploadForm.userId = user.user_id || user._id
      uploadForm.phone = user.phone
      personalList.value = []
      uploadCategory2List.value = []
      // 加载该用户的专属分类
      await loadCategories(uploadForm.userId, 'personal')
    }
    
    // 选择企业
    const selectEnterprise = async (ent) => {
      uploadForm.enterpriseId = ent._id
      uploadForm.userId = ent.admin_user_id
      uploadForm.phone = ent.phone || ''
      selectedEnterpriseName.value = ent.company_short_name || ent.company_name
      enterpriseList.value = []
      uploadCategory2List.value = []
      // 加载该企业的专属分类
      await loadCategories(uploadForm.userId, 'enterprise')
    }
    
    // 文件变化
    const handleFileChange = (file, files) => {
      fileList.value = files
    }
    
    // 超出限制
    const handleExceed = () => {
      ElMessage.warning('最多只能上传20个文件，建议分批上传')
    }
    
    // 提交批量上传（带进度追踪，逐个上传避免请求体超限）
    const handleBatchUploadSubmit = async () => {
      if (!uploadForm.userId) {
        ElMessage.warning('请先查询并选择用户')
        return
      }
      if (fileList.value.length === 0) {
        ElMessage.warning('请选择要上传的图片')
        return
      }
      
      // 文件大小检查（每个文件不超过5MB）
      const maxSize = 5 * 1024 * 1024 // 5MB
      for (const file of fileList.value) {
        if (file.size > maxSize) {
          ElMessage.warning(`文件 ${file.name} 超过5MB限制，请压缩后重试`)
          return
        }
      }
      
      // 检查总文件数，超过20个建议分批
      if (fileList.value.length > 20) {
        const confirmed = await ElMessageBox.confirm(
          `您选择了 ${fileList.value.length} 个文件，建议分批上传以确保稳定性。是否继续上传？`,
          '提示',
          { confirmButtonText: '继续上传', cancelButtonText: '分批上传', type: 'warning' }
        ).catch(() => false)
        if (!confirmed) {
          ElMessage.info('请减少文件数量后重试，建议每次不超过20个')
          return
        }
      }
      
      uploadLoading.value = true
      uploadTotalFiles.value = fileList.value.length
      uploadCompletedFiles.value = 0
      uploadProgress.value = {}
      
      // 初始化进度
      for (const file of fileList.value) {
        uploadProgress.value[file.uid] = {
          name: file.name,
          loaded: 0,
          total: file.size,
          status: 'uploading'
        }
      }
      
      try {
        // 逐个上传图片到云存储
        const uploadedFiles = []
        for (const file of fileList.value) {
          try {
            // 1. 上传原图
            const res = await api.uploadImageWithProgress(
              file.raw,
              localStorage.getItem('admin_token'),
              (loaded, total) => {
                // 更新单个文件的上传进度
                if (uploadProgress.value[file.uid]) {
                  uploadProgress.value[file.uid].loaded = loaded * 0.5
                  uploadProgress.value[file.uid].total = total
                }
              }
            )
            const result = res.result || res
            
            if (result.success) {
              // 2. 生成并上传缩略图（长边250px，等比缩放，保持原格式）
              const thumbnailBlob = await new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = (e) => {
                  const img = new Image()
                  img.onload = () => {
                    const canvas = document.createElement('canvas')
                    const maxSize = 250
                    let thumbWidth, thumbHeight
                    
                    // 按长边250px缩放
                    if (img.width > img.height) {
                      thumbWidth = maxSize
                      thumbHeight = Math.round(img.height * maxSize / img.width)
                    } else {
                      thumbHeight = maxSize
                      thumbWidth = Math.round(img.width * maxSize / img.height)
                    }
                    
                    canvas.width = thumbWidth
                    canvas.height = thumbHeight
                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(img, 0, 0, thumbWidth, thumbHeight)
                    
                    // 保持原图格式
                    const originalType = file.raw.type || 'image/jpeg'
                    canvas.toBlob((blob) => {
                      resolve(blob)
                    }, originalType, 0.9)
                  }
                  img.onerror = reject
                  img.src = e.target.result
                }
                reader.onerror = reject
                reader.readAsDataURL(file.raw)
              })
              
              // 保持原图扩展名
              const originalExt = file.name.split('.').pop() || 'jpg'
              const thumbFile = new File([thumbnailBlob], `thumbnail.${originalExt}`, { type: file.raw.type || 'image/jpeg' })
              
              const thumbRes = await api.uploadImageWithProgress(
                thumbFile,
                localStorage.getItem('admin_token'),
                (loaded, total) => {
                  if (uploadProgress.value[file.uid]) {
                    uploadProgress.value[file.uid].loaded = file.size * 0.5 + loaded * 0.5
                    uploadProgress.value[file.uid].total = file.size
                  }
                }
              )
              const thumbResult = thumbRes.result || thumbRes
              
              // 去掉文件名后缀
              const fileNameWithoutExt = file.name.replace(/\.(png|jpg|jpeg|gif|bmp|webp|svg)$/i, '')
              uploadedFiles.push({
                name: fileNameWithoutExt,
                url: result.url,
                thumbnail_url: thumbResult.success ? thumbResult.url : result.url,
                size: file.size
              })
              uploadProgress.value[file.uid].status = 'done'
            } else {
              uploadProgress.value[file.uid].status = 'error'
            }
          } catch (err) {
            console.error(`上传失败: ${file.name}`, err)
            uploadProgress.value[file.uid].status = 'error'
          }
          uploadCompletedFiles.value++
        }
        
        if (uploadedFiles.length > 0) {
          // 创建素材记录
          const addRes = await api.batchAddMaterials({
            items: uploadedFiles,
            user_id: uploadForm.userId,
            user_type: uploadForm.user_type,
            category1_id: uploadForm.category1_id || null,
            category2_id: uploadForm.category2_id || null
          }, localStorage.getItem('admin_token'))
          
          const addResult = addRes.result || addRes
          if (addResult.success) {
            ElMessage.success(`成功上传 ${uploadedFiles.length} 个素材`)
            uploadVisible.value = false
            loadData()
          } else {
            ElMessage.error(addResult.error || '保存素材记录失败')
          }
        } else {
          ElMessage.error('所有文件上传失败')
        }
      } catch (err) {
        console.error(err)
        ElMessage.error('上传失败')
      } finally {
        uploadLoading.value = false
      }
    }
    
    // 管理分类
    const handleManageCategories = async () => {
      // 重置用户选择状态
      categoryUserForm.user_type = 'personal'
      categoryUserForm.phone = ''
      categoryUserForm.enterpriseName = ''
      categoryUserForm.userId = ''
      categoryUserForm.enterpriseId = ''
      categoryEnterpriseList.value = []
      category1List.value = []
      category2List.value = []
      categoryVisible.value = true
    }
    
    // 获取一级分类名称
    const getCategory1Name = (parentId) => {
      const cat = category1List.value.find(c => c._id === parentId)
      return cat ? cat.name : '-'
    }
    
    // 分类管理 - 用户类型变化
    const handleCategoryUserTypeChange = () => {
      categoryUserForm.userId = ''
      categoryUserForm.enterpriseId = ''
      categoryUserForm.phone = ''
      categoryUserForm.enterpriseName = ''
      categoryEnterpriseList.value = []
      categoryPersonalList.value = []
      categorySelectedEnterprise.value = ''
      category1List.value = []
      category2List.value = []
    }
    
    // 分类管理 - 查询用户
    const handleCategorySearchUser = async () => {
      if (categoryUserForm.user_type === 'personal') {
        if (!categoryUserForm.phone) {
          ElMessage.warning('请输入手机号')
          return
        }
        categorySearchLoading.value = true
        try {
          const res = await api.getUsers({ phone: categoryUserForm.phone, userType: 'personal' }, localStorage.getItem('admin_token'))
          const result = res.result || res
          if (result.success && result.data && result.data.length > 0) {
            // 显示结果列表供选择
            categoryPersonalList.value = result.data
            categoryUserForm.userId = ''
          } else {
            ElMessage.warning('未找到该手机号的用户')
            categoryPersonalList.value = []
          }
        } catch (err) {
          ElMessage.error('查询失败')
        } finally {
          categorySearchLoading.value = false
        }
      } else {
        if (!categoryUserForm.enterpriseName) {
          ElMessage.warning('请输入企业名称')
          return
        }
        categorySearchLoading.value = true
        try {
          const res = await api.getUsers({ enterpriseName: categoryUserForm.enterpriseName, userType: 'enterprise' }, localStorage.getItem('admin_token'))
          const result = res.result || res
          if (result.success && result.data && result.data.length > 0) {
            categoryEnterpriseList.value = result.data
            categoryUserForm.userId = ''
          } else {
            ElMessage.warning('未找到该企业')
            categoryEnterpriseList.value = []
          }
        } catch (err) {
          ElMessage.error('查询失败')
        } finally {
          categorySearchLoading.value = false
        }
      }
    }
    
    // 分类管理 - 选择个人用户
    const handleSelectCategoryPersonal = async (user) => {
      categoryUserForm.userId = user.user_id || user._id
      categoryUserForm.phone = user.phone
      categoryPersonalList.value = []
      // 加载该用户的分类
      await loadCategories(categoryUserForm.userId, 'personal')
    }
    
    // 分类管理 - 选择企业
    const handleSelectCategoryEnterprise = async (ent) => {
      categoryUserForm.enterpriseId = ent._id
      categoryUserForm.userId = ent.admin_user_id
      categoryUserForm.phone = ent.phone || ''
      categorySelectedEnterprise.value = ent.company_short_name || ent.company_name
      categoryEnterpriseList.value = []
      // 加载该企业的分类
      await loadCategories(categoryUserForm.userId, 'enterprise')
    }
    
    // 新增一级分类
    const handleAddCategory1 = () => {
      categoryForm.id = ''
      categoryForm.name = ''
      categoryForm.level = 1
      categoryForm.parent_id = ''
      categoryFormVisible.value = true
    }
    
    // 编辑一级分类
    const handleEditCategory1 = (cat) => {
      categoryForm.id = cat._id
      categoryForm.name = cat.name
      categoryForm.level = 1
      categoryForm.parent_id = ''
      categoryFormVisible.value = true
    }
    
    // 新增二级分类
    const handleAddCategory2 = () => {
      if (category1List.value.length === 0) {
        ElMessage.warning('请先添加一级分类')
        return
      }
      categoryForm.id = ''
      categoryForm.name = ''
      categoryForm.level = 2
      categoryForm.parent_id = category1List.value[0]?._id || ''
      categoryFormVisible.value = true
    }
    
    // 编辑二级分类
    const handleEditCategory2 = (cat) => {
      categoryForm.id = cat._id
      categoryForm.name = cat.name
      categoryForm.level = 2
      categoryForm.parent_id = cat.parent_id
      categoryFormVisible.value = true
    }
    
    // 保存分类
    const handleSaveCategory = async () => {
      if (!categoryForm.name) {
        ElMessage.warning('请输入分类名称')
        return
      }
      if (!categoryUserForm.userId) {
        ElMessage.warning('请先选择用户')
        return
      }
      if (categoryForm.level === 2 && !categoryForm.parent_id) {
        ElMessage.warning('请选择所属一级分类')
        return
      }
      
      categoryLoading.value = true
      try {
        const res = await api.upsertUserMaterialCategory({
          id: categoryForm.id || undefined,
          userId: categoryUserForm.userId,
          userType: categoryUserForm.user_type,
          name: categoryForm.name,
          level: categoryForm.level,
          parent_id: categoryForm.level === 2 ? categoryForm.parent_id : undefined
        }, localStorage.getItem('admin_token'))
        
        const result = res.result || res
        if (result.success) {
          ElMessage.success('保存成功')
          categoryFormVisible.value = false
          await loadCategories(categoryUserForm.userId, categoryUserForm.user_type)
        } else {
          ElMessage.error(result.error || '保存失败')
        }
      } catch (err) {
        ElMessage.error('保存失败')
      } finally {
        categoryLoading.value = false
      }
    }
    
    // 删除分类
    const handleDeleteCategory = (id) => {
      ElMessageBox.confirm('确定删除该分类吗？删除后该分类下的子分类也会被删除', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await api.deleteUserMaterialCategory(id, localStorage.getItem('admin_token'))
          const result = res.result || res
          if (result.success) {
            ElMessage.success('删除成功')
            await loadCategories()
          } else {
            ElMessage.error(result.error || '删除失败')
          }
        } catch (err) {
          ElMessage.error('删除失败')
        }
      }).catch(() => {})
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
      loadCategories()
    })
    
    return {
      loading,
      saveLoading,
      uploadLoading,
      searchLoading,
      categoryLoading,
      tableData,
      total,
      selectedRows,
      searchForm,
      pagination,
      editVisible,
      editForm,
      uploadVisible,
      uploadRef,
      fileList,
      uploadForm,
      uploadCategory2List,
      uploadProgress,
      uploadTotalFiles,
      uploadCompletedFiles,
      enterpriseList,
      personalList,
      selectedEnterpriseName,
      categoryVisible,
      categoryFormVisible,
      categoryForm,
      categoryUserForm,
      categoryEnterpriseList,
      categoryPersonalList,
      categorySelectedEnterprise,
      categorySearchLoading,
      category1List,
      category2List,
      searchUserList,
      searchEnterpriseList,
      searchCategory1List,
      searchCategory2List,
      selectedSearchEnterpriseName,
      loadData,
      handleSearch,
      handleReset,
      handleSearchUserTypeChange,
      handleSearchQueryUser,
      selectSearchUser,
      selectSearchEnterprise,
      clearSearchUser,
      handleSearchCategory1Change,
      handleCategory1Change,
      handleUploadCategory1Change,
      handleUserTypeChange,
      handleSearchUser,
      selectPersonal,
      selectEnterprise,
      handleCategoryUserTypeChange,
      handleCategorySearchUser,
      handleSelectCategoryEnterprise,
      handleSelectCategoryPersonal,
      handleEdit,
      handleSaveEdit,
      handleDelete,
      handleSelectionChange,
      handleBatchDelete,
      handleBatchUpload,
      handleFileChange,
      handleExceed,
      handleBatchUploadSubmit,
      handleManageCategories,
      getCategory1Name,
      handleAddCategory1,
      handleEditCategory1,
      handleAddCategory2,
      handleEditCategory2,
      handleSaveCategory,
      handleDeleteCategory,
      formatSize,
      formatTime
    }
  }
}
</script>

<style scoped>
.material-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-card {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.table-card {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-card :deep(.el-table) {
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.category-section {
  margin-bottom: 20px;
}

.category-section h4 {
  margin-bottom: 12px;
  color: #333;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  min-width: 150px;
}

.category-item span {
  margin-right: 10px;
}

.user-search {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-user {
  display: flex;
  gap: 8px;
  align-items: center;
}

.user-info {
  margin-top: 10px;
  padding: 10px;
  background: #f0f9eb;
  border-radius: 4px;
}

.enterprise-list {
  margin-top: 10px;
  max-height: 150px;
  overflow-y: auto;
}

.enterprise-item {
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 5px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}

.enterprise-item:hover {
  background: #e4e7ed;
}

.user-list {
  position: absolute;
  z-index: 100;
  margin-top: 5px;
  min-width: 200px;
  max-height: 150px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.user-item {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}

.user-item:hover {
  background: #f5f7fa;
}

.user-selected {
  margin-top: 8px;
  padding: 6px 10px;
  background: #f0f9eb;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.thumb-square {
  width: 60px;
  height: 60px;
  overflow: hidden;
  border-radius: 4px;
  background: #ffffff !important;
  border: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb-square .el-image {
  width: 100%;
  height: 100%;
  background: #ffffff !important;
}

.thumb-square .el-image__wrapper {
  background: #ffffff !important;
}

.thumb-square .el-image__inner {
  background: #ffffff !important;
}
</style>
