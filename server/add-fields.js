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

const updateSchema = async () => {
  try {
    console.log('=== 添加图片和描述字段 ===')

    try {
      await query('ALTER TABLE product ADD COLUMN 图片 VARCHAR(255) DEFAULT NULL COMMENT "产品图片路径"')
      console.log('✓ 添加 图片 字段成功')
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('- 图片 字段已存在')
      } else throw err
    }

    try {
      await query('ALTER TABLE product ADD COLUMN 描述 TEXT DEFAULT NULL COMMENT "产品简介"')
      console.log('✓ 添加 描述 字段成功')
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('- 描述 字段已存在')
      } else throw err
    }

    console.log('\n=== 查看更新后的表结构 ===')
    const [columns] = await pool.execute('SHOW COLUMNS FROM product')
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type}`)
    })

    await pool.end()
  } catch (error) {
    console.error('操作失败:', error.message)
    process.exit(1)
  }
}

updateSchema()