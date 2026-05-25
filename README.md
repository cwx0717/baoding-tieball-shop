# 保定铁球非遗销售系统

基于 Vue 3 + Element Plus + Node.js + MySQL 的前后端分离非遗产品销售系统。

## 项目结构

```
baoding-tieball-shop/
├── client/                 # 前端项目
│   ├── src/
│   │   ├── api/           # API接口
│   │   ├── router/        # 路由配置
│   │   ├── utils/        # 工具函数
│   │   └── views/        # 页面组件
│   ├── package.json
│   └── vite.config.js
├── server/                 # 后端项目
│   ├── db/
│   │   ├── database.js    # 数据库连接
│   │   └── init.sql       # 数据库初始化脚本
│   ├── middleware/        # 中间件
│   ├── routes/           # 路由
│   ├── package.json
│   └── app.js
└── start.bat              # 启动脚本
```

## 功能特性

### 用户角色
- **游客**: 浏览产品、分类、详情
- **普通用户**: 注册/登录、购物车、下单、订单管理、评价
- **商家**: 产品管理、订单处理、库存预警、销量统计
- **管理员**: 用户管理、产品审核、订单管理

### 核心功能
1. 用户认证（登录/注册）
2. 产品展示与分类
3. 购物车管理
4. 订单流程
5. 商品评价
6. 商家管理后台
7. 管理员后台

### 数据库特性
- 触发器：订单更新库存、订单取消/删除恢复库存
- 视图：用户订单视图、产品销量统计视图、库存预警视图
- 多表关联查询

## 快速开始

### 1. 初始化数据库

```bash
# 登录MySQL
mysql -u root -p

# 执行初始化脚本
source server/db/init.sql
```

### 2. 配置数据库连接

编辑 `server/.env` 文件：

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=shop_db
JWT_SECRET=your_secret_key
```

### 3. 启动项目

双击运行 `start.bat` 或手动启动：

```bash
# 启动后端
cd server
npm install
npm start

# 启动前端（新窗口）
cd client
npm install
npm run dev
```

### 4. 访问系统

- 前端地址: http://localhost:3000
- 后端地址: http://localhost:5000

## 测试账号

| 角色   | 用户名  | 密码      |
|--------|---------|-----------|
| 管理员 | admin   | admin123  |
| 用户   | testuser | user123  |

## 技术栈

### 前端
- Vue 3
- Element Plus
- Vue Router
- Axios
- ECharts

### 后端
- Node.js
- Express
- MySQL
- JWT
- bcryptjs

## 移动端适配

系统已适配移动端，响应式设计支持手机和平板访问。
