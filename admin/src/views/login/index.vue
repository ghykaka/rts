<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>让她生</h1>
        <p>后台管理系统</p>
      </div>
      
      <el-form ref="formRef" :model="form" :rules="rules" class="login-form">
        <el-form-item prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入管理员账号"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading" 
            size="large" 
            style="width: 100%"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import api from '@/api'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const store = useStore()
    const formRef = ref(null)
    const loading = ref(false)
    
    const form = reactive({
      username: '',
      password: ''
    })
    
    const rules = {
      username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
    }
    
    const handleLogin = async () => {
      const valid = await formRef.value.validate().catch(() => false)
      if (!valid) return
      
      loading.value = true
      try {
        const res = await api.login({
          username: form.username,
          password: form.password
        })
        console.log('登录响应:', res)
        
        // 处理 HTTP 访问服务返回的响应格式（可能是 res 或 res.result）
        const result = res.result || res
        console.log('处理后结果:', result)
        
        if (result.success) {
          console.log('准备调用 store.login')
          store.dispatch('login', {
            token: result.token,
            user: result.user
          })
          console.log('准备跳转')
          ElMessage.success('登录成功')
          router.push('/')
          console.log('已跳转')
        } else {
          ElMessage.error(result.error || '登录失败')
        }
      } catch (err) {
        ElMessage.error('登录失败，请检查网络')
        console.error(err)
      } finally {
        loading.value = false
      }
    }
    
    return {
      form,
      rules,
      formRef,
      loading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 8px;
}

.login-header p {
  color: #999;
  font-size: 14px;
}

.login-form {
  margin-top: 20px;
}
</style>
