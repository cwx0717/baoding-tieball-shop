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

const updateProducts = async () => {
  try {
    console.log('=== 查看当前产品数据 ===')
    const products = await query('SELECT * FROM product')
    products.forEach(p => {
      console.log(`ID: ${p.产品ID}, 名称: ${p.产品名}, 分类: ${p.分类}`)
    })

    console.log('\n=== 更新产品图片和简介 ===')

    const descriptions = {
      '百福铁球': '由国家级非遗传承人张大师打造，采用铸铁原料与传统锻造+雕刻工艺制作，直径5cm，定位传统摆件。产品融合传统福纹雕刻技艺，兼具把玩观赏价值与非遗工艺收藏属性，主打家居陈设与文化收藏用途。',
      '龙凤呈祥铁球': '出自省级非遗传承人李师傅之手，选用精钢材质，运用镂空雕刻工艺加工，直径6cm，为婚庆礼品类产品。以龙凤纹样为核心设计元素，雕刻细节细腻精致，寓意吉祥美满，适用于婚嫁送礼、新婚纪念场景。',
      '健身铁球': '由张大师制作，采用普通铸铁材质，经抛光打磨工艺成型，直径4cm，属于保健用品。球面光滑圆润，适配手部把玩锻炼，兼顾日常手部康复、健身活络的实用功能，性价比高，面向大众日常健身需求。'
    }

    const images = {
      '百福铁球': '/assets/baifu.jpg',
      '龙凤呈祥铁球': '/assets/longfeng.png',
      '健身铁球': '/assets/jianshen.jpg'
    }

    for (const [name, desc] of Object.entries(descriptions)) {
      const image = images[name]
      await query(
        'UPDATE product SET 图片 = ?, 描述 = ? WHERE 产品名 = ?',
        [image, desc, name]
      )
      console.log(`✓ 更新 ${name}`)
    }

    console.log('\n=== 验证更新后的数据 ===')
    const updated = await query('SELECT 产品ID, 产品名, 图片, 描述 FROM product')
    updated.forEach(p => {
      console.log(`ID: ${p.产品ID}, 名称: ${p.产品名}`)
      console.log(`  图片: ${p.图片}`)
      console.log(`  描述: ${p.描述.substring(0, 50)}...`)
    })

    await pool.end()
  } catch (error) {
    console.error('操作失败:', error.message)
    process.exit(1)
  }
}

updateProducts()