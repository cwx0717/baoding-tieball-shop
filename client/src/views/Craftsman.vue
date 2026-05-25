<template>
  <div class="craftsman-container">
    <div class="header">
      <h2>商家管理中心</h2>
      <el-button :icon="ArrowLeft" @click="$router.back()">返回</el-button>
    </div>

    <div class="craftsman-content">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="产品管理" name="products">
              <el-card>
                <template #header>
                  <div class="card-header">
                    <span>产品列表</span>
                    <el-button type="primary" @click="showProductDialog = true">添加产品</el-button>
                  </div>
                </template>

                <el-table :data="products">
                  <el-table-column prop="产品ID" label="ID" width="80" />
                  <el-table-column label="产品" min-width="200">
                    <template #default="{ row }">
                      <div class="product-cell">
                        <img :src="row.图片 || '/default-product.jpg'" class="product-thumb" />
                        <span>{{ row.产品名称 }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="价格" label="价格" width="120">
                    <template #default="{ row }">¥{{ row.价格 }}</template>
                  </el-table-column>
                  <el-table-column prop="库存" label="库存" width="120">
                    <template #default="{ row }">
                      <span :class="{ 'low-stock': row.库存 < 10 }">{{ row.库存 }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="销量" label="销量" width="120" />
                  <el-table-column label="状态" width="120">
                    <template #default="{ row }">
                      <el-tag :type="row.审核状态 === '已通过' ? 'success' : 'warning'">
                        {{ row.审核状态 }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="200">
                    <template #default="{ row }">
                      <el-button type="primary" size="small" @click="handleEditProduct(row)">编辑</el-button>
                      <el-button type="danger" size="small" @click="handleDeleteProduct(row)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-tab-pane>

            <el-tab-pane label="订单管理" name="orders">
              <el-card>
                <template #header>
                  <span>订单列表</span>
                </template>

                <el-table :data="orders">
                  <el-table-column prop="订单号" label="订单号" width="180" />
                  <el-table-column label="用户" width="120">
                    <template #default="{ row }">{{ row.用户名 }}</template>
                  </el-table-column>
                  <el-table-column label="收货人" width="120">
                    <template #default="{ row }">{{ row.收货人 }}</template>
                  </el-table-column>
                  <el-table-column prop="总价" label="金额" width="120">
                    <template #default="{ row }">¥{{ row.总价.toFixed(2) }}</template>
                  </el-table-column>
                  <el-table-column prop="状态" label="状态" width="120">
                    <template #default="{ row }">
                      <el-tag>{{ row.状态 }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="下单时间" label="下单时间" width="180" />
                  <el-table-column label="操作" width="150">
                    <template #default="{ row }">
                      <el-button
                        v-if="row.状态 === '待发货'"
                        type="primary"
                        size="small"
                        @click="handleShip(row)"
                      >
                        发货
                      </el-button>
                      <el-button size="small" @click="viewOrderDetail(row)">详情</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-tab-pane>

            <el-tab-pane label="库存预警" name="stock">
              <el-card>
                <template #header>
                  <span>库存预警</span>
                </template>

                <el-alert
                  v-for="item in lowStockProducts"
                  :key="item.产品ID"
                  :title="`${item.产品名称} 库存不足 (${item.库存})`"
                  type="warning"
                  :closable="false"
                  show-icon
                  style="margin-bottom: 10px"
                />
                <el-empty v-if="lowStockProducts.length === 0" description="库存充足"></el-empty>
              </el-card>
            </el-tab-pane>

            <el-tab-pane label="销量统计" name="statistics">
              <el-card>
                <template #header>
                  <span>销量统计</span>
                </template>
                <div ref="chartRef" class="chart-container"></div>
              </el-card>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>

    <el-dialog v-model="showProductDialog" :title="isEditing ? '编辑产品' : '添加产品'" width="600px">
      <el-form ref="productFormRef" :model="productForm" :rules="productRules" label-width="100px">
        <el-form-item label="产品名称" prop="产品名称">
          <el-input v-model="productForm.产品名称" />
        </el-form-item>
        <el-form-item label="分类" prop="分类ID">
          <el-select v-model="productForm.分类ID" placeholder="请选择分类">
            <el-option
              v-for="cat in categories"
              :key="cat.分类ID"
              :label="cat.分类名称"
              :value="cat.分类ID"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="价格">
          <el-input-number v-model="productForm.价格" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="库存" prop="库存">
          <el-input-number v-model="productForm.库存" :min="0" />
        </el-form-item>
        <el-form-item label="产品图片" prop="图片">
          <el-input v-model="productForm.图片" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="产品描述" prop="描述">
          <el-input v-model="productForm.描述" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showProductDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveProduct">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import {
  getMerchantProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getMerchantOrders,
  shipOrder,
  getStockAlert,
  getSalesStatistics
} from '../api/merchant'
import { getCategories } from '../api/category'

const router = useRouter()

const activeTab = ref('products')
const products = ref([])
const orders = ref([])
const categories = ref([])
const lowStockProducts = computed(() => products.value.filter(p => p.库存 < 10))
const showProductDialog = ref(false)
const isEditing = ref(false)
const productFormRef = ref(null)
const chartRef = ref(null)
const chartInstance = ref(null)

const productForm = reactive({
  产品ID: null,
  产品名称: '',
  分类ID: null,
  价格: 0,
  库存: 0,
  图片: '',
  描述: ''
})

const productRules = {
  产品名称: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  分类ID: [{ required: true, message: '请选择分类', trigger: 'change' }],
  价格: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  库存: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

const loadProducts = async () => {
  try {
    const res = await getMerchantProducts()
    products.value = res.data || []
  } catch (error) {
    console.error(error)
  }
}

const loadOrders = async () => {
  try {
    const res = await getMerchantOrders({})
    orders.value = res.data?.list || []
  } catch (error) {
    console.error(error)
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

const loadStockAlert = async () => {
  try {
    const res = await getStockAlert()
    products.value = res.data || []
  } catch (error) {
    console.error(error)
  }
}

const loadSalesStatistics = async () => {
  try {
    const res = await getSalesStatistics()
    const data = res.data || []
    nextTick(() => {
      initChart(data)
    })
  } catch (error) {
    console.error(error)
  }
}

const initChart = (data) => {
  if (!chartRef.value) return

  if (chartInstance.value) {
    chartInstance.value.dispose()
  }

  chartInstance.value = echarts.init(chartRef.value)
  const option = {
    title: { text: '产品销量统计', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: data.map(p => p.产品名称),
      axisLabel: { rotate: 45 }
    },
    yAxis: { type: 'value' },
    series: [{
      data: data.map(p => p.销量),
      type: 'bar',
      itemStyle: { color: '#409eff' }
    }]
  }
  chartInstance.value.setOption(option)
}

const handleEditProduct = (product) => {
  isEditing.value = true
  Object.assign(productForm, product)
  showProductDialog.value = true
}

const handleDeleteProduct = async (product) => {
  try {
    await ElMessageBox.confirm('确定要删除该产品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteProduct(product.产品ID)
    ElMessage.success('删除成功')
    loadProducts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleSaveProduct = async () => {
  try {
    if (isEditing.value) {
      await updateProduct(productForm.产品ID, productForm)
    } else {
      await addProduct(productForm)
    }
    ElMessage.success('保存成功')
    showProductDialog.value = false
    loadProducts()
  } catch (error) {
    console.error(error)
  }
}

const handleShip = async (order) => {
  try {
    await shipOrder(order.订单ID)
    ElMessage.success('发货成功')
    loadOrders()
  } catch (error) {
    console.error(error)
  }
}

const viewOrderDetail = (order) => {
  router.push(`/order/${order.订单ID}`)
}

watch(activeTab, (newTab) => {
  if (newTab === 'products') {
    loadProducts()
  } else if (newTab === 'orders') {
    loadOrders()
  } else if (newTab === 'stock') {
    loadStockAlert()
  } else if (newTab === 'statistics') {
    loadSalesStatistics()
  }
})

onMounted(() => {
  loadCategories()
  loadProducts()
})
</script>

<style scoped>
.craftsman-container {
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-thumb {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.low-stock {
  color: #f56c6c;
  font-weight: bold;
}

.chart-container {
  width: 100%;
  height: 400px;
}
</style>
