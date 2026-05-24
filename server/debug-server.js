import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  console.log(`[${new Date().toISOString()}] 健康检查请求 - IP: ${req.ip}`)
  res.json({ code: 200, message: 'Server is running' })
})

app.get('/api/test', (req, res) => {
  console.log(`[${new Date().toISOString()}] 测试请求`)
  res.json({ code: 200, message: '测试成功', data: { test: 'hello' } })
})

process.on('uncaughtException', (err) => {
  console.error(`未捕获的异常: ${err.message}`)
  console.error(err.stack)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error(`未处理的Promise拒绝: ${reason}`)
})

const PORT = process.env.PORT || 5000

console.log(`尝试启动服务器在端口 ${PORT}...`)

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器已启动在端口 ${PORT}`)
  console.log(`访问地址: http://localhost:${PORT}`)
})

server.on('error', (err) => {
  console.error(`服务器启动失败: ${err.message}`)
  process.exit(1)
})

server.on('listening', () => {
  console.log('服务器正在监听...')
})