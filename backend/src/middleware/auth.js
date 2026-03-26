import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// ตรวจสอบ JWT token
export const protect = async (req, res, next) => {
    const auth = req.headers.authorization
    if (!auth?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'ไม่มีสิทธิ์เข้าถึง' })
    }
    try {
        const token = auth.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id).select('-password')
        if (!req.user) return res.status(401).json({ message: 'ไม่พบผู้ใช้' })
        next()
    } catch {
        res.status(401).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' })
    }
}

// จำกัดสิทธิ์ตาม role
export const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: `Role '${req.user.role}' ไม่มีสิทธิ์ใช้งาน` })
    }
    next()
}