import express from 'express'
import { query } from '../db/database.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)
router.use(adminMiddleware)

router.get('/users', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, role } = req.query
    const offset = (page - 1) * pageSize

    let sql = 'SELECT 用户ID, 账号, 姓名, 电话, 地址, 角色, 密码 FROM Users WHERE 角色 != ?'
    const params = ['管理员']

    if (role) {
      sql += ' AND 角色 = ?'
      params.push(role)
    }

    sql += ' ORDER BY 用户ID DESC LIMIT ? OFFSET ?'
    params.push(parseInt(pageSize), parseInt(offset))

    const users = await query(sql, params)

    const countSql = `SELECT COUNT(*) as total FROM Users WHERE 角色 != ? ${role ? 'AND 角色 = ?' : ''}`
    const countParams = role ? ['管理员', role] : ['管理员']
    const countResult = await query(countSql, countParams)

    res.json({
      code: 200,
      data: {
        list: users,
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

router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { 角色 } = req.body

    await query('UPDATE Users SET 角色 = ? WHERE 用户ID = ?', [角色, id])

    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params

    await query('DELETE FROM Users WHERE 用户ID = ?', [id])

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
      SELECT o.*, u.账号 as 用户名, u.姓名 as 用户姓名
      FROM orders o
      JOIN Users u ON o.用户ID = u.用户ID
      WHERE 1=1
    `
    const params = []

    if (status !== undefined) {
      sql += ' AND o.支付状态 = ?'
      params.push(status)
    }

    sql += ' ORDER BY o.下单时间 DESC LIMIT ? OFFSET ?'
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

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { 支付状态 } = req.body

    await query('UPDATE orders SET 支付状态 = ? WHERE 订单ID = ?', [支付状态, id])

    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

export default router
