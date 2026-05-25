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
    console.log('=== 直接查询产品表 ===')
    const products = await query('SELECT * FROM product LIMIT 1')
    console.log('字段名:', Object.keys(products[0]).join(', '))
    console.log('数据:', JSON.stringify(products[0], null, 2))

    console.log('\n=== 直接查询购物车表 ===')
    const cartItems = await query('SELECT c.*, p.产品名, p.价格 FROM cart c JOIN product p ON c.产品ID = p.产品ID LIMIT 1')
    console.log('字段名:', Object.keys(cartItems[0]).join(', '))
    console.log('数据:', JSON.stringify(cartItems[0], null, 2))

    await pool.end()
  } catch (error) {
    console.error('查询失败:', error.message)
    process.exit(1)
  }
}

testQuery()