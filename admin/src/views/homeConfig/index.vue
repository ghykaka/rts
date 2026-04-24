<template>
  <div class="home-config">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>首页配置</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 添加组件
          </el-button>
        </div>
      </template>

      <!-- 组件列表 -->
      <el-table :data="tableData" border v-loading="loading" row-key="_id">
        <el-table-column prop="order" label="排序" width="130">
          <template #header>
            排序
            <el-button size="small" type="primary" @click="handleSaveAllOrder" :loading="savingOrder" style="margin-left: 8px;">保存</el-button>
          </template>
          <template #default="{ row }">
            <el-input-number 
              v-model="row.order" 
              :min="1" 
              size="small"
              controls-position="right"
            />
          </template>
        </el-table-column>
        <el-table-column prop="componentType" label="组件类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.typeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="150">
          <template #default="{ row }">
            <span v-if="row.title">{{ row.title }}</span>
            <span v-else style="color: #999;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="itemsCount" label="内容数" width="80" align="center" />
        <el-table-column prop="params" label="参数" width="150">
          <template #default="{ row }">
            <span v-if="row.componentType === 'banner' && row.params?.height">
              高度: {{ row.params.height }}px
            </span>
            <span v-else-if="row.componentType === 'imageGrid' && row.params?.columns">
              {{ row.params.columns }}列
            </span>
            <span v-else style="color: #999;">-</span>
          </template>
        </el-table-column>
        <el-table-column label="已配置内容" min-width="300">
          <template #default="{ row }">
            <template v-if="row.componentType === 'userInfo'">
              <span style="color: #909399;">固定组件，无需配置</span>
            </template>
            <template v-else-if="row.componentType === 'waterfall'">
              <span style="color: #909399;">自动显示首页推荐模板</span>
            </template>
            <template v-else-if="row.items && row.items.length > 0">
              <div class="items-preview">
                <span v-for="(item, idx) in row.items.slice(0, 3)" :key="idx" class="preview-tag">
                  {{ item.title || '无标题' }}
                </span>
                <span v-if="row.items.length > 3" class="more-count">+{{ row.items.length - 3 }}</span>
              </div>
            </template>
            <span v-else style="color: #f56c6c;">未配置</span>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch 
              v-model="row.enabled" 
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link size="small" @click="handleConfigItems(row)">配置内容</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="组件类型" prop="componentType">
          <el-select v-model="form.componentType" placeholder="请选择组件类型" :disabled="!!editingId">
            <el-option value="userInfo" label="用户信息" />
            <el-option value="banner" label="轮播图" />
            <el-option value="iconGrid" label="金刚区入口" />
            <el-option value="imageGrid" label="图片网格" />
            <el-option value="waterfall" label="瀑布流" />
          </el-select>
        </el-form-item>
        
        <el-form-item v-if="form.componentType === 'waterfall' || form.componentType === 'iconGrid'" label="组件标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入组件标题" maxlength="50" />
        </el-form-item>
        
        <el-form-item v-if="form.componentType === 'banner'" label="轮播高度" prop="height">
          <el-input-number v-model="form.params.height" :min="100" :max="400" :step="10" />
          <span style="margin-left: 8px; color: #999;">px</span>
        </el-form-item>
        
        <el-form-item v-if="form.componentType === 'imageGrid'" label="列数" prop="columns">
          <el-radio-group v-model="form.params.columns">
            <el-radio :value="1">一行1个</el-radio>
            <el-radio :value="2">一行2个</el-radio>
            <el-radio :value="3">一行3个</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="启用状态">
          <el-switch v-model="form.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 配置内容弹窗 -->
    <el-dialog v-model="itemsDialogVisible" :title="`配置内容 - ${currentRow?.typeName || ''}`" width="1000px" destroy-on-close>
      <div class="items-config">
        <!-- 轮播图/图片网格 -->
        <div v-if="currentRow?.componentType === 'banner' || currentRow?.componentType === 'imageGrid'" class="items-list">
          <div v-for="(item, index) in itemsForm" :key="index" class="item-card">
            <el-form label-width="80px" size="small">
              <el-form-item label="图片">
                <div class="image-upload">
                  <el-input v-model="item.image" placeholder="图片链接" />
                  <el-button @click="handleImageUpload(item)" style="margin-left: 8px;">上传</el-button>
                </div>
                <div v-if="item.image" class="image-preview">
                  <img :src="item.image" alt="" />
                </div>
              </el-form-item>
              <el-form-item label="标题">
                <el-input v-model="item.title" placeholder="请输入标题" maxlength="20" />
              </el-form-item>
              <el-form-item label="跳转类型">
                <el-select v-model="item.linkType" placeholder="请选择" style="width: 100%;">
                  <el-option value="function" label="功能产品页" />
                  <el-option value="template" label="模板详情" />
                </el-select>
              </el-form-item>
              <el-form-item label="跳转目标" v-if="item.linkType === 'function'">
                <el-select 
                  v-model="item.linkValue" 
                  placeholder="搜索功能产品" 
                  filterable
                  remote
                  :remote-method="(query) => searchProducts(query, item)"
                  :loading="item.loadingProducts"
                  style="width: 100%;"
                  @focus="loadProductOptions(item)"
                  clearable
                >
                  <el-option 
                    v-for="func in item.productOptions || []" 
                    :key="func.value" 
                    :label="func.label" 
                    :value="func.value" 
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="跳转目标" v-if="item.linkType === 'template'">
                <el-select 
                  v-model="item.linkValue" 
                  placeholder="搜索模板" 
                  filterable
                  remote
                  :remote-method="(query) => searchTemplates(query, item)"
                  :loading="item.loadingTemplates"
                  style="width: 100%;"
                  @focus="loadTemplateOptionsLazy(item)"
                  clearable
                >
                  <el-option 
                    v-for="t in item.templateOptions || []" 
                    :key="t._id" 
                    :label="`${t.templateCode || ''} - ${t.templateName}`" 
                    :value="t._id" 
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="danger" @click="removeItem(index)" size="small">删除</el-button>
              </el-form-item>
            </el-form>
          </div>
          <el-button type="dashed" @click="addItem" style="width: 100%;">
            <el-icon><Plus /></el-icon> 添加
          </el-button>
        </div>
        
        <!-- 金刚区 -->
        <div v-if="currentRow?.componentType === 'iconGrid'" class="items-list icon-grid">
          <div v-if="itemsForm.length > 5" class="tips">最多添加5个入口</div>
          <div v-for="(item, index) in itemsForm.slice(0, 5)" :key="index" class="item-card icon-item">
            <el-form label-width="60px" size="small">
              <el-form-item label="图标">
                <div class="image-upload">
                  <el-input v-model="item.image" placeholder="图标链接" />
                  <el-button @click="handleImageUpload(item)" style="margin-left: 8px;">上传</el-button>
                </div>
                <div v-if="item.image" class="image-preview small">
                  <img :src="item.image" alt="" />
                </div>
              </el-form-item>
              <el-form-item label="名称">
                <el-input v-model="item.title" placeholder="名称" maxlength="10" />
              </el-form-item>
              <el-form-item label="跳转">
                <el-select v-model="item.linkType" placeholder="类型" style="width: 100%;">
                  <el-option value="function" label="功能页" />
                  <el-option value="template" label="模板" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="item.linkType === 'function'">
                <el-select 
                  v-model="item.linkValue" 
                  placeholder="搜索功能产品" 
                  filterable
                  remote
                  :remote-method="(query) => searchProducts(query, item)"
                  :loading="item.loadingProducts"
                  style="width: 100%;"
                  @focus="loadProductOptions(item)"
                  clearable
                >
                  <el-option 
                    v-for="func in item.productOptions || []" 
                    :key="func.value" 
                    :label="func.label" 
                    :value="func.value" 
                  />
                </el-select>
              </el-form-item>
              <el-form-item v-if="item.linkType === 'template'">
                <el-select 
                  v-model="item.linkValue" 
                  placeholder="搜索模板" 
                  filterable
                  remote
                  :remote-method="(query) => searchTemplates(query, item)"
                  :loading="item.loadingTemplates"
                  style="width: 100%;"
                  @focus="loadTemplateOptionsLazy(item)"
                  clearable
                >
                  <el-option 
                    v-for="t in item.templateOptions || []" 
                    :key="t._id" 
                    :label="`${t.templateCode || ''} - ${t.templateName}`" 
                    :value="t._id" 
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="danger" @click="removeItem(index)" size="small">删除</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div v-if="itemsForm.length < 5" class="add-more">
            <el-button type="dashed" @click="addIconItem">+ 添加入口</el-button>
          </div>
        </div>
        
        <!-- 瀑布流提示 -->
        <div v-if="currentRow?.componentType === 'waterfall'" class="waterfall-tips">
          <el-alert type="info" :closable="false">
            瀑布流组件会自动显示「首页推荐」的模板数据。
            <br />请在「模板管理」中设置模板的「首页推荐」状态。
          </el-alert>
        </div>
      </div>
      <template #footer>
        <el-button @click="itemsDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSaveItems">保存内容</el-button>
      </template>
    </el-dialog>

    <!-- 图片上传弹窗 -->
    <el-dialog v-model="imageDialogVisible" title="上传图片" width="400px">
      <el-upload
        class="upload-demo"
        :auto-upload="false"
        :show-file-list="false"
        accept="image/*"
        :on-change="handleFileChange"
      >
        <img v-if="previewImage" :src="previewImage" class="preview-img" />
        <el-button v-else type="primary">选择图片</el-button>
      </el-upload>
      <template #footer>
        <el-button @click="imageDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="handleUploadImage">上传</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import api from '@/api'
