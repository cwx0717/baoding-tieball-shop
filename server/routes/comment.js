import express from 'express'
import { query } from '../db/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params

    const comments = await query(`
      SELECT c.*, u.姓名 as 用户姓名
      FROM comment c
      JOIN Users u ON c.用户ID = u.用户ID
      WHERE c.产品ID = ?
      ORDER BY c.评价时间 DESC
    `, [productId])

    res.json({ code: 200, data: comments })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.用户ID
    const { 产品ID, 订单ID, 评分, 内容 } = req.body

    console.log('Received comment data:', req.body)
    console.log('User ID:', userId)

    await query(
      'INSERT INTO comment (用户ID, 产品ID, 订单ID, 评分, 内容) VALUES (?, ?, ?, ?, ?)',
      [userId, 产品ID, 订单ID || null, 评分, 内容]
    )

    res.json({ code: 200, message: '评价成功' })
  } catch (error) {
    console.error('Comment insert error:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

export default router
