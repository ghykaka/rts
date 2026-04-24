<template>
  <div class="template-container">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="模板名称">
          <el-input v-model="searchForm.keyword" placeholder="请输入模板名称" clearable />
        </el-form-item>
        <el-form-item label="模板类型">
          <el-select v-model="searchForm.templateType" placeholder="全部" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="图片" value="image" />
            <el-option label="视频" value="video" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="首页推荐">
          <el-select v-model="searchForm.recommendHome" placeholder="全部" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="是" value="true" />
            <el-option label="否" value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="一级分类">
          <el-select v-model="searchForm.category1" placeholder="全部" clearable style="width: 140px" @change="handleSearchCategory1Change">
            <el-option label="全部" value="" />
            <el-option v-for="item in category1Options" :key="item._id" :label="item.name" :value="item._id" />
          </el-select>
        </el-form-item>
        <el-form-item label="二级分类">
          <el-select v-model="searchForm.category2" placeholder="全部" clearable style="width: 140px">
            <el-option label="全部" value="" />
            <el-option v-for="item in searchCategory2Options" :key="item._id" :label="item.name" :value="item._id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon> 新增模板
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table :data="tableData" v-loading="loading" stripe border>
      <el-table-column prop="templateType" label="类型" width="70" align="center">
        <template #default="{ row }">
          <el-tag :type="row.templateType === 'image' ? 'success' : 'warning'" size="small">
            {{ row.templateType === 'image' ? '图片' : '视频' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="图片" width="70" align="center">
        <template #default="{ row }">
          <div class="thumb-square" v-if="row.thumbnail">
            <el-image 
              :src="row.thumbnail" 
              fit="contain"
              :preview-src-list="[row.originalImage || row.thumbnail]" 
              preview-teleported
              :hide-on-click-modal="true"
            />
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="templateCode" label="编号" width="80" align="center">
        <template #default="{ row }">
          {{ row.templateCode || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="templateName" label="模板名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="industry" label="行业" width="150" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.industry?.join('、') || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="分类" width="160">
        <template #default="{ row }">
          {{ getCategoryName(row.category1) || '-' }}{{ row.category2 ? ' / ' + getCategoryName(row.category2) : '' }}
        </template>
      </el-table-column>
      <el-table-column prop="tags" label="标签" width="150" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.tags?.join('、') || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="recommendHome" label="首页推荐" width="90" align="center">
        <template #default="{ row }">
          <el-switch
            :model-value="row.recommendHome === true"
            @change="(val) => handleRecommendChange(row, val)"
            size="small"
          />
        </template>
      </el-table-column>
      <el-table-column label="关联素材" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.needMaterial ? 'warning' : 'info'" size="small">
            {{ row.needMaterial ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="绑定功能" width="120" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.functionIds && row.functionIds.length > 0" type="success" size="small">
            {{ row.functionIds.length }}个
          </el-tag>
          <span v-else style="color: #c0c4cc; font-size: 12px">未绑定</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="70" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
            {{ row.status === 'enabled' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="新增时间" width="160">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="修改时间" width="160">
        <template #default="{ row }">
          {{ formatDate(row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
        <el-form-item label="模板类型" prop="templateType">
          <el-radio-group v-model="form.templateType">
            <el-radio value="image">图片</el-radio>
            <el-radio value="video">视频</el-radio>
          </el-radio-group>
          <span style="margin-left: 30px; color: #909399; font-size: 14px;">
            编号：<span style="color: #409eff; font-weight: bold;">{{ form.templateCode || '新增时自动生成' }}</span>
          </span>
        </el-form-item>
        <el-form-item label="模板名称" prop="templateName">
          <el-input v-model="form.templateName" placeholder="请输入模板名称" maxlength="100" />
        </el-form-item>
        <el-form-item label="模板描述">
          <el-input v-model="form.templateDesc" type="textarea" :rows="3" placeholder="请输入模板描述" maxlength="500" />
        </el-form-item>
        <el-form-item label="所属行业">
          <el-select v-model="form.industry" multiple placeholder="请选择所属行业" style="width: 100%;" filterable>
            <el-option v-for="item in industryOptions" :key="item._id" :label="item.name" :value="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="一级分类">
          <el-select v-model="form.category1" placeholder="请选择一级分类" style="width: 100%;" clearable @change="handleCategory1Change">
            <el-option v-for="item in category1Options" :key="item._id" :label="item.name" :value="item._id" />
          </el-select>
        </el-form-item>
        <el-form-item label="二级分类">
          <el-select v-model="form.category2" placeholder="请选择二级分类" style="width: 100%;" clearable :disabled="!form.category1">
            <el-option v-for="item in category2Options" :key="item._id" :label="item.name" :value="item._id" />
          </el-select>
        </el-form-item>
        <el-form-item label="模板标签">
          <el-select v-model="form.tags" multiple placeholder="请选择模板标签" style="width: 100%;">
            <el-option v-for="item in tagOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="模板提示词">
          <el-input v-model="form.prompt" type="textarea" :rows="4" placeholder="请输入模板提示词（传入工作流的字段名为prompt）" />
        </el-form-item>
        <el-form-item label="参考样图">
          <div class="reference-images">
            <div class="reference-images-list">
              <div v-for="(img, index) in form.referenceImages" :key="index" class="reference-image-item">
                <el-image :src="img" fit="cover" style="width: 60px; height: 60px; border-radius: 4px" />
                <el-button type="danger" size="small" circle icon="Delete" class="delete-btn" @click="removeReferenceImage(index)" />
              </div>
            </div>
            <el-button type="primary" size="small" @click="triggerUpload('referenceImage')" :loading="uploading.referenceImage">
              <el-icon><Plus /></el-icon> 添加参考图
            </el-button>
            <span style="margin-left: 8px; color: #999; font-size: 12px">用于小程序生成页顶部展示</span>
            <input ref="referenceImageInput" type="file" accept="image/*" style="display: none" @change="handleReferenceImageChange($event)" />
          </div>
        </el-form-item>
        <el-form-item label="模板图片">
          <div class="template-image-section">
            <!-- 大图区域 -->
            <div class="image-section">
              <div class="section-label">大图（原图）</div>
              <div class="main-image-area">
                <el-upload
                  v-if="!form.originalImage"
                  class="image-uploader"
                  :auto-upload="false"
                  :show-file-list="false"
                  :before-upload="beforeOriginalUpload"
                  :on-change="handleOriginalChange"
                  accept="image/*"
                >
                  <el-icon class="upload-icon"><Plus /></el-icon>
                  <div class="upload-hint">点击上传大图</div>
                </el-upload>
                <div v-else class="image-preview" :style="{ aspectRatio: imageAspectRatio }">
                  <img :src="form.originalImage" class="preview-image" />
                  <div class="image-actions">
                    <el-button type="primary" size="small" @click="triggerUpload">
                      <el-icon><Upload /></el-icon> 重新上传
                    </el-button>
                    <el-button type="info" size="small" @click="handlePreviewOriginal">
                      <el-icon><View /></el-icon> 查看大图
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 缩略图区域 -->
            <div class="image-section">
              <div class="section-label">缩略图（300px）</div>
              <div class="thumbnail-area">
                <div v-if="form.thumbnail" class="thumbnail-preview">
                  <el-image 
                    :src="form.thumbnail" 
                    :preview-src-list="[form.originalImage || form.thumbnail]" 
                    fit="cover"
                    preview-teleported
                    :hide-on-click-modal="true"
                  />
                </div>
                <div v-else class="thumbnail-placeholder">
                  <el-icon><Picture /></el-icon>
                  <span>暂无缩略图</span>
                </div>
                <div class="thumbnail-tip">列表页显示，点击查看原图</div>
              </div>
            </div>
          </div>
          <div class="upload-tip">
            <p>支持JPG、PNG格式，建议尺寸 1080x1920 或 4:3</p>
            <p>文件大小不超过2MB</p>
            <p>上传后自动生成300px宽度缩略图</p>
          </div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="enabled">启用</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="关联素材">
          <el-switch v-model="form.needMaterial" active-value="true" inactive-value="false" />
          <span style="margin-left: 12px; color: #909399; font-size: 13px;">
            开启后，用户点击该模板将进入素材选择页；关闭则直接进入生成页
          </span>
        </el-form-item>
        <el-form-item label="绑定功能">
          <el-select v-model="form.functionIds" multiple placeholder="请选择绑定的功能（可选）" clearable style="width: 100%;" filterable>
            <el-option
              v-for="func in functionOptions"
              :key="func._id"
              :label="func.name"
              :value="func._id"
            />
          </el-select>
          <div style="color: #909399; font-size: 12px; margin-top: 4px">
            绑定功能后，用户点击该模板将使用该功能的配置（字段、尺寸、价格等）进行生成
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 图片预览组件 - 点击外部可关闭 -->
    <el-image-viewer
      v-if="previewVisible"
      :url-list="[previewImageUrl]"
      :hide-on-click-modal="true"
      @close="previewVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElImageViewer } from 'element-plus'
import { Search, Refresh, Plus, Upload, View, Picture, Delete } from '@element-plus/icons-vue'
import api from '@/api'
import store from '@/store'

const token = () => store.state.token

// 搜索表单
const searchForm = reactive({
  keyword: '',
  templateType: '',
  status: '',
  recommendHome: '',
  category1: '',
  category2: ''
})

// 搜索用的二级分类选项
const searchCategory2Options = ref([])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 参考图上传
const referenceImageInput = ref(null)
const uploading = reactive({
  referenceImage: false
})

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitting = ref(false)
const formRef = ref(null)
const editingId = ref('')
const imageAspectRatio = ref('auto')

// 表单
const form = reactive({
  templateType: 'image',
  templateName: '',
  templateDesc: '',
  industry: [],
  category1: '',
  category2: '',
  tags: [],
  prompt: '',
  originalImage: '',
  thumbnail: '',
  referenceImages: [],
  status: 'enabled',
  needMaterial: 'false',
  functionIds: []
})

// 表单验证
const formRules = {
  templateType: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
  templateName: [{ required: true, message: '请输入模板名称', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 选项数据
const industryOptions = ref([])
const tagOptions = ref([
  '促销', '节日', '品牌', '产品', '活动', '招聘', '通知', '海报', '封面', '广告'
])
const category1Options = ref([])
const category2Options = ref([])
const allCategoriesMap = ref({}) // 所有分类的ID到名称的映射
const functionOptions = ref([]) // 功能列表选项

// 加载行业数据
const loadIndustries = async () => {
  try {
    const res = await api.getIndustries(token())
    const result = res.result || res
    if (result.success) {
      industryOptions.value = (result.list || []).filter(item => item.status === 'enabled')
    }
  } catch (err) {
    console.error('加载行业失败', err)
  }
}

// 加载分类数据
const loadCategories = async () => {
  try {
    const res = await api.getCategories(token())
    const result = res.result || res
    if (result.success) {
      // 构建所有分类的映射
      const allList = result.list || []
      allCategoriesMap.value = {}
      allList.forEach(cat => {
        if (cat.status === 'enabled') {
          allCategoriesMap.value[cat._id] = cat.name
        }
      })
      // 一级分类
      category1Options.value = allList
        .filter(item => item.level === 1 && item.status === 'enabled')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    }
  } catch (err) {
    console.error('加载分类失败', err)
  }
}

// 加载功能列表
const loadFunctions = async () => {
  try {
    const res = await api.getWorkflowFunctions({ page: 1, pageSize: 500 }, token())
    const result = res.result || res
    console.log('加载功能列表返回:', result)
    if (result.success) {
      // getworkflowfunctions 返回的是 data 字段
      functionOptions.value = (result.data || []).filter(item => item.is_active !== false)
    }
  } catch (err) {
    console.error('加载功能列表失败', err)
  }
}

// 搜索用的一级分类变更
const handleSearchCategory1Change = async (val) => {
  searchForm.category2 = '' // 清空搜索的二级分类
  searchCategory2Options.value = []
  
  if (!val) return
  
  try {
    const res = await api.getCategories(token())
    const result = res.result || res
    if (result.success) {
      const parent = (result.list || []).find(item => item.name === val && item.level === 1)
      if (parent) {
        searchCategory2Options.value = (result.list || [])
          .filter(item => item.level === 2 && item.parentId === parent._id && item.status === 'enabled')
          .sort((a, b) => (a.order || 0) - (b.order || 0))
      }
    }
  } catch (err) {
    console.error('加载二级分类失败', err)
  }
}

// 表单用的一级分类变更时加载对应的二级分类
const handleCategory1Change = async (val) => {
  form.category2 = '' // 清空二级分类
  category2Options.value = []
  
  if (!val) return
  
  try {
    const res = await api.getCategories(token())
    const result = res.result || res
    if (result.success) {
      // 找到选中的一级分类（使用ID查找）
      const parent = (result.list || []).find(item => item._id === val && item.level === 1)
      if (parent) {
        category2Options.value = (result.list || [])
          .filter(item => item.level === 2 && item.parentId === parent._id && item.status === 'enabled')
          .sort((a, b) => (a.order || 0) - (b.order || 0))
      }
    }
  } catch (err) {
    console.error('加载二级分类失败', err)
  }
}

// 编辑时加载对应的二级分类
const loadCategoriesForEdit = async () => {
  if (!form.category1) return
  
  try {
    const res = await api.getCategories(token())
    const result = res.result || res
    if (result.success) {
      // 使用ID查找一级分类
      const parent = (result.list || []).find(item => item._id === form.category1 && item.level === 1)
      if (parent) {
        category2Options.value = (result.list || [])
          .filter(item => item.level === 2 && item.parentId === parent._id && item.status === 'enabled')
          .sort((a, b) => (a.order || 0) - (b.order || 0))
      }
    }
  } catch (err) {
    console.error('加载二级分类失败', err)
  }
}

// 根据ID获取分类名称
const getCategoryName = (categoryId) => {
  if (!categoryId) return ''
  return allCategoriesMap.value[categoryId] || categoryId
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const res = await api.getTemplates(params, token())
    const result = res.result || res
    
    if (result.success) {
      tableData.value = result.list || []
      pagination.total = result.total || 0
    } else {
      ElMessage.error(result.error || '加载失败')
    }
  } catch (err) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.templateType = ''
  searchForm.status = ''
  searchForm.recommendHome = ''
  searchForm.category1 = ''
  searchForm.category2 = ''
  pagination.page = 1
  loadData()
}

// 新增
const handleAdd = () => {
  editingId.value = ''
  Object.assign(form, {
    templateType: 'image',
    templateName: '',
    templateDesc: '',
    industry: [],
    category1: '',
    category2: '',
    tags: [],
    prompt: '',
    originalImage: '',
    thumbnail: '',
    referenceImages: [],
    status: 'enabled',
    needMaterial: 'false',
    functionIds: []
  })
  imageAspectRatio.value = 'auto'
  dialogTitle.value = '新增模板'
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row) => {
  editingId.value = row._id
  
  // 根据名称查找对应的分类 ID
  // 由于旧数据中 category1/category2 存储的是名称，需要转换
  let category1Id = row.category1 || ''
  let category2Id = row.category2 || ''
  
  // 确保分类选项已加载
  if (!category1Options.value || category1Options.value.length === 0) {
    await loadCategories()
  }
  
  // 如果 category1 是名称（不在选项中），查找对应的分类
  const cat1Exists = category1Options.value.some(c => c._id === category1Id)
  if (category1Id && !cat1Exists) {
    const foundCat1 = category1Options.value.find(c => c.name === category1Id)
    if (foundCat1) {
      category1Id = foundCat1._id
      // 加载对应的二级分类
      await loadCategoriesForEdit()
    }
  }
  
  // 如果 category2 是名称，查找对应的分类
  const cat2Exists = category2Options.value.some(c => c._id === category2Id)
  if (category2Id && !cat2Exists) {
    const foundCat2 = category2Options.value.find(c => c.name === category2Id)
    if (foundCat2) {
      category2Id = foundCat2._id
    }
  }
  
  Object.assign(form, {
    templateType: row.templateType,
    templateName: row.templateName,
    templateDesc: row.templateDesc || '',
    industry: row.industry || [],
    category1: category1Id,
    category2: category2Id,
    tags: row.tags || [],
    prompt: row.prompt || '',
    originalImage: row.originalImage || '',
    thumbnail: row.thumbnail || '',
    referenceImages: row.reference_images || [],
    status: row.status,
    templateCode: row.templateCode || '',
    needMaterial: String(row.needMaterial || false),
    functionIds: row.functionIds || []
  })
  imageAspectRatio.value = 'auto'
  
  // 如果有大图，获取其比例
  if (row.originalImage) {
    try {
      await new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          const ratio = img.width / img.height
          if (ratio > 3) {
            imageAspectRatio.value = '3 / 1'
          } else if (ratio < 0.33) {
            imageAspectRatio.value = '1 / 3'
          } else {
            imageAspectRatio.value = ratio.toFixed(2)
          }
          resolve()
        }
        img.onerror = resolve
        img.src = row.originalImage
      })
    } catch (e) {
      imageAspectRatio.value = 'auto'
    }
  }
  
  dialogTitle.value = '编辑模板'
  
  // 编辑时加载二级分类
  await loadCategoriesForEdit()
  
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除模板"${row.templateName}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await api.deleteTemplate(row._id, token())
    const result = res.result || res
    
    if (result.success) {
      ElMessage.success('删除成功')
      loadData()
    } else {
      ElMessage.error(result.error || '删除失败')
    }
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 上传前检查（2MB限制）
const beforeOriginalUpload = (file) => {
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('模板大图大小不能超过2MB')
    return false
  }
  return true
}

// 处理原图上传
const handleOriginalChange = async (uploadFile) => {
  const file = uploadFile.raw
  if (!file) return
  
  // 检查大小
  if (file.size / 1024 / 1024 >= 2) {
    ElMessage.error('模板大图大小不能超过2MB')
    return
  }
  
  try {
    ElMessage.info('正在上传...')
    
    // 先获取图片比例
    await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const ratio = img.width / img.height
          // 限制最大宽高比，防止显示异常
          if (ratio > 3) {
            imageAspectRatio.value = '3 / 1'
          } else if (ratio < 0.33) {
            imageAspectRatio.value = '1 / 3'
          } else {
            imageAspectRatio.value = ratio.toFixed(2)
          }
          resolve()
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
    
    // 压缩并上传
    const res = await uploadAndCompress(file)
    const result = res.result || res
    
    if (result.success) {
      form.originalImage = result.url
      form.thumbnail = result.thumbnail || result.url
      ElMessage.success('上传成功')
    } else {
      ElMessage.error(result.error || '上传失败')
      imageAspectRatio.value = 'auto'
    }
  } catch (err) {
    ElMessage.error('上传失败')
    imageAspectRatio.value = 'auto'
  }
}

// 重新上传
const handleReupload = () => {
  form.originalImage = ''
  form.thumbnail = ''
  imageAspectRatio.value = 'auto'
}

// 删除参考图
const removeReferenceImage = (index) => {
  form.referenceImages.splice(index, 1)
}

// 触发上传
const triggerUpload = (field) => {
  if (field === 'referenceImage') {
    referenceImageInput.value?.click()
  } else {
    // 原图上传 - 动态创建 input
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        handleOriginalChange({ raw: file })
      }
    }
    input.click()
  }
}

// 处理参考图上传
const handleReferenceImageChange = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  try {
    uploading.referenceImage = true
    const res = await api.uploadImageWithProgress(file, token())
    const result = res.result || res
    
    if (result.success) {
      form.referenceImages.push(result.url)
      ElMessage.success('上传成功')
    } else {
      ElMessage.error(result.error || '上传失败')
    }
  } catch (err) {
    ElMessage.error('上传失败')
  } finally {
    uploading.referenceImage = false
    event.target.value = '' // 清空input
  }
}



// 查看原图 - 使用 el-image-viewer 预览
const previewVisible = ref(false)
const previewImageUrl = ref('')

const handlePreviewOriginal = () => {
  if (form.originalImage) {
    previewImageUrl.value = form.originalImage
    previewVisible.value = true
  }
}

// 上传图片 - 原图不压缩直接上传，缩略图前端压缩到300px宽度后上传
const uploadAndCompress = async (file) => {
  // 1. 原图直接上传（不压缩，保持原始质量）
  const res1 = await api.uploadImageWithProgress(file, token())
  
  if (!res1.success) {
    throw new Error(res1.error || '原图上传失败')
  }
  
  // 2. 生成并上传缩略图（宽度300px，等比缩放，保持原格式）
  const thumbnailBlob = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const thumbWidth = 300
        const thumbHeight = Math.round(img.height * thumbWidth / img.width)
        
        canvas.width = thumbWidth
        canvas.height = thumbHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, thumbWidth, thumbHeight)
        
        // 保持原图格式
        const originalType = file.type || 'image/jpeg'
        canvas.toBlob((blob) => {
          resolve(blob)
        }, originalType, 0.9)
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  
  // 保持原图扩展名
  const originalExt = file.name.split('.').pop() || 'jpg'
  const thumbFile = new File([thumbnailBlob], `thumbnail.${originalExt}`, { type: file.type || 'image/jpeg' })
  
  const res2 = await api.uploadImageWithProgress(thumbFile, token())
  
  if (!res2.success) {
    throw new Error(res2.error || '缩略图上传失败')
  }
  
  return {
    result: {
      success: true,
      url: res1.url,           // 原图URL
      thumbnail: res2.url      // 缩略图URL（300px宽度）
    }
  }
}

// 提交
const handleSubmit = async () => {
  // 先检查表单值
  console.log('提交时表单数据:', JSON.stringify(form))
  console.log('templateName 值:', form.templateName, '类型:', typeof form.templateName)
  
  try {
    await formRef.value.validate()
  } catch (err) {
    console.log('表单验证失败:', err)
    return
  }
  
  submitting.value = true
  try {
    const data = {
      industry: form.industry,
      templateType: form.templateType,
      templateName: form.templateName,
      templateDesc: form.templateDesc,
      category1: form.category1,
      category2: form.category2,
      tags: form.tags,
      prompt: form.prompt,
      thumbnail: form.thumbnail,
      originalImage: form.originalImage,
      reference_images: form.referenceImages,
      status: form.status,
      needMaterial: form.needMaterial === 'true',
      functionIds: form.functionIds || []
    }
    
    console.log('提交的数据:', JSON.stringify(data))
    
    let res
    if (editingId.value) {
      data.id = editingId.value
      res = await api.updateTemplate(data, token())
    } else {
      res = await api.addTemplate(data, token())
    }
    
    console.log('接口返回:', JSON.stringify(res))
    
    const result = res.result || res
    
    if (result.success) {
      ElMessage.success(editingId.value ? '更新成功' : '添加成功')
      dialogVisible.value = false
      loadData()
    } else {
      ElMessage.error(result.error || '操作失败')
    }
  } catch (err) {
    console.error('提交失败:', err)
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// 首页推荐切换
const handleRecommendChange = async (row, value) => {
  try {
    const res = await api.updateTemplate({
      id: row._id,
      recommendHome: value
    }, token())
    const result = res.result || res
    if (result.success) {
      ElMessage.success(value ? '已设置首页推荐' : '已取消首页推荐')
      loadData()
    } else {
      ElMessage.error(result.error || '操作失败')
      loadData() // 恢复原状态
    }
  } catch (err) {
    ElMessage.error('操作失败')
    loadData()
  }
}

onMounted(() => {
  loadData()
  loadIndustries()
  loadCategories()
  loadFunctions()
})
</script>

<style>
/* 全局样式 - el-image-viewer 必须最高层级 */
.el-image-viewer__wrapper {
  z-index: 2147483647 !important;
}
.el-image-viewer {
  z-index: 2147483647 !important;
}
.el-image-viewer__mask {
  z-index: 2147483646 !important;
}
.el-icon {
  z-index: 2147483647 !important;
}
[class*="el-image-viewer"] {
  z-index: 2147483647 !important;
}
</style>

<style scoped>
.template-container {
  padding: 20px;
}


.search-bar {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.search-form {
  margin-bottom: 0;
}

/* 缩略图正方形容器 50x50 */
.thumb-square {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 4px;
  background: #f5f7fa;
}

.thumb-square .el-image {
  width: 100%;
  height: 100%;
}

.toolbar {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 新布局样式 */
.template-image-section {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.image-section {
  flex: 1;
}

.section-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.main-image-area {
  width: 100%;
  max-width: 400px;
}

.image-uploader {
  width: 100%;
  aspect-ratio: 1 / 1;
  max-height: 300px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  transition: all 0.3s;
}

.image-uploader:hover {
  border-color: #409eff;
  background: #f0f7ff;
}

.upload-icon {
  font-size: 48px;
  color: #8c939d;
}

.upload-hint {
  margin-top: 8px;
  font-size: 14px;
  color: #8c939d;
}

.image-preview {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
  background: #f5f7fa;
}

.image-preview img {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: contain;
  display: block;
}

.image-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  display: flex;
  justify-content: center;
  gap: 8px;
}

.thumbnail-area {
  width: 200px;
}

.thumbnail-preview {
  width: 200px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
  background: #f5f7fa;
}

.thumbnail-preview .el-image {
  width: 100%;
  height: auto;
  display: block;
}

.thumbnail-placeholder {
  width: 200px;
  height: 120px;
  border-radius: 6px;
  border: 1px dashed #d9d9d9;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #8c939d;
  font-size: 14px;
}

.thumbnail-placeholder .el-icon {
  font-size: 32px;
}

.thumbnail-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
  line-height: 1.8;
}

/* 参考图样式 */
.reference-images {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reference-images-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.reference-image-item {
  position: relative;
  display: inline-block;
}

.reference-image-item .delete-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  padding: 0;
}
</style>
