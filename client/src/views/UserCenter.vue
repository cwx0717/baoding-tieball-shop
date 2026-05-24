<template>
  <div class="user-center-container">
    <div class="header">
      <h2>个人中心</h2>
      <el-button :icon="ArrowLeft" @click="$router.back()">返回</el-button>
    </div>

    <div class="user-content">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="8">
          <el-card class="user-card">
            <div class="user-info">
              <el-avatar :size="80" :icon="UserFilled" />
              <h3>{{ user?.用户名 }}</h3>
              <el-tag>{{ user?.角色 }}</el-tag>
            </div>
            <div class="user-menu">
              <el-menu :default-active="activeMenu" @select="handleMenuSelect">
                <el-menu-item index="info">
                  <el-icon><User /></el-icon>
                  <span>个人信息</span>
                </el-menu-item>
                <el-menu-item index="password">
                  <el-icon><Lock /></el-icon>
                  <span>修改密码</span>
                </el-menu-item>
                <el-menu-item index="comments">
                  <el-icon><Comment /></el-icon>
                  <span>我的评价</span>
                </el-menu-item>
              </el-menu>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="16">
          <el-card v-if="activeMenu === 'info'">
            <template #header>
              <span>个人信息</span>
            </template>
            <el-form ref="infoFormRef" :model="userInfo" :rules="infoRules" label-width="100px">
              <el-form-item label="用户名">
                <el-input v-model="userInfo.用户名" disabled />
              </el-form-item>
              <el-form-item label="手机号" prop="手机号">
                <el-input v-model="userInfo.手机号" />
              </el-form-item>
              <el-form-item label="邮箱" prop="邮箱">
                <el-input v-model="userInfo.邮箱" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleUpdateInfo">保存</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <el-card v-if="activeMenu === 'password'">
            <template #header>
              <span>修改密码</span>
            </template>
            <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
              <el-form-item label="原密码" prop="原密码">
                <el-input v-model="passwordForm.原密码" type="password" show-password />
              </el-form-item>
              <el-form-item label="新密码" prop="新密码">
                <el-input v-model="passwordForm.新密码" type="password" show-password />
              </el-form-item>
              <el-form-item label="确认密码" prop="确认密码">
                <el-input v-model="passwordForm.确认密码" type="password" show-password />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleUpdatePassword">修改</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <el-card v-if="activeMenu === 'comments'">
            <template #header>
              <span>我的评价</span>
            </template>
            <div class="comment-list">
              <div v-for="comment in comments" :key="comment.评论ID" class="comment-item">
                <div class="comment-header">
                  <span class="product-name" @click="goToProduct(comment.产品ID)">
                    {{ comment.产品名称 }}
                  </span>
                  <el-rate v-model="comment.评分" disabled size="small" />
                </div>
                <p class="comment-content">{{ comment.内容 }}</p>
                <span class="comment-time">{{ comment.评论时间 }}</span>
              </div>
            </div>
            <el-empty v-if="comments.length === 0" description="暂无评价"></el-empty>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, User, Lock, Comment, UserFilled } from '@element-plus/icons-vue'
import { getUserInfo, updateUserInfo } from '../api/auth'
import { getMyComments } from '../api/comment'

const router = useRouter()

const user = ref(null)
const activeMenu = ref('info')
const infoFormRef = ref(null)
const passwordFormRef = ref(null)
const comments = ref([])

const userInfo = reactive({
  用户名: '',
  手机号: '',
  邮箱: ''
})

const passwordForm = reactive({
  原密码: '',
  新密码: '',
  确认密码: ''
})

const infoRules = {
  手机号: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  邮箱: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
  ]
}

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.新密码) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  原密码: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  新密码: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' }
  ],
  确认密码: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleMenuSelect = (index) => {
  activeMenu.value = index
  if (index === 'comments') {
    loadComments()
  }
}

const loadUser = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    user.value = JSON.parse(userStr)
    userInfo.用户名 = user.value.用户名
    userInfo.手机号 = user.value.手机号 || ''
    userInfo.邮箱 = user.value.邮箱 || ''
  }
}

const loadComments = async () => {
  try {
    const res = await getMyComments()
    comments.value = res.data || []
  } catch (error) {
    console.error(error)
  }
}

const handleUpdateInfo = async () => {
  try {
    await updateUserInfo({
      手机号: userInfo.手机号,
      邮箱: userInfo.邮箱
    })
    ElMessage.success('保存成功')
    user.value.手机号 = userInfo.手机号
    user.value.邮箱 = userInfo.邮箱
    localStorage.setItem('user', JSON.stringify(user.value))
  } catch (error) {
    console.error(error)
  }
}

const handleUpdatePassword = async () => {
  ElMessage.success('密码修改功能开发中')
}

const goToProduct = (id) => {
  router.push(`/product/${id}`)
}

onMounted(() => {
  loadUser()
})
</script>

<style scoped>
.user-center-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
}

.user-card {
  text-align: center;
}

.user-info {
  padding: 20px 0;
}

.user-info h3 {
  margin: 16px 0 8px;
}

.user-menu {
  border-top: 1px solid #eee;
  margin-top: 20px;
}

.comment-list {
  max-height: 500px;
  overflow-y: auto;
}

.comment-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.product-name {
  color: #409eff;
  cursor: pointer;
}

.product-name:hover {
  text-decoration: underline;
}

.comment-content {
  color: #333;
  line-height: 1.6;
  margin-bottom: 8px;
}

.comment-time {
  font-size: 12px;
  color: #999;
}
</style>
