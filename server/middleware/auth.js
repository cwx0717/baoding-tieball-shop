import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未授权' })
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ code: 401, message: 'Token无效' })
  }
}

export const generateToken = (user) => {
  return jwt.sign(
    { 用户ID: user.用户ID, 用户名: user.用户名, 角色: user.角色 },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export const adminMiddleware = (req, res, next) => {
  if (req.user.角色 !== '管理员') {
    return res.status(403).json({ code: 403, message: '无权限访问' })
  }
  next()
}

export const merchantMiddleware = (req, res, next) => {
  if (req.user.角色 !== '商家') {
    return res.status(403).json({ code: 403, message: '无权限访问' })
  }
  next()
}
