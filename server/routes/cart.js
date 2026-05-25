import express from 'express'
import { query } from '../db/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const userId = req.user.用户ID

    const cartItems = await query(`
      SELECT c.*, p.产品名, p.价格, p.图片, p.库存
      FROM cart c
      JOIN product p ON c.产品ID = p.产品ID
      WHERE c.用户ID = ?
      ORDER BY c.加入时间 DESC
    `, [userId])

    res.json({ code: 200, data: cartItems })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

router.post('/', async (req, res) => {
  try {
    const userId = req.user.用户ID
    const { 产品ID, 数量 = 1 } = req.body

    const existingItems = await query(
      'SELECT * FROM cart WHERE 用户ID = ? AND 产品ID = ?',
      [userId, 产品ID]
    )

    if (existingItems.length > 0) {
      await query(
        'UPDATE cart SET 数量 = 数量 + ? WHERE 用户ID = ? AND 产品ID = ?',
        [数量, userId, 产品ID]
      )
    } else {
      await query(
        'INSERT INTO cart (用户ID, 产品ID, 数量) VALUES (?, ?, ?)',
        [userId, 产品ID, 数量]
      )
    }

    res.json({ code: 200, message: '添加成功' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.用户ID
    const { id } = req.params
    const { 数量 } = req.body

    await query(
      'UPDATE cart SET 数量 = ? WHERE 用户ID = ? AND 产品ID = ?',
      [数量, userId, id]
    )

    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.用户ID
    const { id } = req.params

    await query('DELETE FROM cart WHERE 用户ID = ? AND 产品ID = ?', [userId, id])

    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

router.delete('/', async (req, res) => {
  try {
    const userId = req.user.用户ID

    await query('DELETE FROM cart WHERE 用户ID = ?', [userId])

    res.json({ code: 200, message: '清空成功' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

export default router
