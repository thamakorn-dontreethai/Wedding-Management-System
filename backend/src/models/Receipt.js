import mongoose from 'mongoose'

const receiptSchema = new mongoose.Schema({
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiptNo: { type: String, required: true, unique: true },  // WED-2024-0001
    amount: { type: Number, required: true },
    installment: { type: Number, enum: [1, 2], required: true },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Admin
}, { timestamps: true })

// Auto-generate receipt number
receiptSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await mongoose.model('Receipt').countDocuments()
        const year = new Date().getFullYear()
        this.receiptNo = `WED-${year}-${String(count + 1).padStart(4, '0')}`
    }
    next()
})

export default mongoose.model('Receipt', receiptSchema)