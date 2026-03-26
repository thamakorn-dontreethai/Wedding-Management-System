import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String },
    role: { type: String, enum: ['customer', 'provider', 'admin'], default: 'customer' },

    // เฉพาะ Provider
    providerType: { type: String, enum: ['food', 'music', 'photo', null], default: null },
    bankAccount: { type: String },
    bankName: { type: String },
    maxGuests: { type: Number, default: 0 },
    availableDates: [{ type: Date }],

}, { timestamps: true })

// Hash password ก่อน save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// ตรวจสอบ password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

// ไม่ส่ง password กลับ client
userSchema.set('toJSON', {
    transform: (_, ret) => { delete ret.password; return ret }
})

export default mongoose.model('User', userSchema)