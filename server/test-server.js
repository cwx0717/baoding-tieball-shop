import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  console.log('健康检查请求')
  res.json({ code: 200, message: 'Server is running' })
})

app.get('/api/test', (req, res) => {
  console.log('测试请求')
  res.json({ code: 200, message: '测试成功', data: { test: 'hello' } })
})

app.use((err, req, res, next) => {
  console.error('服务器错误:', err)
  res.status(500).json({ code: 500, message: 'Server error' })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}).on('error', (err) => {
  console.error('服务器启动失败:', err)
})