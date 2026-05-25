<template>
  <div class="order-container">
    <div class="header">
      <h2>确认订单</h2>
      <el-button :icon="ArrowLeft" @click="$router.back()">返回</el-button>
    </div>

    <div class="order-content">
      <el-card>
        <template #header>
          <span>订单商品</span>
        </template>

        <el-table :data="orderItems">
          <el-table-column label="商品" min-width="300">
            <template #default="{ row }">
              <div class="product-cell">
                <img :src="row.图片 || '/default-product.jpg'" :alt="row.产品名称" class="product-thumb" />
                <span class="product-name">{{ row.产品名称 }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="单价" width="120">
            <template #default="{ row }">
              <span>¥{{ row.价格 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="120">
            <template #default="{ row }">
              <span>{{ row.数量 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="小计" width="120">
            <template #default="{ row }">
              <span class="subtotal">¥{{ (row.价格 * row.数量).toFixed(2) }}</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="order-total">
          <span class="total-label">订单总价:</span>
          <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
        </div>
      </el-card>

      <el-card class="address-card">
        <template #header>
          <span>收货信息</span>
        </template>

        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="收货人" prop="收货人">
            <el-input v-model="form.收货人" placeholder="请输入收货人姓名" />
          </el-form-item>
          <el-form-item label="联系电话" prop="联系电话">
            <el-input v-model="form.联系电话" placeholder="请输入联系电话" />
          </el-form-item>
          <el-form-item label="收货地址" prop="收货地址">
            <el-input v-model="form.收货地址" type="textarea" :rows="2" placeholder="请输入详细收货地址" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.备注" type="textarea" :rows="2" placeholder="请输入备注信息（选填）" />
          </el-form-item>
        </el-form>
      </el-card>

      <div class="order-actions">
        <el-button size="large" @click="$router.back()">取消</el-button>
        <el-button type="primary" size="large" :loading="loading" @click="handleSubmit">
          提交订单
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { createOrder } from '../api/order'

const router = useRouter()

const orderItems = ref([])
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  收货人: '',
  联系电话: '',
  收货地址: '',
  备注: ''
})

const rules = {
  收货人: [{ required: true, message: '请输入收货人', trigger: 'blur' }],
  联系电话: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  收货地址: [{ required: true, message: '请输入收货地址', trigger: 'blur' }]
}

const totalPrice = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.价格 * item.数量, 0)
})

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    if (orderItems.value.length === 0) {
      ElMessage.warning('订单商品不能为空')
      return
    }

    loading.value = true
    try {
      const orderData = {
        ...form,
        items: orderItems.value.map(item => ({
          产品ID: item.产品ID,
          数量: item.数量,
          价格: item.价格
        }))
      }

      const res = await createOrder(orderData)
      ElMessage.success('订单提交成功')
      localStorage.removeItem('checkoutItems')
      router.push(`/order/${res.data.orderId}`)
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  })
}

onMounted(() => {
  const from = router.currentRoute.value.query.from
  if (from === 'cart') {
    const checkoutItems = localStorage.getItem('checkoutItems')
    if (checkoutItems) {
      orderItems.value = JSON.parse(checkoutItems)
    }
  }
})
</script>

<style scoped>
.order-container {
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
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.product-name {
  font-weight: bold;
}

.subtotal {
  font-weight: bold;
  color: #f56c6c;
}

.order-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.total-label {
  font-size: 16px;
  color: #666;
}

.total-price {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
}

.address-card {
  margin-top: 20px;
}

.order-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
}
</style>
