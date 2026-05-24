<template>
  <div class="order-list-container">
    <div class="header">
      <h2>我的订单</h2>
      <el-button :icon="ArrowLeft" @click="$router.back()">返回</el-button>
    </div>

    <div class="order-content">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all"></el-tab-pane>
        <el-tab-pane label="待支付" name="待支付"></el-tab-pane>
        <el-tab-pane label="待发货" name="待发货"></el-tab-pane>
        <el-tab-pane label="待收货" name="待收货"></el-tab-pane>
        <el-tab-pane label="已完成" name="已完成"></el-tab-pane>
      </el-tabs>

      <div class="order-list">
        <el-card v-for="order in orders" :key="order.订单ID" class="order-card">
          <div class="order-header">
            <span class="order-id">订单号: {{ order.订单号 }}</span>
            <span class="order-status">
              <el-tag :type="getStatusType(order.状态)">{{ order.状态 }}</el-tag>
            </span>
          </div>

          <div class="order-items">
            <div v-for="item in order.items" :key="item.订单详情ID" class="order-item">
              <img :src="item.图片 || '/default-product.jpg'" :alt="item.产品名称" class="item-thumb" />
              <div class="item-info">
                <span class="item-name">{{ item.产品名称 }}</span>
                <span class="item-price">¥{{ item.价格 }} × {{ item.数量 }}</span>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-info">
              <span>下单时间: {{ order.下单时间 }}</span>
              <span class="order-total">合计: ¥{{ order.总价.toFixed(2) }}</span>
            </div>
            <div class="order-actions">
              <el-button size="small" @click="goToDetail(order.订单ID)">查看详情</el-button>
              <el-button v-if="order.状态 === '待支付'" type="primary" size="small" @click="handlePay(order)">
                支付
              </el-button>
              <el-button v-if="order.状态 === '待收货'" type="success" size="small" @click="handleConfirm(order)">
                确认收货
              </el-button>
              <el-button v-if="order.状态 === '待支付'" type="danger" size="small" @click="handleCancel(order)">
                取消订单
              </el-button>
            </div>
          </div>
        </el-card>

        <el-empty v-if="orders.length === 0" description="暂无订单"></el-empty>
      </div>

      <div v-if="orders.length > 0" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="loadOrders"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getOrderList, cancelOrder, confirmReceipt } from '../api/order'

const router = useRouter()

const orders = ref([])
const activeTab = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

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

const loadOrders = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    if (activeTab.value !== 'all') {
      params.status = activeTab.value
    }
    const res = await getOrderList(params)
    orders.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (error) {
    console.error(error)
  }
}

const handleTabChange = () => {
  currentPage.value = 1
  loadOrders()
}

const goToDetail = (id) => {
  router.push(`/order/${id}`)
}

const handlePay = (order) => {
  ElMessage.success('支付功能开发中')
}

const handleConfirm = async (order) => {
  try {
    await ElMessageBox.confirm('确认收货吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await confirmReceipt(order.订单ID)
    ElMessage.success('已确认收货')
    loadOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleCancel = async (order) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await cancelOrder(order.订单ID)
    ElMessage.success('订单已取消')
    loadOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.order-list-container {
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

.order-card {
  margin-bottom: 16px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
  margin-bottom: 12px;
}

.order-id {
  color: #666;
  font-size: 14px;
}

.order-items {
  margin-bottom: 12px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.item-thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-name {
  font-weight: bold;
}

.item-price {
  color: #666;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #666;
}

.order-total {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
}

.order-actions {
  display: flex;
  gap: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style>
