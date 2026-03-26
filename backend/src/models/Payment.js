import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    installment: { type: Number, enum: [1, 2], required: true },  // งวดที่ 1 หรือ 2
    amount: { type: Number, required: true },
    slipUrl: { type: String, required: true },       // Cloudinary URL
    transferDate: { type: Date, required: true },
    bankName: { type: String },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },

    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Admin
    verifiedAt: { type: Date },
    rejectReason: { type: String },

}, { timestamps: true })

export default mongoose.model('Payment', paymentSchema)