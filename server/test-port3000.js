// 测试服务器 - 使用端口3000
import express from 'express'

const app = express()
const PORT = 3000

app.get('/', (req, res) => {
  console.log('收到请求:', req.ip)
  res.send('Hello World!')
})

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`)
})