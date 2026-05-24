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
    const products = await query('SELECT p.* FROM product p LIMIT 1')

    console.log('原始返回字段:')
    Object.keys(products[0]).forEach(key => {
      console.log(`  "${key}"`)
    })

    await pool.end()
  } catch (error) {
    console.error('查询失败:', error.message)
    process.exit(1)
  }
}

testQuery()