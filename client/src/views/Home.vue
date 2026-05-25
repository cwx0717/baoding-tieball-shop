<template>
  <div class="home-container">
    <div class="header">
      <div class="header-content">
        <div class="logo">
          <h1>保定铁球</h1>
          <span>非遗文化传承</span>
        </div>
        <div class="header-actions">
          <el-badge :value="cartCount" :hidden="cartCount === 0">
            <el-button :icon="ShoppingCart" @click="$router.push('/cart')">购物车</el-button>
          </el-badge>
          <el-dropdown @command="handleCommand">
            <el-button :icon="User">
              {{ user?.用户名 || '未登录' }}
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="user">个人中心</el-dropdown-item>
                <el-dropdown-item command="order">我的订单</el-dropdown-item>
                <el-dropdown-item v-if="user?.角色 === '商家' || user?.角色 === '管理员'" command="craftsman">
                  商家管理
                </el-dropdown-item>
                <el-dropdown-item v-if="user?.角色 === '管理员'" command="admin">
                  系统管理
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="banner">
        <el-carousel height="300px" :interval="5000">
          <el-carousel-item>
            <div class="banner-item banner-1">
              <h2>传承百年工艺</h2>
              <p>保定铁球，非物质文化遗产</p>
            </div>
          </el-carousel-item>
          <el-carousel-item>
            <div class="banner-item banner-2">
              <h2>匠心独运</h2>
              <p>每一颗铁球都承载着匠人的心血</p>
            </div>
          </el-carousel-item>
          <el-carousel-item>
            <div class="banner-item banner-3">
              <h2>强身健体</h2>
              <p>传统保健佳品，送礼自用两相宜</p>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>

      <div class="categories">
        <el-tabs v-model="activeCategory" @tab-change="handleCategoryChange">
          <el-tab-pane label="全部" name="all"></el-tab-pane>
          <el-tab-pane
            v-for="category in categories"
            :key="category.分类ID"
            :label="category.分类名称"
            :name="category.分类ID"
          ></el-tab-pane>
        </el-tabs>
      </div>

      <div class="product-list">
        <el-row :gutter="20">
          <el-col
            v-for="product in products"
            :key="product.产品ID"
            :xs="12"
            :sm="8"
            :md="6"
            :lg="6"
            :xl="4"
          >
            <el-card class="product-card" shadow="hover" @click="goToDetail(product.产品ID)">
              <div class="product-image">
                  <img :src="getProductImage(product.图片)" :alt="product.产品名" @error="handleImageError" />
                </div>
                <div class="product-info">
                  <h3 class="product-name">{{ product.产品名 }}</h3>
                  <p class="product-desc">{{ product.分类 }} · {{ product.材质 }}</p>
                <div class="product-bottom">
                  <span class="product-price">¥{{ product.价格 }}</span>
                  <span class="product-stock">库存: {{ product.库存 }}</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-empty v-if="products.length === 0" description="暂无产品"></el-empty>
      </div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <div class="footer">
      <p>保定铁球非遗销售系统 &copy; 2024</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart, User as UserIcon } from '@element-plus/icons-vue'
import { getProductList, getCategories } from '../api/product'
import { getCartList } from '../api/cart'
// 直接在组件中处理图片路径，避免工具函数路径解析问题
const getProductImage = (filename) => {
  if (!filename) {
    const url = new URL('../assets/default-product.svg', import.meta.url).href
    console.log('Default image URL:', url)
    return url
  }
  try {
    const pureFilename = filename.replace(/^.*[\\/]/, '')
    const url = new URL(`../assets/${pureFilename}`, import.meta.url).href
    console.log('Product image URL:', filename, '->', url)
    return url
  } catch (error) {
    console.error('Image error:', filename, error)
    return new URL('../assets/default-product.svg', import.meta.url).href
  }
}

const getDefaultImage = () => {
  return new URL('../assets/default-product.svg', import.meta.url).href
}

const router = useRouter()

const user = ref(null)
const activeCategory = ref('all')
const categories = ref([])
const products = ref([])
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const cartCount = ref(0)

const loadUser = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    user.value = JSON.parse(userStr)
  }
}

const loadCategories = async () => {
  try {
    const res = await getCategories()
    categories.value = res.data || []
  } catch (error) {
    console.error(error)
  }
}

const loadProducts = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    if (activeCategory.value !== 'all') {
      params.categoryId = activeCategory.value
    }
    const res = await getProductList(params)
    products.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (error) {
    console.error(error)
  }
}

const loadCartCount = async () => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return

  try {
    const res = await getCartList()
    const cartItems = res.data || []
    cartCount.value = cartItems.reduce((sum, item) => sum + item.数量, 0)
  } catch (error) {
    console.error(error)
  }
}

const handleCategoryChange = () => {
  currentPage.value = 1
  loadProducts()
}

const handlePageChange = () => {
  loadProducts()
}

const handleImageError = (e) => {
  e.target.src = getDefaultImage()
}

const goToDetail = (id) => {
  router.push(`/product/${id}`)
}

const handleCommand = (command) => {
  switch (command) {
    case 'user':
      router.push('/user')
      break
    case 'order':
      router.push('/order')
      break
    case 'craftsman':
      router.push('/craftsman')
      break
    case 'admin':
      router.push('/admin')
      break
    case 'logout':
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      ElMessage.success('已退出登录')
      router.push('/login')
      break
  }
}

onMounted(() => {
  loadUser()
  loadCategories()
  loadProducts()
  loadCartCount()
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo h1 {
  font-size: 24px;
  color: #409eff;
  margin: 0;
}

.logo span {
  font-size: 12px;
  color: #999;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.banner {
  margin-bottom: 30px;
}

.banner-item {
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
}

.banner-1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.banner-2 {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.banner-3 {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.banner-item h2 {
  font-size: 36px;
  margin-bottom: 16px;
}

.banner-item p {
  font-size: 18px;
}

.categories {
  margin-bottom: 20px;
  background: white;
  padding: 16px;
  border-radius: 8px;
}

.product-list {
  min-height: 400px;
}

.product-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f5f5f5;
  border-radius: 4px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 12px 0;
}

.product-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-desc {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 18px;
  color: #f56c6c;
  font-weight: bold;
}

.product-stock {
  font-size: 12px;
  color: #999;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.footer {
  text-align: center;
  padding: 30px;
  background: #333;
  color: white;
  margin-top: 50px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .banner-item h2 {
    font-size: 24px;
  }

  .banner-item p {
    font-size: 14px;
  }
}
</style>
