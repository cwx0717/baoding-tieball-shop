import express from 'express'
import { query } from '../db/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const categories = await query('SELECT * FROM categories ORDER BY 分类ID')
    res.json({ code: 200, data: categories })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

router.get('/:id/products', async (req, res) => {
  try {
    const { id } = req.params

    const products = await query(`
      SELECT p.*, c.分类名称, cr.工艺师名称
      FROM product p
      LEFT JOIN categories c ON p.分类ID = c.分类ID
      LEFT JOIN craftsman cr ON p.工艺师ID = cr.工艺师ID
      WHERE p.分类ID = ? AND p.审核状态 = '已通过'
      ORDER BY p.产品ID DESC
    `, [id])

    res.json({ code: 200, data: products })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

export default router