import { callCloudFunction, callCloudFunctionDirect } from '@/api'
import store from '@/store'
import { compressImage } from '@/utils/image'

const token = () => store.state.token

const tableData = ref([])
const loading = ref(false)
const submitting = ref(false)
const savingOrder = ref(false)
const dialogVisible = ref(false)
const itemsDialogVisible = ref(false)
const editingId = ref('')
const dialogTitle = ref('添加组件')
const formRef = ref(null)
const currentRow = ref(null)
const itemsForm = ref([])
const templateOptions = ref([])

// 功能页面选项（固定列表）
const functionPages = [
  { value: '/pages/product/list', label: '功能产品列表' },
  { value: '/pages/template/list', label: '模板列表' },
  { value: '/pages/article/list', label: '文章列表' }
]

// 加载功能页面选项
const loadFunctionPages = (item) => {
  if (!item.functionOptions) {
    item.functionOptions = [...functionPages]
  }
}

// 搜索功能页面
const searchFunctionPages = (query, item) => {
  if (!query) {
    item.functionOptions = [...functionPages]
  } else {
    item.functionOptions = functionPages.filter(f => 
      f.label.toLowerCase().includes(query.toLowerCase())
    )
  }
}

// 懒加载模板选项
const loadTemplateOptionsLazy = async (item) => {
  if (item.templateOptions && item.templateOptions.length > 0 && !item._isSearching) return
  item.loadingTemplates = true
  try {
    const res = await api.getTemplates({ page: 1, pageSize: 100 }, token())
    const result = res.result || res
    if (result.success) {
      // 后端返回的是 result.list
      const list = result.list || []
      item._allTemplateOptions = list // 保存完整列表用于搜索
      if (!item._isSearching) {
        item.templateOptions = list
      }
    }
  } catch (err) {
    console.error('加载模板失败', err)
  } finally {
    item.loadingTemplates = false
  }
}

