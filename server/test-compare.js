import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shop_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

const query = async (sql, params) => {
  const [results] = await pool.execute(sql, params)
  return results
}

const testQuery = async () => {
  try {
    console.log('=== 直接查询 product 表 ===')
    const products = await query('SELECT * FROM product LIMIT 1')
    console.log('返回的字段名:')
    Object.keys(products[0]).forEach(key => {
      console.log(`  [${key}]`)
    })

    console.log('\n=== 通过 pool.execute 查询 ===')
    const [rows] = await pool.execute('SELECT * FROM product LIMIT 1')
    console.log('返回的字段名:')
    Object.keys(rows[0]).forEach(key => {
      console.log(`  [${key}]`)
    })

    await pool.end()
  } catch (error) {
    console.error('查询失败:', error.message)
    process.exit(1)
  }
}

testQuery()