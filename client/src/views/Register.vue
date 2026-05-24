<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <h1>用户注册</h1>
        <p>加入保定铁球大家庭</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" class="register-form">
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
          />
        </el-form-item>
        <el-form-item prop="确认密码">
          <el-input
            v-model="form.确认密码"
            type="password"
            placeholder="请确认密码"
            :prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>
        <el-form-item prop="姓名">
          <el-input
            v-model="form.姓名"
            placeholder="请输入姓名"
            :prefix-icon="UserFilled"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="电话">
          <el-input
            v-model="form.电话"
            placeholder="请输入手机号"
            :prefix-icon="Phone"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="地址">
          <el-input
            v-model="form.地址"
            placeholder="请输入收货地址"
            :prefix-icon="MapLocation"
            size="large"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width: 100%" :loading="loading" @click="handleRegister">
            注册
          </el-button>
        </el-form-item>
        <div class="register-footer">
          <el-link type="primary" @click="$router.push('/login')">已有账号？立即登录</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Phone, UserFilled, MapLocation } from '@element-plus/icons-vue'
import { register } from '../api/auth'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  账号: '',
  密码: '',
  确认密码: '',
  姓名: '',
  电话: '',
  地址: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.密码) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  账号: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度为3-20个字符', trigger: 'blur' }
  ],
  密码: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' }
  ],
  确认密码: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  姓名: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  电话: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  地址: [
    { required: true, message: '请输入收货地址', trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const { 确认密码, ...registerData } = form
      await register(registerData)
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 0;
}

.register-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 8px;
}

.register-header p {
  color: #666;
  font-size: 14px;
}

.register-form {
  margin-top: 20px;
}

.register-footer {
  text-align: center;
  margin-top: 10px;
}

@media (max-width: 480px) {
  .register-box {
    width: 90%;
    padding: 30px 20px;
  }
}
</style>
