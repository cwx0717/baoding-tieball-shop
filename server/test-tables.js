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
    console.log('=== 查看 product 表详情 ===')
    const [tables] = await pool.execute('SHOW CREATE TABLE product')
    console.log(tables[0]['Create Table'])

    console.log('\n=== 查看所有表 ===')
    const [allTables] = await pool.execute('SHOW TABLES')
    console.log(allTables.map(t => Object.values(t)[0]).join('\n'))

    await pool.end()
  } catch (error) {
    console.error('查询失败:', error.message)
    process.exit(1)
  }
}

testQuery()