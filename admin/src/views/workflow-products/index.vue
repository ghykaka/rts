<template>
  <div class="workflow-products-container">
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>工作流产品管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加产品
          </el-button>
        </div>
      </template>
      
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="产品名称">
          <el-input v-model="searchForm.name" placeholder="输入名称搜索" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.isActive" placeholder="全部" clearable style="width: 120px">
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
        <el-table-column label="产品名称" min-width="140">
          <template #default="{ row }">
            <span>{{ row.name }}</span>
            <el-tag v-if="!row.is_active" type="info" size="small" style="margin-left: 8px">已禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="关联工作流" min-width="140">
          <template #default="{ row }">
            {{ row.coze_workflow_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="输入字段" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ (row.input_fields || []).length }} 个</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="使用流程" min-width="280">
          <template #default="{ row }">
            <div class="flow-steps">
              <span v-if="row.flow_steps?.step1_select_style" class="step-tag">选择模板</span>
              <span v-if="row.flow_steps?.step2_materials" class="step-tag">素材列表</span>
              <span v-if="row.flow_steps?.step3_input" class="step-tag">输入生成</span>
              <span v-if="row.flow_steps?.step4_resize" class="step-tag">尺寸缩放</span>
              <span v-if="!row.flow_steps?.step1_select_style && !row.flow_steps?.step2_materials && !row.flow_steps?.step3_input && !row.flow_steps?.step4_resize">默认流程</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" @closed="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px">
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="form.name" placeholder="如：自由创作图片、自由创作视频" />
        </el-form-item>
        
        <el-form-item label="关联工作流" prop="cozeWorkflowId">
          <el-select v-model="form.cozeWorkflowId" placeholder="请选择工作流" filterable @change="handleWorkflowChange">
            <el-option
              v-for="wf in workflowList"
              :key="wf.workflow_id"
              :label="wf.workflow_name"
              :value="wf.workflow_id"
            />
          </el-select>
          <el-button v-if="form.cozeWorkflowId" type="primary" link @click="syncWorkflowParams" :loading="syncingParams" style="margin-left: 10px">
            {{ syncingParams ? '同步中...' : '同步参数' }}
          </el-button>
        </el-form-item>
        
        <el-form-item label="固定字段映射">
          <div class="input-fields-config">
            <div class="field-tip">配置从模板/素材/尺寸表读取的字段，映射到COZE工作流输入参数</div>
            <div v-for="(field, index) in form.fixedFieldMappings" :key="index" class="field-item">
              <el-select v-model="field.sourceTable" placeholder="来源表" style="width: 130px" @change="onSourceTableChange(field)">
                <el-option label="模板表" value="templates" />
                <el-option label="素材表" value="materials" />
                <el-option label="尺寸表" value="generate_sizes" />
              </el-select>
              <el-select v-model="field.sourceField" placeholder="源字段" style="width: 130px">
                <el-option
                  v-for="f in getSourceFieldOptions(field.sourceTable)"
                  :key="f.key"
                  :label="f.label"
                  :value="f.key"
                />
              </el-select>
              <el-input v-model="field.targetField" placeholder="COZE字段名" style="width: 120px" />
              <el-button type="danger" link @click="removeFixedField(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button type="primary" link @click="addFixedField">
              <el-icon><Plus /></el-icon> 添加映射
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="用户输入字段">
          <div class="input-fields-config">
            <div class="field-tip">配置用户在小程序中输入的字段（如文案、图片等）</div>
            <div v-for="(field, index) in form.inputFields" :key="index" class="field-item">
              <el-input v-model="field.fieldName" placeholder="显示名称" style="width: 140px" />
              <el-input v-model="field.fieldKey" placeholder="参数名" style="width: 100px" />
              <el-select v-model="field.fieldType" placeholder="类型" style="width: 100px">
                <el-option label="单行文本" value="text" />
                <el-option label="多行文本" value="textarea" />
                <el-option label="数字" value="number" />
                <el-option label="图片" value="image" />
              </el-select>
              <el-input-number v-model="field.maxLength" :min="1" :max="500" placeholder="最大长度" style="width: 90px" />
              <el-checkbox v-model="field.isRequired">必填</el-checkbox>
              <el-button type="danger" link @click="removeField(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button type="primary" link @click="addField">
              <el-icon><Plus /></el-icon> 添加字段
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="输出字段配置">
          <div class="input-fields-config">
            <div class="field-tip">配置工作流输出的字段，用于前端展示生成结果</div>
            <div v-for="(field, index) in form.outputFields" :key="index" class="field-item">
              <el-input v-model="field.fieldName" placeholder="显示名称" style="width: 140px" />
              <el-input v-model="field.fieldKey" placeholder="输出变量名" style="width: 120px" />
              <el-select v-model="field.fieldType" placeholder="类型" style="width: 100px">
                <el-option label="图片" value="image" />
                <el-option label="视频" value="video" />
                <el-option label="文本" value="text" />
                <el-option label="链接" value="url" />
              </el-select>
              <el-checkbox v-model="field.downloadable" style="width: 70px">可下载</el-checkbox>
              <el-checkbox v-model="field.copyable" style="width: 70px">可复制</el-checkbox>
              <el-button type="danger" link @click="removeOutputField(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button type="primary" link @click="addOutputField">
              <el-icon><Plus /></el-icon> 添加输出字段
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item label="使用流程配置">
          <div class="flow-config">
            <el-checkbox v-model="form.flowSteps.step1_select_style">选择模板风格页</el-checkbox>
            <el-checkbox v-model="form.flowSteps.step2_materials" :disabled="!form.flowSteps.step1_select_style">素材列表页</el-checkbox>
            <el-select v-if="form.flowSteps.step2_materials" v-model="form.flowSteps.step2_materials_type" style="margin-left: 20px; width: 120px">
              <el-option label="个人素材" value="personal" />
              <el-option label="企业素材" value="enterprise" />
              <el-option label="两者都显示" value="both" />
            </el-select>
            <br/>
            <el-checkbox v-model="form.flowSteps.step3_input">输入生成页</el-checkbox>
            <el-checkbox v-model="form.flowSteps.step4_resize">图片尺寸缩放页</el-checkbox>
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
import { Plus, Delete } from '@element-plus/icons-vue'
import api from '@/api'

