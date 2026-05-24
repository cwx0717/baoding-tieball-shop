import express from 'express'
import { query } from '../db/database.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 12, categoryId, keyword } = req.query
    const offset = (page - 1) * pageSize

    let sql = `
      SELECT p.*
      FROM product p
      WHERE 1=1
    `
    const params = []

    if (categoryId) {
      sql += ' AND p.分类 = ?'
      params.push(categoryId)
    }

    if (keyword) {
      sql += ' AND (p.产品名 LIKE ?)'
      params.push(`%${keyword}%`)
    }

    const countSql = sql.replace('SELECT p.*', 'SELECT COUNT(*) as total')
    const countResult = await query(countSql, params)
    const total = countResult[0].total

    sql += ` ORDER BY p.产品ID DESC LIMIT ${parseInt(pageSize)} OFFSET ${parseInt(offset)}`

    const products = await query(sql, params)

    res.json({
      code: 200,
      data: {
        list: products,
        total,
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
    const { id } = req.params

    const products = await query('SELECT * FROM product WHERE 产品ID = ?', [id])

    if (products.length === 0) {
      return res.status(404).json({ code: 404, message: '产品不存在' })
    }

    res.json({ code: 200, data: products[0] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

export default router
