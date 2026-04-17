<template>
  <div class="template-container">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="模板名称">
          <el-input v-model="searchForm.keyword" placeholder="请输入模板名称" clearable />
        </el-form-item>
        <el-form-item label="模板类型">
          <el-select v-model="searchForm.templateType" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="图片" value="image" />
            <el-option label="视频" value="video" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="一级分类">
          <el-select v-model="searchForm.category1" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option v-for="item in category1Options" :key="item._id" :label="item.name" :value="item.name" />
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
      <el-table-column prop="templateName" label="模板名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="templateType" label="类型" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.templateType === 'image' ? 'success' : 'warning'" size="small">
            {{ row.templateType === 'image' ? '图片' : '视频' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="industry" label="所属行业" width="150" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.industry?.join('、') || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="category1" label="一级分类" width="100" />
      <el-table-column prop="category2" label="二级分类" width="100" />
      <el-table-column prop="tags" label="标签" width="150" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.tags?.join('、') || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="缩略图" width="100" align="center">
        <template #default="{ row }">
          <el-image 
            v-if="row.thumbnail" 
            :src="row.thumbnail" 
            fit="cover" 
            :preview-src-list="[row.thumbnail]" 
            style="width: 60px; height: 40px;"
            preview-teleported
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80" align="center">
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
            <el-option v-for="item in category1Options" :key="item._id" :label="item.name" :value="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="二级分类">
          <el-select v-model="form.category2" placeholder="请选择二级分类" style="width: 100%;" clearable :disabled="!form.category1">
            <el-option v-for="item in category2Options" :key="item._id" :label="item.name" :value="item.name" />
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
        <el-form-item label="模板大图">
          <div class="upload-wrapper">
            <!-- 大图上传区域 -->
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
                <div class="image-overlay">
                  <el-button type="primary" size="small" @click="handleReupload">
                    <el-icon><Upload /></el-icon> 重新上传
                  </el-button>
                  <el-button type="info" size="small" @click="handlePreviewOriginal">
                    <el-icon><View /></el-icon> 查看原图
                  </el-button>
                </div>
              </div>
            </div>
            
            <!-- 缩略图预览区域 -->
            <div v-if="form.thumbnail" class="thumbnail-area">
              <div class="thumbnail-title">缩略图预览</div>
              <div class="thumbnail-preview">
                <el-image 
                  :src="form.thumbnail" 
                  :preview-src-list="[form.thumbnail]" 
                  fit="cover"
                  preview-teleported
                />
              </div>
              <div class="thumbnail-tip">300px宽度预览</div>
            </div>
            
            <div class="upload-tip">
              <p>支持JPG、PNG格式</p>
              <p>文件大小不超过2MB</p>
              <p>上传后自动生成300px缩略图</p>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
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
import { Search, Refresh, Plus, Upload, View } from '@element-plus/icons-vue'
import api from '@/api'
import store from '@/store'

const token = () => store.state.token

// 搜索表单
const searchForm = reactive({
  keyword: '',
  templateType: '',
  status: '',
  category1: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

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
  status: 'enabled'
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
      // 一级分类
      category1Options.value = (result.list || [])
        .filter(item => item.level === 1 && item.status === 'enabled')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    }
  } catch (err) {
    console.error('加载分类失败', err)
  }
}

// 一级分类变更时加载对应的二级分类
const handleCategory1Change = async (val) => {
  form.category2 = '' // 清空二级分类
  category2Options.value = []
  
  if (!val) return
  
  try {
    const res = await api.getCategories(token())
    const result = res.result || res
    if (result.success) {
      // 找到选中的一级分类
      const parent = (result.list || []).find(item => item.name === val && item.level === 1)
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
      const parent = (result.list || []).find(item => item.name === form.category1 && item.level === 1)
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
  searchForm.category1 = ''
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
    status: 'enabled'
  })
  imageAspectRatio.value = 'auto'
  dialogTitle.value = '新增模板'
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row) => {
  editingId.value = row._id
  Object.assign(form, {
    templateType: row.templateType,
    templateName: row.templateName,
    templateDesc: row.templateDesc || '',
    industry: row.industry || [],
    category1: row.category1 || '',
    category2: row.category2 || '',
    tags: row.tags || [],
    prompt: row.prompt || '',
    originalImage: row.originalImage || '',
    thumbnail: row.thumbnail || '',
    status: row.status
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
    ElMessage.info('正在压缩上传...')
    
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

// 查看原图
const handlePreviewOriginal = () => {
  if (form.originalImage) {
    // 创建一个新的窗口打开原图
    window.open(form.originalImage, '_blank')
  }
}

// 压缩并上传图片
// 1. 原图压缩后上传（最大边800px，0.8质量，确保base64不超过1MB）
// 2. 生成300px宽度的缩略图（0.7质量）
const uploadAndCompress = async (file) => {
  // 1. 压缩原图
  const originalBlob = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // 原图压缩：最大边限制在800px
        const canvas = document.createElement('canvas')
        let w = img.width
        let h = img.height
        const maxSize = 800
        
        if (w > maxSize || h > maxSize) {
          if (w > h) {
            h = Math.round(h * maxSize / w)
            w = maxSize
          } else {
            w = Math.round(w * maxSize / h)
            h = maxSize
          }
        }
        
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        
        // 0.8质量，循环压缩直到小于800KB（确保base64后不超过1MB）
        const compress = () => {
          canvas.toBlob((blob) => {
            if (blob && blob.size > 800 * 1024) {
              canvas.toBlob(compress, 'image/jpeg', 0.6)
            } else {
              resolve(blob)
            }
          }, 'image/jpeg', 0.8)
        }
        compress()
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  
  const compressedFile = new File([originalBlob], 'original.jpg', { type: 'image/jpeg' })
  console.log('压缩后原图:', (compressedFile.size / 1024).toFixed(1), 'KB')
  
  // 上传压缩后的原图
  const res1 = await api.uploadImage(compressedFile, token())
  const result1 = res1.result || res1
  
  if (!result1.success) {
    throw new Error(result1.error || '原图上传失败')
  }
  
  // 2. 生成并上传缩略图（300px宽度，0.7质量）
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
        
        canvas.toBlob((blob) => {
          resolve(blob)
        }, 'image/jpeg', 0.7)
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  
  const thumbFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' })
  console.log('缩略图大小:', (thumbFile.size / 1024).toFixed(1), 'KB')
  
  const res2 = await api.uploadImage(thumbFile, token())
  const result2 = res2.result || res2
  
  if (!result2.success) {
    throw new Error(result2.error || '缩略图上传失败')
  }
  
  return {
    result: {
      success: true,
      url: result1.url,
      thumbnail: result2.url
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
      status: form.status
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

onMounted(() => {
  loadData()
  loadIndustries()
  loadCategories()
})
</script>

<style scoped>
.template-container {
  padding: 20px;
}

/* 修复图片预览层级问题 - 强制提升到最高层 */
:deep(.el-image-viewer__wrapper) {
  z-index: 99999 !important;
}
:deep(.el-image-viewer) {
  z-index: 99999 !important;
}
:deep(.el-image-viewer__mask) {
  z-index: 99998 !important;
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

.toolbar {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.upload-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.main-image-area {
  flex: 1;
  max-width: 500px;
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
  border-color: #667eea;
  background: #f0f4ff;
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
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.thumbnail-area {
  width: 140px;
  flex-shrink: 0;
}

.thumbnail-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.thumbnail-preview {
  width: 120px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
}

.thumbnail-preview .el-image {
  width: 100%;
  height: 100%;
}

.thumbnail-tip {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
  line-height: 1.8;
  margin-left: 24px;
}
</style>
