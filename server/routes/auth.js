import express from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db/database.js'
import { generateToken } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { 账号, 密码, 电话, 地址, 姓名 } = req.body

    const existingUser = await query('SELECT * FROM Users WHERE 账号 = ?', [账号])
    if (existingUser.length > 0) {
      return res.status(400).json({ code: 400, message: '账号已存在' })
    }

    const hashedPassword = await bcrypt.hash(密码, 10)

    const result = await query(
      'INSERT INTO Users (账号, 密码, 姓名, 电话, 地址, 角色) VALUES (?, ?, ?, ?, ?, ?)',
      [账号, hashedPassword, 姓名, 电话, 地址, '普通用户']
    )

    res.json({ code: 200, message: '注册成功' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { 账号, 密码 } = req.body

    const users = await query('SELECT * FROM Users WHERE 账号 = ?', [账号])
    if (users.length === 0) {
      return res.status(401).json({ code: 401, message: '账号或密码错误' })
    }

    const user = users[0]
    const isPasswordValid = await bcrypt.compare(密码, user.密码)

    if (!isPasswordValid) {
      return res.status(401).json({ code: 401, message: '账号或密码错误' })
    }

    const token = generateToken({ 用户ID: user.用户ID, 用户名: user.账号, 角色: user.角色 })
    
    const { 密码: _, ...userInfo } = user
    userInfo.用户名 = user.账号

    res.json({
      code: 200,
      message: '登录成功',
      token,
      user: userInfo
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

router.get('/userinfo', async (req, res) => {
  try {
    const userId = req.user.用户ID
    const users = await query('SELECT 用户ID, 账号, 姓名, 电话, 地址, 角色 FROM Users WHERE 用户ID = ?', [userId])

    if (users.length === 0) {
      return res.status(404).json({ code: 404, message: '用户不存在' })
    }

    const user = users[0]
    user.用户名 = user.账号

    res.json({ code: 200, data: user })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

router.put('/userinfo', async (req, res) => {
  try {
    const userId = req.user.用户ID
    const { 电话, 地址, 姓名 } = req.body

    await query('UPDATE Users SET 电话 = ?, 地址 = ?, 姓名 = ? WHERE 用户ID = ?', [电话, 地址, 姓名, userId])

    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

export default router
