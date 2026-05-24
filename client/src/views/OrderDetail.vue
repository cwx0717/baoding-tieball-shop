<template>
  <div class="order-detail-container">
    <div class="header">
      <h2>订单详情</h2>
      <el-button :icon="ArrowLeft" @click="$router.back()">返回</el-button>
    </div>

    <div v-if="order.订单ID" class="detail-content">
      <el-card class="info-card">
        <template #header>
          <span>订单信息</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ order.订单号 }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(order.状态)">{{ order.状态 }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ order.下单时间 }}</el-descriptions-item>
          <el-descriptions-item label="收货人">{{ order.收货人 }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ order.联系电话 }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">{{ order.收货地址 }}</el-descriptions-item>
          <el-descriptions-item v-if="order.备注" label="备注" :span="2">{{ order.备注 }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="info-card">
        <template #header>
          <span>商品信息</span>
        </template>
        <el-table :data="order.items">
          <el-table-column label="商品" min-width="300">
            <template #default="{ row }">
              <div class="product-cell">
                <img :src="row.图片 || '/default-product.jpg'" :alt="row.产品名称" class="product-thumb" />
                <span>{{ row.产品名称 }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="价格" label="单价" width="120">
            <template #default="{ row }">¥{{ row.价格 }}</template>
          </el-table-column>
          <el-table-column prop="数量" label="数量" width="120" />
          <el-table-column label="小计" width="120">
            <template #default="{ row }">
              <span class="subtotal">¥{{ (row.价格 * row.数量).toFixed(2) }}</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="order-total">
          <span>订单总价:</span>
          <span class="total-price">¥{{ order.总价.toFixed(2) }}</span>
        </div>
      </el-card>

      <div class="actions">
        <el-button v-if="order.状态 === '待支付'" type="primary" @click="handlePay">支付</el-button>
        <el-button v-if="order.状态 === '待收货'" type="success" @click="handleConfirm">确认收货</el-button>
        <el-button v-if="order.状态 === '待支付'" type="danger" @click="handleCancel">取消订单</el-button>
        <el-button @click="$router.back()">返回</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getOrderDetail, cancelOrder, confirmReceipt } from '../api/order'

const route = useRoute()
const router = useRouter()

const order = ref({})

const getStatusType = (status) => {
  const types = {
    '待支付': 'warning',
    '待发货': 'info',
    '待收货': 'primary',
    '已完成': 'success',
    '已取消': 'danger'
  }
  return types[status] || 'info'
}

const loadOrder = async () => {
  try {
    const res = await getOrderDetail(route.params.id)
    order.value = res.data
  } catch (error) {
    console.error(error)
  }
}

const handlePay = () => {
  ElMessage.success('支付功能开发中')
}

const handleConfirm = async () => {
  try {
    await ElMessageBox.confirm('确认收货吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await confirmReceipt(order.value.订单ID)
    ElMessage.success('已确认收货')
    loadOrder()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await cancelOrder(order.value.订单ID)
    ElMessage.success('订单已取消')
    loadOrder()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

onMounted(() => {
  loadOrder()
})
</script>

<style scoped>
.order-detail-container {
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

.info-card {
  margin-bottom: 20px;
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
  font-size: 16px;
}

.total-price {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style>
