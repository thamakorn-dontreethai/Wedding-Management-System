import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

// POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { name, email, password, phone, role, providerType, bankAccount, bankName, maxGuests } = req.body

        const exists = await User.findOne({ email })
        if (exists) return res.status(400).json({ message: 'อีเมลนี้ถูกใช้แล้ว' })

        // ป้องกันสร้าง admin ผ่าน API
        if (role === 'admin') return res.status(403).json({ message: 'ไม่อนุญาต' })

        const user = await User.create({
            name, email, password, phone, role: role || 'customer',
            providerType, bankAccount, bankName, maxGuests,
        })

        res.status(201).json({ token: signToken(user._id), user })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) return res.status(400).json({ message: 'กรุณากรอก email และ password' })

        const user = await User.findOne({ email }).select('+password')
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'email หรือ password ไม่ถูกต้อง' })
        }

        res.json({ token: signToken(user._id), user })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET /api/auth/me
export const getMe = async (req, res) => {
    res.json(req.user)
}