export default {
  name: 'WorkflowProducts',
  components: { Plus, Delete },
  setup() {
    const store = useStore()
    const loading = ref(false)
    const tableData = ref([])
    const dialogVisible = ref(false)
    const dialogTitle = ref('添加产品')
    const submitLoading = ref(false)
    const formRef = ref(null)
    const workflowList = ref([])
    const currentEditId = ref(null)
    const syncingParams = ref(false)

    const searchForm = reactive({
      name: '',
      isActive: ''
    })

    const pagination = reactive({
      page: 1,
      pageSize: 10,
      total: 0
    })

    const form = reactive({
      name: '',
      cozeWorkflowId: '',
      cozeWorkflowName: '',
      fixedFieldMappings: [],  // 固定字段映射配置
      inputFields: [],
      outputFields: [],
      flowSteps: {
        step1_select_style: false,
        step2_materials: false,
        step2_materials_type: 'personal',
        step3_input: true,
        step4_resize: false
      },
      isActive: true
    })

    // 来源表字段选项
    const sourceFieldOptions = {
      templates: [
        { key: 'prompt', label: 'prompt (提示词)' },
        { key: 'name', label: 'name (名称)' },
        { key: 'cover', label: 'cover (封面图)' },
        { key: 'description', label: 'description (描述)' }
      ],
      materials: [
        { key: 'title', label: 'title (标题)' },
        { key: 'url', label: 'url (图片地址)' },
        { key: 'description', label: 'description (描述)' }
      ],
      generate_sizes: [
        { key: 'name', label: 'name (名称)' },
        { key: 'size_value', label: 'size_value (尺寸值)' },
        { key: 'width', label: 'width (宽度)' },
        { key: 'height', label: 'height (高度)' },
        { key: 'category', label: 'category (分类)' }
      ]
    }

    const getSourceFieldOptions = (table) => {
      return sourceFieldOptions[table] || []
    }

    const onSourceTableChange = (field) => {
      field.sourceField = ''  // 清空字段选择
    }

    const addFixedField = () => {
      form.fixedFieldMappings.push({
        sourceTable: 'templates',
        sourceField: 'prompt',
        targetField: ''
      })
    }

    const removeFixedField = (index) => {
      form.fixedFieldMappings.splice(index, 1)
    }

    const rules = {
      name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
      cozeWorkflowId: [{ required: true, message: '请选择关联工作流', trigger: 'change' }]
    }

    const loadData = async () => {
      loading.value = true
      
      try {
        const token = store.state.token
        const res = await api.getWorkflowProducts({
          page: pagination.page,
          pageSize: pagination.pageSize,
          name: searchForm.name || undefined,
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

    const loadWorkflows = async () => {
      try {
        const token = store.state.token
        const res = await api.getCozeWorkflows({ pageNum: 1, pageSize: 100, status: 'published' }, token)
        const result = res.result || res
        if (result.success) {
          workflowList.value = result.data || []
        }
      } catch (err) {
        console.error('获取工作流列表失败:', err)
      }
    }

    const handleSearch = () => {
      pagination.page = 1
      loadData()
    }

    const handleReset = () => {
      searchForm.name = ''
      searchForm.isActive = ''
      handleSearch()
    }

    const handleAdd = () => {
      dialogTitle.value = '添加产品'
      currentEditId.value = null
      resetForm()
      dialogVisible.value = true
      loadWorkflows()
    }

    const handleEdit = (row) => {
      dialogTitle.value = '编辑产品'
      currentEditId.value = row._id
      loadWorkflows().then(() => {
        form.name = row.name
        form.cozeWorkflowId = row.coze_workflow_id
        form.cozeWorkflowName = row.coze_workflow_name
        // 读取固定字段映射配置
        form.fixedFieldMappings = (row.fixed_field_mappings || []).map((f) => ({
          sourceTable: f.source_table || f.sourceTable || 'templates',
          sourceField: f.source_field || f.sourceField || '',
          targetField: f.target_field || f.targetField || ''
        }))
        form.inputFields = (row.input_fields || []).map((f, i) => ({
          fieldName: f.field_name || f.fieldName || '',
          fieldKey: f.field_key || f.fieldKey || '',
          fieldType: f.field_type || f.fieldType || 'text',
          maxLength: f.max_length || f.maxLength || 200,
          isRequired: f.is_required ?? f.isRequired ?? false
        }))
        // 读取输出字段配置
        form.outputFields = (row.output_fields || []).map((f) => ({
          fieldName: f.field_name || f.fieldName || '',
          fieldKey: f.field_key || f.fieldKey || '',
          fieldType: f.field_type || f.fieldType || 'image',
          downloadable: f.downloadable ?? true,
          copyable: f.copyable ?? false
        }))
        form.flowSteps = {
          step1_select_style: row.flow_steps?.step1_select_style || false,
          step2_materials: row.flow_steps?.step2_materials || false,
          step2_materials_type: row.flow_steps?.step2_materials_type || 'personal',
          step3_input: row.flow_steps?.step3_input !== false,
          step4_resize: row.flow_steps?.step4_resize || false
        }
        form.isActive = row.is_active !== false
      })
      dialogVisible.value = true
    }

    const handleWorkflowChange = (workflowId) => {
      const wf = workflowList.value.find(w => w.workflow_id === workflowId)
      if (wf) {
        form.cozeWorkflowName = wf.workflow_name
      }
    }

    // 同步工作流参数（从 Coze 获取最新的输入/输出参数）
    const syncWorkflowParams = async () => {
      if (!form.cozeWorkflowId) {
        ElMessage.warning('请先选择工作流')
        return
      }
      
      syncingParams.value = true
      try {
        const token = store.state.token
        const res = await api.getCozeWorkflows({ 
          workflowId: form.cozeWorkflowId, 
          getDetails: true 
        }, token)
        
        const result = res.result || res
        if (result.success && result.data) {
          const workflowData = result.data
          
          // 自动填充输入字段（如果为空或用户确认覆盖）
          if (workflowData.input_params && workflowData.input_params.length > 0) {
            if (form.inputFields.length === 0 || await confirmReplace('输入')) {
              form.inputFields = workflowData.input_params.map((p, i) => ({
                fieldName: p.field_name || p.field_key,
                fieldKey: p.field_key,
                fieldType: p.field_type || 'text',
                maxLength: p.max_length || 200,
                isRequired: p.is_required || false
              }))
              ElMessage.success(`已同步 ${workflowData.input_params.length} 个输入参数`)
            }
          }
          
          // 自动填充输出字段（如果为空或用户确认覆盖）
          if (workflowData.output_params && workflowData.output_params.length > 0) {
            if (form.outputFields.length === 0 || await confirmReplace('输出')) {
              form.outputFields = workflowData.output_params.map((p, i) => ({
                fieldName: p.field_name || p.field_key,
                fieldKey: p.field_key,
                fieldType: p.field_type || 'image',
                downloadable: p.downloadable !== false,
                copyable: p.copyable || false
              }))
              ElMessage.success(`已同步 ${workflowData.output_params.length} 个输出参数`)
            }
          }
          
          if ((!workflowData.input_params || workflowData.input_params.length === 0) &&
              (!workflowData.output_params || workflowData.output_params.length === 0)) {
            ElMessage.info('该工作流没有定义输入/输出参数')
          }
        } else {
          ElMessage.error(result.error || '同步失败')
        }
      } catch (err) {
        console.error('同步工作流参数失败:', err)
        ElMessage.error('同步工作流参数失败')
      } finally {
        syncingParams.value = false
      }
    }
    
    // 确认是否覆盖现有配置
    const confirmReplace = async (type) => {
      return await ElMessageBox.confirm(
        `已有${type}字段配置，是否覆盖？`,
        '提示',
        { type: 'warning' }
      ).then(() => true).catch(() => false)
    }

    const addField = () => {
      form.inputFields.push({
        fieldName: '',
        fieldKey: '',
        fieldType: 'text',
        maxLength: 200,
        isRequired: false
      })
    }

    const removeField = (index) => {
      form.inputFields.splice(index, 1)
    }

    const addOutputField = () => {
      form.outputFields.push({
        fieldName: '',
        fieldKey: '',
        fieldType: 'image',
        downloadable: true,
        copyable: false
      })
    }

    const removeOutputField = (index) => {
      form.outputFields.splice(index, 1)
    }

    const resetForm = () => {
      form.name = ''
      form.cozeWorkflowId = ''
      form.cozeWorkflowName = ''
      form.fixedFieldMappings = []
      form.inputFields = []
      form.outputFields = []
      form.flowSteps = {
        step1_select_style: false,
        step2_materials: false,
        step2_materials_type: 'personal',
        step3_input: true,
        step4_resize: false
      }
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
          cozeWorkflowId: form.cozeWorkflowId,
          cozeWorkflowName: form.cozeWorkflowName,
          fixedFieldMappings: form.fixedFieldMappings.map((f) => ({
            source_table: f.sourceTable,
            source_field: f.sourceField,
            target_field: f.targetField
          })),
          inputFields: form.inputFields.map((f, i) => ({
            field_name: f.fieldName,
            field_key: f.fieldKey,
            field_type: f.fieldType,
            max_length: f.maxLength || 200,
            is_required: f.isRequired,
            sort: i + 1
          })),
          outputFields: form.outputFields.map((f, i) => ({
            field_name: f.fieldName,
            field_key: f.fieldKey,
            field_type: f.fieldType,
            downloadable: f.downloadable ?? true,
            copyable: f.copyable ?? false,
            sort: i + 1
          })),
          flowSteps: form.flowSteps,
          isActive: form.isActive
        }
        
        let res
        if (currentEditId.value) {
          res = await api.updateWorkflowProduct({ id: currentEditId.value, ...data }, token)
        } else {
          res = await api.createWorkflowProduct(data, token)
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
        await ElMessageBox.confirm(`确定要删除产品"${row.name}"吗？`, '提示', {
          type: 'warning'
        })
        
        const token = store.state.token
        const res = await api.deleteWorkflowProduct(row._id, token)
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
      workflowList,
      loadData,
      handleSearch,
      handleReset,
      handleAdd,
      handleEdit,
      handleWorkflowChange,
      syncWorkflowParams,
      syncingParams,
      getSourceFieldOptions,
      addFixedField,
      removeFixedField,
      addField,
      removeField,
      addOutputField,
      removeOutputField,
      handleSubmit,
      handleDelete,
      formatDate
    }
  }
}
</script>

<style scoped>
.workflow-products-container {
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

.flow-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.step-tag {
  background: #f0f9eb;
  color: #67c23a;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.input-fields-config {
  width: 100%;
}

.field-tip {
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
}

.field-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.flow-config {
  line-height: 32px;
}

.flow-config .el-checkbox {
  margin-right: 16px;
}
</style>
