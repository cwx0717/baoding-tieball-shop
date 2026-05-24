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
    console.log('=== 查看产品表完整结构 ===')
    const [columns] = await pool.execute('SHOW COLUMNS FROM product')
    columns.forEach(col => {
      console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default} - ${col.Extra}`)
    })

    console.log('\n=== 查看产品数据 ===')
    const products = await query('SELECT * FROM product LIMIT 1')
    console.log('字段:', Object.keys(products[0]))
    console.log('数据:', JSON.stringify(products[0], null, 2))

    await pool.end()
  } catch (error) {
    console.error('查询失败:', error.message)
    process.exit(1)
  }
}

testQuery()