import express from 'express'
import { query } from '../db/database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const userId = req.user.用户ID
    const { page = 1, pageSize = 10, status } = req.query
    const offset = (page - 1) * pageSize

    let sql = `
      SELECT o.*, 
             GROUP_CONCAT(p.产品名 SEPARATOR ', ') as 产品列表
      FROM orders o
      LEFT JOIN orderdetail od ON o.订单ID = od.订单ID
      LEFT JOIN product p ON od.产品ID = p.产品ID
      WHERE o.用户ID = ?
    `
    const params = [userId]

    if (status !== undefined) {
      sql += ' AND o.支付状态 = ?'
      params.push(status)
    }

    sql += ' GROUP BY o.订单ID ORDER BY o.下单时间 DESC LIMIT ? OFFSET ?'
    params.push(parseInt(pageSize), parseInt(offset))

    const orders = await query(sql, params)

    const countSql = `SELECT COUNT(*) as total FROM orders WHERE 用户ID = ? ${status !== undefined ? 'AND 支付状态 = ?' : ''}`
    const countParams = status !== undefined ? [userId, status] : [userId]
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

router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.用户ID
    const { id } = req.params

    const orders = await query(
      'SELECT * FROM orders WHERE 订单ID = ? AND 用户ID = ?',
      [id, userId]
    )

    if (orders.length === 0) {
      return res.status(404).json({ code: 404, message: '订单不存在' })
    }

    const orderDetails = await query(`
      SELECT od.*, p.产品名
      FROM orderdetail od
      JOIN product p ON od.产品ID = p.产品ID
      WHERE od.订单ID = ?
    `, [id])

    res.json({
      code: 200,
      data: {
        order: orders[0],
        details: orderDetails
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

router.post('/', async (req, res) => {
  try {
    const userId = req.user.用户ID
    const { items, 收货地址, 联系电话 } = req.body

    const orderNo = 'DD' + Date.now() + Math.random().toString(36).substr(2, 6)

    const totalAmount = items.reduce((sum, item) => sum + item.价格 * item.数量, 0)

    const orderResult = await query(
      'INSERT INTO orders (订单号, 用户ID, 总金额, 支付状态, 收货地址, 联系电话) VALUES (?, ?, ?, ?, ?, ?)',
      [orderNo, userId, totalAmount, 0, 收货地址, 联系电话]
    )

    const orderId = orderResult.insertId

    for (const item of items) {
      await query(
        'INSERT INTO orderdetail (订单ID, 产品ID, 单价, 数量) VALUES (?, ?, ?, ?)',
        [orderId, item.产品ID, item.价格, item.数量]
      )
    }

    await query('DELETE FROM cart WHERE 用户ID = ?', [userId])

    res.json({ code: 200, message: '下单成功', data: { 订单ID: orderId, 订单号: orderNo } })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

router.put('/:id/pay', async (req, res) => {
  try {
    const userId = req.user.用户ID
    const { id } = req.params

    await query(
      'UPDATE orders SET 支付状态 = 1 WHERE 订单ID = ? AND 用户ID = ? AND 支付状态 = 0',
      [id, userId]
    )

    res.json({ code: 200, message: '支付成功' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

router.put('/:id/cancel', async (req, res) => {
  try {
    const userId = req.user.用户ID
    const { id } = req.params

    await query(
      'UPDATE orders SET 支付状态 = 4 WHERE 订单ID = ? AND 用户ID = ? AND 支付状态 = 0',
      [id, userId]
    )

    res.json({ code: 200, message: '取消成功' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

export default router
