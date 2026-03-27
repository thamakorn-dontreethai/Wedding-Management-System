import mongoose from 'mongoose'

const receiptSchema = new mongoose.Schema({
    receiptNo: { type: String, unique: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    amount: { type: Number, required: true },
    installment: { type: Number, required: true, enum: [1, 2] },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    issuedAt: { type: Date, default: Date.now },
}, { timestamps: true })

// สร้าง receiptNo อัตโนมัติ เช่น WED-2026-0001
receiptSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await mongoose.model('Receipt').countDocuments()
        const year = new Date().getFullYear()
        this.receiptNo = `WED-${year}-${String(count + 1).padStart(4, '0')}`
    }
    next()
})

export default mongoose.model('Receipt', receiptSchema)