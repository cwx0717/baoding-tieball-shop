import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/product.js'
import cartRoutes from './routes/cart.js'
import orderRoutes from './routes/order.js'
import commentRoutes from './routes/comment.js'
import categoryRoutes from './routes/category.js'
import merchantRoutes from './routes/merchant.js'
import adminRoutes from './routes/admin.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/merchant', merchantRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', (req, res) => {
  res.json({ code: 200, message: 'Server is running' })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ code: 500, message: 'Server error' })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
