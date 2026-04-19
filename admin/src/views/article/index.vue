<template>
  <div class="article-container">
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="文章标题">
          <el-input v-model="searchForm.keyword" placeholder="请输入文章标题" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon> 新增文章
      </el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe border>
      <el-table-column prop="title" label="文章标题" min-width="180" show-overflow-tooltip />
      <el-table-column prop="path" label="页面路径" min-width="200">
        <template #default="{ row }">
          <div class="path-cell">
            <span class="path-text">{{ row.path || '-' }}</span>
            <el-button 
              v-if="row.path" 
              type="primary" 
              link 
              size="small" 
              @click="copyPath(row.path)"
              class="copy-btn"
            >
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </div>
        </template>
      </el-table-column>
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

    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next"
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题" maxlength="100" />
        </el-form-item>
        <el-form-item label="文章内容">
          <div class="rich-editor-wrapper">
            <div class="editor-toolbar">
              <el-button-group>
                <el-button size="small" @click="execCommand('bold')" title="加粗"><b>B</b></el-button>
                <el-button size="small" @click="execCommand('italic')" title="斜体"><i>I</i></el-button>
                <el-button size="small" @click="execCommand('underline')" title="下划线"><u>U</u></el-button>
              </el-button-group>
              <el-button-group>
                <el-button size="small" @click="execCommand('insertUnorderedList')" title="无序列表">· 列表</el-button>
                <el-button size="small" @click="execCommand('insertOrderedList')" title="有序列表">1. 列表</el-button>
              </el-button-group>
              <el-button-group>
                <el-button size="small" @click="execCommand('formatBlock', 'h2')" title="标题">标题</el-button>
                <el-button size="small" @click="execCommand('formatBlock', 'p')" title="段落">段落</el-button>
              </el-button-group>
              <el-button-group>
                <el-button size="small" @click="execCommand('removeFormat')" title="清除格式">清除</el-button>
              </el-button-group>
              <el-button size="small" @click="handleImageUpload" title="上传图片">
                <el-icon><Picture /></el-icon> 图片
              </el-button>
              <input type="file" ref="imageInputRef" accept="image/*" style="display:none" @change="handleImageFileSelect" />
            </div>
            <div 
              ref="editorRef"
              class="rich-editor-content"
              contenteditable="true"
              @input="handleEditorInput"
              @paste="handlePaste"
            ></div>
          </div>
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
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, CopyDocument, Picture } from '@element-plus/icons-vue'
import api from '@/api'
import { callCloudFunction, callCloudFunctionDirect } from '@/api'
import store from '@/store'

const token = () => store.state.token

const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitting = ref(false)
const formRef = ref(null)
const editingId = ref('')
const editorRef = ref(null)

const searchForm = reactive({
  keyword: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const form = reactive({
  title: '',
  path: '',
  content: '',
  status: 'enabled'
})

const formRules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }]
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await callCloudFunction('adminarticle', {
      action: 'list',
      data: { page: pagination.page, pageSize: pagination.pageSize, ...searchForm }
    }, token())
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
  searchForm.status = ''
  pagination.page = 1
  loadData()
}

// 新增
const handleAdd = () => {
  editingId.value = ''
  Object.assign(form, { title: '', path: '', content: '', status: 'enabled' })
  dialogTitle.value = '新增文章'
  dialogVisible.value = true
  nextTick(() => {
    if (editorRef.value) {
      editorRef.value.innerHTML = ''
    }
  })
}

