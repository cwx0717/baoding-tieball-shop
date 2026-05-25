// 测试服务器 - 明确指定监听地址
import express from 'express'

const app = express()
const PORT = 5000

app.get('/', (req, res) => {
  console.log('收到请求')
  res.send('Hello World!')
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`)
  console.log(`Local access: http://127.0.0.1:${PORT}`)
})