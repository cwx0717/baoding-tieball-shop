import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const testConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'shop_db'
    })
    
    console.log('数据库连接成功!')
    
    const [rows] = await connection.execute('SELECT 1 + 1 as result')
    console.log('查询测试:', rows)
    
    await connection.end()
  } catch (error) {
    console.error('数据库连接失败:', error.message)
    process.exit(1)
  }
}

testConnection()