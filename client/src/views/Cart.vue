<template>
  <div class="cart-container">
    <div class="header">
      <h2>购物车</h2>
      <el-button :icon="ArrowLeft" @click="$router.back()">返回</el-button>
    </div>

    <div class="cart-content">
      <el-card v-if="cartItems.length > 0">
        <el-table :data="cartItems" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column label="商品" min-width="300">
            <template #default="{ row }">
              <div class="product-cell">
                <img :src="getProductImage(row.图片)" :alt="row.产品名" class="product-thumb" @error="handleImageError" />
                <div class="product-info">
                  <span class="product-name">{{ row.产品名 }}</span>
                  <span class="product-price">¥{{ row.价格 }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="180">
            <template #default="{ row }">
              <el-input-number
                v-model="row.数量"
                :min="1"
                :max="row.库存 || 99"
                size="small"
                @change="handleQuantityChange(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="小计" width="120">
            <template #default="{ row }">
              <span class="subtotal">¥{{ (row.价格 * row.数量).toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button type="danger" :icon="Delete" link @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="cart-footer">
          <div class="cart-summary">
            <span class="total-text">合计:</span>
            <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
          </div>
          <el-button type="primary" size="large" :disabled="selectedItems.length === 0" @click="handleCheckout">
            结算 ({{ selectedItems.length }})
          </el-button>
        </div>
      </el-card>

      <el-empty v-else description="购物车是空的">
        <el-button type="primary" @click="$router.push('/home')">去购物</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Delete } from '@element-plus/icons-vue'
import { getCartList, updateCartItem, deleteCartItem } from '../api/cart'
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

const router = useRouter()

const cartItems = ref([])
const selectedItems = ref([])

const totalPrice = computed(() => {
  return selectedItems.value.reduce((sum, item) => sum + item.价格 * item.数量, 0)
})

const loadCart = async () => {
  try {
    const res = await getCartList()
    cartItems.value = res.data || []
  } catch (error) {
    console.error(error)
  }
}

const handleImageError = (e) => {
  e.target.src = getDefaultImage()
}

const handleSelectionChange = (selection) => {
  selectedItems.value = selection
}

const handleQuantityChange = async (item) => {
  try {
    await updateCartItem(item.产品ID, {
      数量: item.数量
    })
  } catch (error) {
    console.error(error)
    loadCart()
  }
}

const handleDelete = async (item) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteCartItem(item.产品ID)
    ElMessage.success('删除成功')
    loadCart()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleCheckout = () => {
  const orderData = selectedItems.value.map(item => ({
    产品ID: item.产品ID,
    数量: item.数量,
    价格: item.价格
  }))

  localStorage.setItem('checkoutItems', JSON.stringify(orderData))
  router.push({
    path: '/order',
    query: { from: 'cart' }
  })
}

onMounted(() => {
  loadCart()
})
</script>

<style scoped>
.cart-container {
  max-width: 1000px;
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

.product-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-thumb {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-weight: bold;
}

.product-price {
  color: #f56c6c;
}

.subtotal {
  font-weight: bold;
  color: #f56c6c;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.cart-summary {
  display: flex;
  align-items: center;
  gap: 8px;
}

.total-text {
  font-size: 16px;
  color: #666;
}

.total-price {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
}
</style>
