<template>
  <div class="workflow-functions-container">
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>功能管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加功能
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="功能名称">
          <el-input v-model="searchForm.name" placeholder="输入名称搜索" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="工作流产品">
          <el-select v-model="searchForm.workflowProductId" placeholder="全部" clearable style="width: 160px" @change="handleSearch">
            <el-option
              v-for="wp in workflowProducts"
              :key="wp._id"
              :label="wp.name"
              :value="wp._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="行业">
          <el-input v-model="searchForm.industry" placeholder="输入行业搜索" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.isActive" placeholder="全部" clearable style="width: 100px" @change="handleSearch">
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
        <el-table-column label="功能名称" min-width="160">
          <template #default="{ row }">
            <span>{{ row.name }}</span>
            <el-tag v-if="!row.is_active" type="info" size="small" style="margin-left: 8px">已禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="功能描述" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="所属产品" min-width="140">
          <template #default="{ row }">
            {{ row.workflow_product_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="行业属性" min-width="160">
          <template #default="{ row }">
            <div class="industry-tags">
              <el-tag v-for="ind in (row.industries || []).slice(0, 3)" :key="ind" size="small" style="margin-right: 4px">{{ ind }}</el-tag>
              <span v-if="(row.industries || []).length > 3" style="color: #999; font-size: 12px">+{{ row.industries.length - 3 }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="生成价格" width="140" align="center">
          <template #default="{ row }">
            <div class="price-info">
              <span>付费: ¥{{ ((row.generate_price?.cash_price || 0) / 100).toFixed(2) }}</span>
              <span>余额: {{ ((row.generate_price?.balance_price || 0) / 100).toFixed(2) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="扩图价格" width="140" align="center">
          <template #default="{ row }">
            <template v-if="row.expand_price?.enabled">
              <div class="price-info">
                <span>付费: ¥{{ ((row.expand_price?.cash_price || 0) / 100).toFixed(2) }}</span>
                <span>余额: {{ ((row.expand_price?.balance_price || 0) / 100).toFixed(2) }}</span>
              </div>
            </template>
            <span v-else style="color: #999">不支持</span>
          </template>
        </el-table-column>
        <el-table-column label="主图" width="100" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.images?.thumbnail"
              :src="row.images.thumbnail"
              :preview-src-list="[row.images.fullsize || row.images.thumbnail]"
              fit="cover"
              style="width: 40px; height: 40px; border-radius: 4px; cursor: pointer"
            />
            <span v-else style="color: #999">-</span>
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="750px" @closed="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="功能名称" prop="name">
          <el-input v-model="form.name" placeholder="如：电商主图生成、人像精修" />
        </el-form-item>

        <el-form-item label="功能描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="简要描述功能特点" />
        </el-form-item>

        <el-form-item label="工作流产品" prop="workflowProductId">
          <el-select v-model="form.workflowProductId" placeholder="请选择工作流产品" filterable @change="handleWorkflowProductChange">
            <el-option
              v-for="wp in workflowProducts"
              :key="wp._id"
              :label="wp.name"
              :value="wp._id"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.workflowProductId && workflowProducts.find(w => w._id === form.workflowProductId)?.flow_steps?.step1_select_style" label="关联模板">
          <el-select v-model="form.templateId" placeholder="请选择关联模板（用于参考样图）" clearable style="width: 100%">
            <el-option
              v-for="t in templates"
              :key="t._id"
              :label="t.templateName"
              :value="t._id"
            />
          </el-select>
          <div style="color: #909399; font-size: 12px; margin-top: 4px">选择模板后，小程序将显示该模板的参考样图</div>
        </el-form-item>

        <el-form-item label="行业属性" prop="industries">
          <el-select v-model="form.industries" multiple placeholder="选择行业（可多选）" style="width: 100%">
            <el-option
              v-for="ind in industryOptions"
              :key="ind"
              :label="ind"
              :value="ind"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="生成图片价格">
          <div class="price-inputs">
            <el-input-number v-model="form.generatePrice.cashPrice" :min="0" :precision="2" placeholder="单次付费价" style="width: 140px" />
            <span style="margin: 0 8px">元</span>
            <el-input-number v-model="form.generatePrice.balancePrice" :min="0" :precision="2" placeholder="余额扣减" style="width: 140px" />
            <span style="margin: 0 8px">余额</span>
          </div>
        </el-form-item>

        <el-form-item label="扩图功能">
          <div class="expand-config">
            <el-checkbox v-model="form.expandPrice.enabled">启用扩图</el-checkbox>
            <template v-if="form.expandPrice.enabled">
              <div class="price-inputs" style="margin-top: 8px">
                <el-input-number v-model="form.expandPrice.cashPrice" :min="0" :precision="2" placeholder="单次付费价" style="width: 140px" />
                <span style="margin: 0 8px">元</span>
                <el-input-number v-model="form.expandPrice.balancePrice" :min="0" :precision="2" placeholder="余额扣减" style="width: 140px" />
                <span style="margin: 0 8px">余额</span>
              </div>
            </template>
          </div>
        </el-form-item>

        <el-form-item label="功能主图">
          <div class="image-uploads">
            <div class="image-upload-item">
              <span class="upload-label">小图（入口图）</span>
              <el-button type="primary" size="small" @click="triggerUpload('thumbnail')">
                <el-icon><Upload /></el-icon> 选择图片
              </el-button>
              <el-image v-if="form.images.thumbnail" :src="form.images.thumbnail" fit="cover" style="width: 60px; height: 60px; margin-left: 12px; border-radius: 4px; vertical-align: middle" />
              <el-button v-if="form.images.thumbnail" type="danger" size="small" link @click="form.images.thumbnail = ''">删除</el-button>
              <span v-if="uploading.thumbnail" style="margin-left: 12px; color: #409eff">上传中...</span>
              <input ref="thumbnailInput" type="file" accept="image/*" style="display: none" @change="handleFileChange($event, 'thumbnail')" />
            </div>
            <div class="image-upload-item">
              <span class="upload-label">大图（头图）</span>
              <el-button type="primary" size="small" @click="triggerUpload('fullsize')">
                <el-icon><Upload /></el-icon> 选择图片
              </el-button>
              <el-image v-if="form.images.fullsize" :src="form.images.fullsize" fit="cover" style="width: 60px; height: 60px; margin-left: 12px; border-radius: 4px; vertical-align: middle" />
              <el-button v-if="form.images.fullsize" type="danger" size="small" link @click="form.images.fullsize = ''">删除</el-button>
              <span v-if="uploading.fullsize" style="margin-left: 12px; color: #409eff">上传中...</span>
              <input ref="fullsizeInput" type="file" accept="image/*" style="display: none" @change="handleFileChange($event, 'fullsize')" />
            </div>
          </div>
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
            <span style="margin-left: 8px; color: #999; font-size: 12px">多张样图在小程序生成页顶部展示</span>
            <input ref="referenceImageInput" type="file" accept="image/*" style="display: none" @change="handleFileChange($event, 'referenceImage')" />
          </div>
        </el-form-item>

        <el-form-item label="可选尺寸">
          <div class="size-options">
            <el-checkbox-group v-model="form.selectedSizes">
              <div v-for="category in ['线上图', '线下图']" :key="category" class="size-category">
                <div class="size-category-title">{{ category }}</div>
                <div class="size-category-items">
                  <el-checkbox v-for="size in getSizesByCategory(category)" :key="size._id" :label="size._id" :disabled="!size.is_enabled">
                    {{ size.name }}
                  </el-checkbox>
                </div>
              </div>
            </el-checkbox-group>
          </div>
        </el-form-item>

        <el-form-item label="启用状态">
          <el-switch v-model="form.isActive" />
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
import { Plus, Upload } from '@element-plus/icons-vue'
import api from '@/api'

export default {
  name: 'WorkflowFunctions',
  components: { Plus, Upload },
  setup() {
    const store = useStore()
    const loading = ref(false)
    const tableData = ref([])
    const dialogVisible = ref(false)
    const dialogTitle = ref('添加功能')
    const submitLoading = ref(false)
    const formRef = ref(null)
    const workflowProducts = ref([])
    const templates = ref([])
    const currentEditId = ref(null)
    const thumbnailInput = ref(null)
    const fullsizeInput = ref(null)
    const referenceImageInput = ref(null)
    const currentUploadField = ref('')
    const uploading = reactive({
      thumbnail: false,
      fullsize: false,
      referenceImage: false
    })

    // 可选尺寸列表
    const sizeList = ref([])

    const industryOptions = [
      '电商', '美妆', '建筑', '家居', '餐饮', '医疗', '教育', '金融',
      '旅游', '娱乐', '汽车', '房产', '服装', '食品', '科技', '其他'
    ]

    const searchForm = reactive({
      name: '',
      workflowProductId: '',
      industry: '',
      isActive: ''
    })

    const pagination = reactive({
      page: 1,
      pageSize: 10,
      total: 0
    })

    const form = reactive({
      name: '',
      description: '',
      workflowProductId: '',
      workflowProductName: '',
      templateId: '',
      industries: [],
      generatePrice: { cashPrice: 0, balancePrice: 0 },
      expandPrice: { enabled: false, cashPrice: 0, balancePrice: 0 },
      images: { thumbnail: '', fullsize: '' },
      referenceImages: [],
      selectedSizes: [],
      isActive: true
    })

    const rules = {
      name: [{ required: true, message: '请输入功能名称', trigger: 'blur' }],
      workflowProductId: [{ required: true, message: '请选择工作流产品', trigger: 'change' }]
    }

    const loadData = async () => {
      loading.value = true

      try {
        const token = store.state.token
        const res = await api.getWorkflowFunctions({
          page: pagination.page,
          pageSize: pagination.pageSize,
          name: searchForm.name || undefined,
          workflowProductId: searchForm.workflowProductId || undefined,
          industry: searchForm.industry || undefined,
          isActive: searchForm.isActive !== '' ? searchForm.isActive : undefined
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

    const loadWorkflowProducts = async () => {
      try {
        const token = store.state.token
        const res = await api.getWorkflowProducts({ page: 1, pageSize: 100 }, token)
        const result = res.result || res
        if (result.success) {
          workflowProducts.value = result.data || []
        }
      } catch (err) {
        console.error('获取工作流产品失败:', err)
      }
    }

    // 加载尺寸列表
    const loadSizeList = async () => {
      try {
        const token = store.state.token
        const res = await api.getGenerateSizes({ page: 1, pageSize: 100 }, token)
        const result = res.result || res
        if (result.success) {
          sizeList.value = result.data || []
        }
      } catch (err) {
        console.error('获取尺寸列表失败:', err)
      }
    }

    // 按分类获取尺寸
    const getSizesByCategory = (category) => {
      return sizeList.value.filter(s => s.category === category)
    }

    // 删除参考图
    const removeReferenceImage = (index) => {
      form.referenceImages.splice(index, 1)
    }

    const handleSearch = () => {
      pagination.page = 1
      loadData()
    }

    const handleReset = () => {
      searchForm.name = ''
      searchForm.workflowProductId = ''
      searchForm.industry = ''
      searchForm.isActive = ''
      handleSearch()
    }

    const handleAdd = () => {
      dialogTitle.value = '添加功能'
      currentEditId.value = null
      resetForm()
      dialogVisible.value = true
      loadWorkflowProducts()
    }

    const handleEdit = (row) => {
      dialogTitle.value = '编辑功能'
      currentEditId.value = row._id
      loadWorkflowProducts().then(async () => {
        form.name = row.name
        form.description = row.description || ''
        form.workflowProductId = row.workflow_product_id
        form.workflowProductName = row.workflow_product_name || ''
        form.templateId = row.template_id || ''
        form.industries = row.industries || []
        form.generatePrice = {
          cashPrice: (row.generate_price?.cash_price || 0) / 100,
          balancePrice: (row.generate_price?.balance_price || 0) / 100
        }
        form.expandPrice = {
          enabled: row.expand_price?.enabled || false,
          cashPrice: (row.expand_price?.cash_price || 0) / 100,
          balancePrice: (row.expand_price?.balance_price || 0) / 100
        }
        form.images = {
          thumbnail: row.images?.thumbnail || '',
          fullsize: row.images?.fullsize || ''
        }
        form.referenceImages = row.reference_images || []
        form.selectedSizes = row.selected_sizes || []
        form.isActive = row.is_active !== false
        
        // 如果有模板选择页，加载模板列表
        const wp = workflowProducts.value.find(w => w._id === row.workflow_product_id)
        if (wp?.flow_steps?.step1_select_style) {
          await loadTemplates()
        }
      })
      dialogVisible.value = true
    }

    const handleWorkflowProductChange = (productId) => {
      const wp = workflowProducts.value.find(w => w._id === productId)
      if (wp) {
        form.workflowProductName = wp.name
        // 如果工作流产品包含扩图流程，默认启用扩图价格
        if (wp.flow_steps?.step4_resize && !form.expandPrice.enabled) {
          form.expandPrice.enabled = true
        }
        // 如果有 step1（模板选择页），加载模板列表
        if (wp.flow_steps?.step1_select_style) {
          loadTemplates()
        } else {
          form.templateId = ''
          templates.value = []
        }
      }
    }

    // 加载模板列表
    const loadTemplates = async () => {
      try {
        const token = store.state.token
        const res = await api.getTemplates({ page: 1, pageSize: 500, status: 'enabled' }, token)
        const result = res.result || res
        if (result.success) {
          templates.value = result.list || []
        }
      } catch (err) {
        console.error('加载模板列表失败:', err)
      }
    }

    const triggerUpload = (field) => {
      currentUploadField.value = field
      if (field === 'thumbnail') {
        thumbnailInput.value?.click()
      } else if (field === 'fullsize') {
        fullsizeInput.value?.click()
      } else if (field === 'referenceImage') {
        referenceImageInput.value?.click()
      }
    }

    const handleFileChange = async (event, field) => {
      const file = event.target.files?.[0]
      if (!file) return

      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        ElMessage.error('请选择图片文件')
        return
      }

      // 验证文件大小（限制5MB）
      if (file.size > 5 * 1024 * 1024) {
        ElMessage.error('图片大小不能超过5MB')
        return
      }

      uploading[field] = true

      try {
        const token = store.state.token
        const res = await api.uploadImage(file, token)
        const result = res.result || res

        if (result.success) {
          if (field === 'referenceImage') {
            // 参考图多图追加
            form.referenceImages.push(result.url)
          } else {
            form.images[field] = result.url
          }
          ElMessage.success('上传成功')
        } else {
          ElMessage.error(result.error || '上传失败')
        }
      } catch (err) {
        console.error('上传失败:', err)
        ElMessage.error('上传失败')
      } finally {
        uploading[field] = false
        // 清空 input 值，允许重复选择同一文件
        event.target.value = ''
      }
    }

    const resetForm = () => {
      form.name = ''
      form.description = ''
      form.workflowProductId = ''
      form.workflowProductName = ''
      form.templateId = ''
      form.industries = []
      form.generatePrice = { cashPrice: 0, balancePrice: 0 }
      form.expandPrice = { enabled: false, cashPrice: 0, balancePrice: 0 }
      form.images = { thumbnail: '', fullsize: '' }
      form.referenceImages = []
      form.selectedSizes = []
      templates.value = []
      form.isActive = true
      formRef.value?.resetFields()
    }

    const handleSubmit = async () => {
      const valid = await formRef.value.validate().catch(() => false)
      if (!valid) return

      submitLoading.value = true

      try {
        const token = store.state.token
        const data = {
          name: form.name,
          description: form.description,
          workflowProductId: form.workflowProductId,
          workflowProductName: form.workflowProductName,
          templateId: form.templateId || '',
          industries: form.industries,
          generatePrice: {
            cash_price: Math.round(form.generatePrice.cashPrice * 100),
            balance_price: Math.round(form.generatePrice.balancePrice * 100)
          },
          expandPrice: {
            enabled: form.expandPrice.enabled,
            cash_price: Math.round(form.expandPrice.cashPrice * 100),
            balance_price: Math.round(form.expandPrice.balancePrice * 100)
          },
          images: form.images,
          referenceImages: form.referenceImages,
          selectedSizes: form.selectedSizes,
          isActive: form.isActive
        }

        let res
        if (currentEditId.value) {
          res = await api.updateWorkflowFunction({ id: currentEditId.value, ...data }, token)
        } else {
          res = await api.createWorkflowFunction(data, token)
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
        await ElMessageBox.confirm(`确定要删除功能"${row.name}"吗？`, '提示', {
          type: 'warning'
        })

        const token = store.state.token
        const res = await api.deleteWorkflowFunction(row._id, token)
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
      loadWorkflowProducts()
      loadSizeList()
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
      workflowProducts,
      templates,
      industryOptions,
      uploading,
      sizeList,
      getSizesByCategory,
      removeReferenceImage,
      thumbnailInput,
      fullsizeInput,
      referenceImageInput,
      loadData,
      loadTemplates,
      handleSearch,
      handleReset,
      handleAdd,
      handleEdit,
      handleWorkflowProductChange,
      triggerUpload,
      handleFileChange,
      handleSubmit,
      handleDelete,
      formatDate
    }
  }
}
</script>

<style scoped>
.workflow-functions-container {
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

.industry-tags {
  display: flex;
  flex-wrap: wrap;
}

.price-info {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: #666;
}

.price-info span {
  line-height: 1.5;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.price-inputs {
  display: flex;
  align-items: center;
}

.expand-config {
  display: flex;
  flex-direction: column;
}

.image-uploads {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-upload-item {
  display: flex;
  align-items: center;
}

.upload-label {
  width: 100px;
  color: #666;
}

.reference-images {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  padding: 0;
}

.size-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.size-category {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.size-category-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.size-category-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-left: 8px;
}
</style>
