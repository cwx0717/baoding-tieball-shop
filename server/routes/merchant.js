import express from 'express'
import { query } from '../db/database.js'
import { authMiddleware, merchantMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)
router.use(merchantMiddleware)

router.get('/products', async (req, res) => {
  try {
    const products = await query(`
      SELECT p.*
      FROM product p
      ORDER BY p.产品ID DESC
    `)

    res.json({ code: 200, data: products })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

router.post('/products', async (req, res) => {
  try {
    const { 产品名, 分类, 材质, 工艺, 尺寸, 价格, 库存 } = req.body

    const result = await query(
      'INSERT INTO product (产品名, 分类, 材质, 工艺, 尺寸, 价格, 库存) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [产品名, 分类, 材质, 工艺, 尺寸, 价格, 库存]
    )

    res.json({ code: 200, message: '添加成功', data: { 产品ID: result.insertId } })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { 产品名, 分类, 材质, 工艺, 尺寸, 价格, 库存 } = req.body

    await query(
      'UPDATE product SET 产品名 = ?, 分类 = ?, 材质 = ?, 工艺 = ?, 尺寸 = ?, 价格 = ?, 库存 = ? WHERE 产品ID = ?',
      [产品名, 分类, 材质, 工艺, 尺寸, 价格, 库存, id]
    )

    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params

    await query('DELETE FROM product WHERE 产品ID = ?', [id])

    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

router.get('/orders', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query
    const offset = (page - 1) * pageSize

    let sql = `
      SELECT o.*, 
             GROUP_CONCAT(p.产品名 SEPARATOR ', ') as 产品列表
      FROM orders o
      LEFT JOIN orderdetail od ON o.订单ID = od.订单ID
      LEFT JOIN product p ON od.产品ID = p.产品ID
      WHERE 1=1
    `
    const params = []

    if (status !== undefined) {
      sql += ' AND o.支付状态 = ?'
      params.push(status)
    }

    sql += ' GROUP BY o.订单ID ORDER BY o.下单时间 DESC LIMIT ? OFFSET ?'
    params.push(parseInt(pageSize), parseInt(offset))

    const orders = await query(sql, params)

    const countSql = `SELECT COUNT(*) as total FROM orders ${status !== undefined ? 'WHERE 支付状态 = ?' : ''}`
    const countParams = status !== undefined ? [status] : []
    const countResult = await query(countSql, countParams)

    res.json({
      code: 200,
      data: {
        list: orders,
        total: countResult[0].total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

router.get('/low-stock', async (req, res) => {
  try {
    const lowStockProducts = await query(`
      SELECT * FROM product WHERE 库存 < 10
    `)

    res.json({ code: 200, data: lowStockProducts })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

router.get('/sales-statistics', async (req, res) => {
  try {
    const salesData = await query(`
      SELECT 
        MONTH(o.下单时间) as 月份,
        SUM(od.数量) as 销量,
        SUM(od.单价 * od.数量) as 销售额
      FROM orders o
      JOIN orderdetail od ON o.订单ID = od.订单ID
      WHERE o.支付状态 = 1
      GROUP BY MONTH(o.下单时间)
      ORDER BY 月份
    `)

    res.json({ code: 200, data: salesData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

export default router
