<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>保定铁球</h1>
        <p>非遗文化传承</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" class="login-form">
        <el-form-item prop="账号">
          <el-input
            v-model="form.账号"
            placeholder="请输入账号"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="密码">
          <el-input
            v-model="form.密码"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width: 100%" :loading="loading" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
        <div class="login-footer">
          <el-link type="primary" @click="$router.push('/register')">还没有账号？立即注册</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { login } from '../api/auth'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  账号: '',
  密码: ''
})

const rules = {
  账号: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  密码: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const res = await login(form)
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))

      ElMessage.success('登录成功')

      const role = res.user.角色
      if (role === '管理员') {
        router.push('/admin')
      } else if (role === '商家') {
        router.push('/craftsman')
      } else {
        router.push('/home')
      }
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
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
  color: #666;
  font-size: 14px;
}

.login-form {
  margin-top: 20px;
}

.login-footer {
  text-align: center;
  margin-top: 10px;
}

@media (max-width: 480px) {
  .login-box {
    width: 90%;
    padding: 30px 20px;
    margin: 0 20px;
  }
}
</style>
