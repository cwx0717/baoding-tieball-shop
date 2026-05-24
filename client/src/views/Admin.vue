<template>
  <div class="admin-container">
    <div class="header">
      <h2>系统管理中心</h2>
      <el-button :icon="ArrowLeft" @click="$router.back()">返回</el-button>
    </div>

    <div class="admin-content">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="用户管理" name="users">
              <el-card>
                <template #header>
                  <span>用户列表</span>
                </template>

                <el-table :data="users">
                  <el-table-column prop="用户ID" label="ID" width="80" />
                  <el-table-column prop="用户名" label="用户名" width="150" />
                  <el-table-column prop="手机号" label="手机号" width="150" />
                  <el-table-column prop="邮箱" label="邮箱" width="200" />
                  <el-table-column prop="角色" label="角色" width="120">
                    <template #default="{ row }">
                      <el-tag>{{ row.角色 }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="注册时间" label="注册时间" width="180" />
                  <el-table-column label="操作" width="150">
                    <template #default="{ row }">
                      <el-button type="primary" size="small" @click="handleEditUser(row)">编辑</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-tab-pane>

            <el-tab-pane label="产品审核" name="products">
              <el-card>
                <template #header>
                  <span>待审核产品</span>
                </template>

                <el-table :data="pendingProducts">
                  <el-table-column prop="产品ID" label="ID" width="80" />
                  <el-table-column label="产品" min-width="200">
                    <template #default="{ row }">
                      <div class="product-cell">
                        <img :src="row.图片 || '/default-product.jpg'" class="product-thumb" />
                        <span>{{ row.产品名称 }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="工艺师名称" label="工艺师" width="150" />
                  <el-table-column prop="价格" label="价格" width="120">
                    <template #default="{ row }">¥{{ row.价格 }}</template>
                  </el-table-column>
                  <el-table-column prop="库存" label="库存" width="120" />
                  <el-table-column label="操作" width="200">
                    <template #default="{ row }">
                      <el-button type="success" size="small" @click="handleApprove(row)">通过</el-button>
                      <el-button type="danger" size="small" @click="handleReject(row)">拒绝</el-button>
                    </template>
                  </el-table-column>
                </el-table>

                <el-empty v-if="pendingProducts.length === 0" description="暂无待审核产品"></el-empty>
              </el-card>
            </el-tab-pane>

            <el-tab-pane label="订单管理" name="orders">
              <el-card>
                <template #header>
                  <span>所有订单</span>
                </template>

                <el-table :data="orders">
                  <el-table-column prop="订单号" label="订单号" width="180" />
                  <el-table-column prop="用户名" label="用户" width="120" />
                  <el-table-column prop="收货人" label="收货人" width="120" />
                  <el-table-column prop="总价" label="金额" width="120">
                    <template #default="{ row }">¥{{ row.总价.toFixed(2) }}</template>
                  </el-table-column>
                  <el-table-column prop="状态" label="状态" width="120">
                    <template #default="{ row }">
                      <el-tag>{{ row.状态 }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="下单时间" label="下单时间" width="180" />
                </el-table>
              </el-card>
            </el-tab-pane>

            <el-tab-pane label="分类管理" name="categories">
              <el-card>
                <template #header>
                  <div class="card-header">
                    <span>产品分类</span>
                    <el-button type="primary" size="small" @click="handleAddCategory">添加分类</el-button>
                  </div>
                </template>

                <el-table :data="categories">
                  <el-table-column prop="分类ID" label="ID" width="100" />
                  <el-table-column prop="分类名称" label="分类名称" min-width="200" />
                  <el-table-column prop="分类描述" label="描述" min-width="300" />
                  <el-table-column label="操作" width="150">
                    <template #default="{ row }">
                      <el-button type="primary" size="small" @click="handleEditCategory(row)">编辑</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>

    <el-dialog v-model="showCategoryDialog" title="分类管理" width="500px">
      <el-form ref="categoryFormRef" :model="categoryForm" label-width="100px">
        <el-form-item label="分类名称">
          <el-input v-model="categoryForm.分类名称" />
        </el-form-item>
        <el-form-item label="分类描述">
          <el-input v-model="categoryForm.分类描述" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCategoryDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveCategory">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import {
  getAllUsers,
  updateUser,
  getPendingProducts,
  approveProduct,
  rejectProduct,
  getAllOrders,
  getCategories,
  addCategory,
  updateCategory
} from '../api/admin'

const activeTab = ref('users')
const users = ref([])
const pendingProducts = ref([])
const orders = ref([])
const categories = ref([])
const showCategoryDialog = ref(false)
const categoryFormRef = ref(null)

const categoryForm = reactive({
  分类ID: null,
  分类名称: '',
  分类描述: ''
})

const loadUsers = async () => {
  try {
    const res = await getAllUsers()
    users.value = res.data || []
  } catch (error) {
    console.error(error)
  }
}

const loadPendingProducts = async () => {
  try {
    const res = await getPendingProducts()
    pendingProducts.value = res.data || []
  } catch (error) {
    console.error(error)
  }
}

const loadOrders = async () => {
  try {
    const res = await getAllOrders({})
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

const handleEditUser = async (user) => {
  try {
    const { value: role } = await ElMessageBox.prompt('请输入用户角色', '编辑用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: user.角色,
      inputPattern: /^(用户|商家|管理员)$/,
      inputErrorMessage: '角色必须是用户、商家或管理员'
    })

    await updateUser(user.用户ID, { 角色: role })
    ElMessage.success('更新成功')
    loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleApprove = async (product) => {
  try {
    await approveProduct(product.产品ID)
    ElMessage.success('已通过审核')
    loadPendingProducts()
  } catch (error) {
    console.error(error)
  }
}

const handleReject = async (product) => {
  try {
    await rejectProduct(product.产品ID)
    ElMessage.success('已拒绝')
    loadPendingProducts()
  } catch (error) {
    console.error(error)
  }
}

const handleAddCategory = () => {
  categoryForm.分类ID = null
  categoryForm.分类名称 = ''
  categoryForm.分类描述 = ''
  showCategoryDialog.value = true
}

const handleEditCategory = (category) => {
  Object.assign(categoryForm, category)
  showCategoryDialog.value = true
}

const handleSaveCategory = async () => {
  try {
    if (categoryForm.分类ID) {
      await updateCategory(categoryForm.分类ID, categoryForm)
    } else {
      await addCategory(categoryForm)
    }
    ElMessage.success('保存成功')
    showCategoryDialog.value = false
    loadCategories()
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  loadUsers()
  loadPendingProducts()
  loadOrders()
  loadCategories()
})
</script>

<style scoped>
.admin-container {
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
</style>
