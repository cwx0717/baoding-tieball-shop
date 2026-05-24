<template>
  <div class="detail-container">
    <div class="header">
      <el-button :icon="ArrowLeft" @click="$router.back()">返回</el-button>
    </div>

    <div v-if="product.产品ID" class="product-detail">
      <el-card>
        <el-row :gutter="40">
          <el-col :xs="24" :sm="12">
            <div class="product-image">
              <img :src="getProductImage(product.图片)" :alt="product.产品名" @error="handleImageError" />
            </div>
          </el-col>
          <el-col :xs="24" :sm="12">
            <div class="product-info">
              <h1>{{ product.产品名 }}</h1>
              <p class="product-desc">{{ product.工艺 }} · {{ product.尺寸 }}</p>
              <div class="product-meta">
                <span>分类: {{ product.分类 }}</span>
                <span>材质: {{ product.材质 }}</span>
              </div>
              <div class="product-price">
                <span class="price">¥{{ product.价格 }}</span>
                <span class="stock">库存: {{ product.库存 }}</span>
              </div>

              <div v-if="user?.角色 !== '商家' && user?.角色 !== '管理员'" class="product-actions">
                <el-input-number v-model="quantity" :min="1" :max="product.库存" size="large" />
                <el-button type="primary" size="large" :disabled="product.库存 === 0" @click="handleAddToCart">
                  加入购物车
                </el-button>
              </div>

              <div v-if="user?.角色 === '商家' || user?.角色 === '管理员'" class="product-actions">
                <el-tag type="warning">商家/管理员模式</el-tag>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <div class="product-description">
              <h3>产品简介</h3>
              <p>{{ product.描述 || '暂无简介' }}</p>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <el-card class="comment-card">
        <template #header>
          <div class="card-header">
            <span>商品评价</span>
            <el-button type="primary" size="small" @click="showCommentDialog = true">
              发表评论
            </el-button>
          </div>
        </template>

        <div class="comment-list">
          <div v-for="comment in comments" :key="comment.评价ID" class="comment-item">
            <div class="comment-header">
              <span class="comment-user">{{ comment.用户姓名 }}</span>
              <el-rate v-model="comment.评分" disabled size="small" />
            </div>
            <p class="comment-content">{{ comment.内容 }}</p>
            <span class="comment-time">{{ comment.评价时间 }}</span>
          </div>
        </div>

        <el-empty v-if="comments.length === 0" description="暂无评价"></el-empty>
      </el-card>
    </div>

    <el-dialog v-model="showCommentDialog" title="发表评论" width="500px">
      <el-form ref="commentFormRef" :model="commentForm" :rules="commentRules" label-width="80px">
        <el-form-item label="评分" prop="rating">
          <el-rate v-model="commentForm.rating" />
        </el-form-item>
        <el-form-item label="评价内容" prop="content">
          <el-input
            v-model="commentForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入评价内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCommentDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitComment">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getProductDetail } from '../api/product'
import { addToCart } from '../api/cart'
import { getProductComments, addComment } from '../api/comment'
// 直接在组件中处理图片路径
const getProductImage = (filename) => {
  if (!filename) {
    return new URL('../assets/default-product.svg', import.meta.url).href
  }
  try {
    const pureFilename = filename.replace(/^.*[\\/]/, '')
    return new URL(`../assets/${pureFilename}`, import.meta.url).href
  } catch (error) {
    return new URL('../assets/default-product.svg', import.meta.url).href
  }
}

const getDefaultImage = () => {
  return new URL('../assets/default-product.svg', import.meta.url).href
}

const route = useRoute()
const router = useRouter()

const user = ref(null)
const product = ref({})
const quantity = ref(1)
const comments = ref([])
const showCommentDialog = ref(false)
const commentFormRef = ref(null)

const commentForm = reactive({
  rating: 5,
  content: ''
})

const commentRules = {
  rating: [{ required: true, message: '请选择评分', trigger: 'change' }],
  content: [{ required: true, message: '请输入评价内容', trigger: 'blur' }]
}

const loadProduct = async () => {
  try {
    const res = await getProductDetail(route.params.id)
    product.value = res.data
  } catch (error) {
    console.error(error)
  }
}

const loadComments = async () => {
  try {
    const res = await getProductComments(route.params.id)
    comments.value = res.data || []
  } catch (error) {
    console.error(error)
  }
}

const handleImageError = (e) => {
  e.target.src = getDefaultImage()
}

const handleAddToCart = async () => {
  try {
    await addToCart({
      产品ID: product.value.产品ID,
      数量: quantity.value
    })
    ElMessage.success('已加入购物车')
  } catch (error) {
    console.error(error)
  }
}

const handleSubmitComment = async () => {
  if (!commentFormRef.value) return

  await commentFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      await addComment({
        产品ID: product.value.产品ID,
        评分: commentForm.rating,
        内容: commentForm.content
      })
      ElMessage.success('评论成功')
      showCommentDialog.value = false
      commentForm.content = ''
      commentForm.rating = 5
      loadComments()
    } catch (error) {
      console.error(error)
    }
  })
}

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    user.value = JSON.parse(userStr)
  }
  loadProduct()
  loadComments()
})
</script>

<style scoped>
.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.product-detail {
  margin-bottom: 20px;
}

.product-image {
  width: 100%;
  height: 400px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info h1 {
  font-size: 28px;
  margin-bottom: 16px;
}

.product-desc {
  color: #666;
  margin-bottom: 16px;
  line-height: 1.6;
}

.product-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  color: #999;
  font-size: 14px;
}

.product-price {
  margin-bottom: 30px;
}

.price {
  font-size: 32px;
  color: #f56c6c;
  font-weight: bold;
  margin-right: 20px;
}

.stock {
  color: #999;
}

.product-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.product-description {
  margin-top: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.product-description h3 {
  font-size: 18px;
  margin-bottom: 12px;
  color: #333;
}

.product-description p {
  line-height: 1.8;
  color: #666;
  font-size: 14px;
}

.comment-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.comment-user {
  font-weight: bold;
  color: #409eff;
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

@media (max-width: 768px) {
  .product-image {
    height: 300px;
  }

  .product-info h1 {
    font-size: 22px;
  }

  .price {
    font-size: 26px;
  }
}
</style>