// 编辑
const handleEdit = async (row) => {
  editingId.value = row._id
  Object.assign(form, {
    title: row.title,
    path: row.path || '',
    content: row.content || '',
    status: row.status
  })
  dialogTitle.value = '编辑文章'
  dialogVisible.value = true
  nextTick(() => {
    if (editorRef.value) {
      editorRef.value.innerHTML = row.content || ''
    }
  })
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除文章"${row.title}"吗？`, '提示', { type: 'warning' })
    const res = await callCloudFunction('adminarticle', { action: 'delete', data: { id: row._id } }, token())
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

// 编辑器命令
const execCommand = (command, value = null) => {
  if (value) {
    document.execCommand(command, false, value)
  } else {
    document.execCommand(command, false, null)
  }
  editorRef.value?.focus()
}

// 处理编辑器输入
const handleEditorInput = () => {
  if (editorRef.value) {
    form.content = editorRef.value.innerHTML
  }
}

// 处理粘贴（去除格式，支持图片粘贴上传）
const handlePaste = async (e) => {
  e.preventDefault()
  
  // 检查是否有图片
  const items = e.clipboardData?.items
  if (items) {
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          await uploadImageFile(file)
          return
        }
      }
    }
  }
  
  // 默认粘贴纯文本
  const text = e.clipboardData.getData('text/plain')
  document.execCommand('insertText', false, text)
}

// 触发图片上传
const imageInputRef = ref(null)
const handleImageUpload = () => {
  imageInputRef.value?.click()
}

// 选择图片后上传
const handleImageFileSelect = async (e) => {
  const file = e.target.files?.[0]
  if (file) {
    await uploadImageFile(file)
    e.target.value = '' // 清空选择
  }
}

// 上传图片文件（前端直传COS）
const uploadImageFile = async (file) => {
  try {
    ElMessage.info('正在上传图片...')
    
    // 获取COS预签名URL
    const authRes = await callCloudFunction('generateCosSignature', {})
    
    const auth = authRes.result?.data || authRes.data
    if (!auth?.uploadUrl) {
      throw new Error(authRes.result?.error || '获取上传签名失败')
    }
    
    // 直接上传到COS
    const res = await fetch(auth.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'image/jpeg'
      },
      body: file
    })
    
    if (!res.ok) {
      throw new Error(`上传失败: ${res.status}`)
    }
    
    // 在编辑器中插入图片
    const imgHtml = `<img src="${auth.url}" style="max-width:100%;height:auto;" />`
    document.execCommand('insertHTML', false, imgHtml)
    ElMessage.success('图片上传成功')
  } catch (err) {
    console.error('上传图片失败', err)
    ElMessage.error('图片上传失败: ' + (err.message || ''))
  }
}

// 复制路径
const copyPath = async (path) => {
  try {
    await navigator.clipboard.writeText(path)
    ElMessage.success('路径已复制')
  } catch (err) {
    // 降级方案
    const input = document.createElement('input')
    input.value = path
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    ElMessage.success('路径已复制')
  }
}

// 提交
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
  } catch (err) {
    return
  }
  submitting.value = true
  try {
    // 路径自动生成：/article/{id} 或编辑时保留原路径
    const data = {
      title: form.title,
      content: form.content,
      status: form.status
    }
    
    let res
    if (editingId.value) {
      data.id = editingId.value
      res = await callCloudFunction('adminarticle', { action: 'update', data }, token())
    } else {
      res = await callCloudFunction('adminarticle', { action: 'add', data }, token())
    }
    
    const result = res.result || res
    if (result.success) {
      // 添加成功后，自动更新路径
      if (!editingId.value && result.id) {
        // 新增的文章，根据返回的ID生成路径并更新
        const newPath = `/article/${result.id}`
        await callCloudFunction('adminarticle', { 
          action: 'update', 
          data: { id: result.id, path: newPath } 
        }, token())
      }
      ElMessage.success(editingId.value ? '更新成功' : '添加成功')
      dialogVisible.value = false
      loadData()
    } else {
      ElMessage.error(result.error || '操作失败')
    }
  } catch (err) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.article-container { padding: 20px; }
.search-bar { background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 16px; }
.toolbar { margin-bottom: 16px; }
.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }

/* 路径单元格 */
.path-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.path-text {
  font-family: monospace;
  font-size: 12px;
  color: #666;
}
.copy-btn {
  padding: 4px !important;
}

/* 富文本编辑器 */
.rich-editor-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.editor-toolbar {
  background: #f5f7fa;
  padding: 8px;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.rich-editor-content {
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
  padding: 12px;
  font-size: 14px;
  line-height: 1.8;
  outline: none;
}

.rich-editor-content:empty:before {
  content: '请输入文章内容...';
  color: #c0c4cc;
}

.rich-editor-content:focus {
  outline: none;
}

/* 编辑器内样式 */
.rich-editor-content :deep(h2) {
  font-size: 18px;
  font-weight: bold;
  margin: 16px 0 8px;
}

.rich-editor-content :deep(p) {
  margin: 8px 0;
}

.rich-editor-content :deep(ul),
.rich-editor-content :deep(ol) {
  padding-left: 24px;
  margin: 8px 0;
}

.rich-editor-content :deep(li) {
  margin: 4px 0;
}
</style>