// 表单
const form = reactive({
  componentType: '',
  title: '',
  enabled: true,
  params: {}
})

const formRules = {
  componentType: [{ required: true, message: '请选择组件类型', trigger: 'change' }]
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await api.getHomeConfigs(token())
    const result = res.result || res
    if (result.success) {
      tableData.value = result.list || []
    }
  } catch (err) {
    console.error('加载失败', err)
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 加载模板选项
const loadTemplateOptions = async () => {
  try {
    const res = await api.getTemplates(token())
    const result = res.result || res
    if (result.success) {
      templateOptions.value = result.list || []
    }
  } catch (err) {
    console.error('加载模板失败', err)
  }
}

// 新增
const handleAdd = () => {
  editingId.value = ''
  dialogTitle.value = '添加组件'
  Object.assign(form, {
    componentType: '',
    title: '',
    enabled: true,
    params: {}
  })
  dialogVisible.value = true
}

// 编辑基本信息
const handleEdit = (row) => {
  editingId.value = row._id
  dialogTitle.value = '编辑组件'
  Object.assign(form, {
    componentType: row.componentType,
    title: row.title || '',
    enabled: row.enabled,
    params: { ...row.params }
  })
  dialogVisible.value = true
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
    const data = {
      componentType: form.componentType,
      title: form.title,
      enabled: form.enabled,
      params: form.params
    }
    
    let res
    if (editingId.value) {
      data.id = editingId.value
      res = await api.updateHomeConfig(data, token())
    } else {
      res = await api.addHomeConfig(data, token())
    }
    
    const result = res.result || res
    if (result.success) {
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

// 配置内容
const handleConfigItems = async (row) => {
  currentRow.value = row
  // 为每个子项添加选项数据
  itemsForm.value = (row.items || []).map(item => ({
    ...item,
    functionOptions: [...functionPages],
    templateOptions: [],
    productOptions: [],
    _allTemplateOptions: [],
    _allProductOptions: [],
    _isSearching: false,
    _isSearchingProducts: false,
    loadingFunctions: false,
    loadingTemplates: false,
    loadingProducts: false
  }))
  itemsDialogVisible.value = true
}

// 添加子项
const addItem = () => {
  if (currentRow.value?.componentType === 'iconGrid' && itemsForm.value.length >= 5) {
    ElMessage.warning('最多添加5个入口')
    return
  }
  itemsForm.value.push({
    image: '',
    title: '',
    linkType: 'function',
    linkValue: '',
    functionOptions: [...functionPages],
    templateOptions: [],
    productOptions: [],
    _allTemplateOptions: [],
    _allProductOptions: [],
    _isSearching: false,
    _isSearchingProducts: false,
    loadingFunctions: false,
    loadingTemplates: false,
    loadingProducts: false
  })
}

// 加载功能选项
const loadProductOptions = async (item) => {
  if (item.productOptions && item.productOptions.length > 0 && !item._isSearchingProducts) return
  item.loadingProducts = true
  try {
    const res = await api.getFunctionList(token())
    const result = res.result || res
    if (result.success) {
      const list = (result.data || []).map(func => ({
        _id: func._id,
        name: func.name,
        value: func._id,
        label: func.name
      }))
      item._allProductOptions = list // 保存完整列表用于搜索
      if (!item._isSearchingProducts) {
        item.productOptions = list
      }
    }
  } catch (err) {
    console.error('加载功能列表失败', err)
  } finally {
    item.loadingProducts = false
  }
}

// 搜索功能
const searchProducts = (query, item) => {
  if (!query) {
    // 清空搜索时重新加载
    item._isSearchingProducts = false
    item.productOptions = []
    loadProductOptions(item)
  } else if (item._allProductOptions && item._allProductOptions.length > 0) {
    // 在已加载的数据中过滤
    item._isSearchingProducts = true
    const lowerQuery = query.toLowerCase()
    item.productOptions = item._allProductOptions.filter(p => 
      p.name && p.name.toLowerCase().includes(lowerQuery)
    )
  }
}

// 搜索模板
const searchTemplates = (query, item) => {
  if (!query) {
    // 清空搜索时重新加载
    item.templateOptions = []
    loadTemplateOptionsLazy(item)
  } else if (item.templateOptions && item.templateOptions.length > 0) {
    // 在已加载的数据中过滤
    const lowerQuery = query.toLowerCase()
    const allOptions = item._allTemplateOptions || item.templateOptions
    if (!item._allTemplateOptions) {
      item._allTemplateOptions = [...item.templateOptions]
    }
    item.templateOptions = allOptions.filter(t => 
      (t.templateName && t.templateName.toLowerCase().includes(lowerQuery)) ||
      (t.templateCode && String(t.templateCode).includes(lowerQuery))
    )
  }
}

const addIconItem = () => {
  if (itemsForm.value.length < 5) {
    itemsForm.value.push({
      image: '',
      title: '',
      linkType: 'function',
      linkValue: ''
    })
  }
}

const removeItem = (index) => {
  itemsForm.value.splice(index, 1)
}

// 保存内容
const handleSaveItems = async () => {
  submitting.value = true
  try {
    const res = await api.updateHomeConfig({
      id: currentRow.value._id,
      items: itemsForm.value
    }, token())
    
    const result = res.result || res
    if (result.success) {
      ElMessage.success('保存成功')
      itemsDialogVisible.value = false
      loadData()
    } else {
      ElMessage.error(result.error || '保存失败')
    }
  } catch (err) {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除该组件吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await api.deleteHomeConfig(row._id, token())
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

// 更新排序
const handleOrderChange = async (row) => {
  try {
    await api.updateHomeConfigOrder([{ id: row._id, order: row.order }], token())
  } catch (err) {
    ElMessage.error('更新排序失败')
    loadData()
  }
}

// 保存所有排序
const handleSaveAllOrder = async () => {
  savingOrder.value = true
  try {
    const orders = tableData.value.map(row => ({ id: row._id, order: row.order }))
    const res = await api.updateHomeConfigOrder(orders, token())
    const result = res.result || res
    if (result.success) {
      ElMessage.success('保存成功')
      loadData()
    } else {
      ElMessage.error(result.error || '保存失败')
    }
  } catch (err) {
    ElMessage.error('保存失败')
  } finally {
    savingOrder.value = false
  }
}

// 更新状态
const handleStatusChange = async (row) => {
  try {
    await api.updateHomeConfig({ id: row._id, enabled: row.enabled }, token())
  } catch (err) {
    ElMessage.error('更新状态失败')
    loadData()
  }
}

// ============ 图片上传 ============
const imageDialogVisible = ref(false)
const uploading = ref(false)
const previewImage = ref('')
const currentUploadItem = ref(null)
const imageFile = ref(null)

const handleImageUpload = (item) => {
  currentUploadItem.value = item
  previewImage.value = ''
  imageFile.value = null
  imageDialogVisible.value = true
}

const handleFileChange = (file) => {
  const rawFile = file.raw
  if (!rawFile) return
  
  // 预览
  const reader = new FileReader()
  reader.onload = (e) => {
    previewImage.value = e.target.result
  }
  reader.readAsDataURL(rawFile)
  imageFile.value = rawFile
}

const handleUploadImage = async () => {
  if (!imageFile.value) {
    ElMessage.warning('请选择图片')
    return
  }
  
  uploading.value = true
  try {
    // 压缩图片
    const compressed = await compressImage(imageFile.value)
    
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
        'Content-Type': compressed.type || 'image/jpeg'
      },
      body: compressed
    })
    
    if (!res.ok) {
      throw new Error(`上传失败: ${res.status}`)
    }
    
    if (currentUploadItem.value) {
      currentUploadItem.value.image = auth.url
    }
    ElMessage.success('上传成功')
    imageDialogVisible.value = false
  } catch (err) {
    console.error('上传失败', err)
    ElMessage.error('上传失败: ' + (err.message || ''))
  } finally {
    uploading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.home-config {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.items-config {
  min-height: 300px;
}

.items-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.preview-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #ecf5ff;
  color: #409eff;
  border-radius: 4px;
  font-size: 12px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.more-count {
  color: #909399;
  font-size: 12px;
}

.items-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.item-card {
  width: calc(50% - 8px);
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 4px;
  background: #fafafa;
}

.icon-item {
  width: calc(50% - 8px);
  min-width: 300px;
}

.image-upload {
  display: flex;
}

.image-preview {
  margin-top: 8px;
  max-height: 100px;
  overflow: hidden;
}

.image-preview.small {
  max-height: 50px;
}

.image-preview img {
  max-width: 100%;
  max-height: 100px;
  object-fit: contain;
}

.icon-grid {
  display: flex;
  flex-wrap: wrap;
}

.tips {
  width: 100%;
  color: #f56c6c;
  font-size: 12px;
  margin-bottom: 8px;
}

.add-more {
  width: calc(20% - 8px);
  min-width: 150px;
}

.waterfall-tips {
  margin-top: 20px;
}

.preview-img {
  max-width: 100%;
  max-height: 300px;
  display: block;
  margin: 0 auto;
}
</style>
