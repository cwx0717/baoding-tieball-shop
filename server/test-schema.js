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
    console.log('=== 产品表结构 ===')
    const [columns] = await pool.execute('SHOW COLUMNS FROM product')
    console.log(columns.map(c => `${c.Field} (${c.Type})`).join('\n'))

    console.log('\n=== 购物车表结构 ===')
    const [cartColumns] = await pool.execute('SHOW COLUMNS FROM cart')
    console.log(cartColumns.map(c => `${c.Field} (${c.Type})`).join('\n'))

    console.log('\n=== 购物车数据样例 ===')
    const cartItems = await query('SELECT c.*, p.产品名, p.价格 FROM cart c JOIN product p ON c.产品ID = p.产品ID LIMIT 2')
    console.log(JSON.stringify(cartItems, null, 2))

    await pool.end()
  } catch (error) {
    console.error('查询失败:', error.message)
    process.exit(1)
  }
}

testQuery()