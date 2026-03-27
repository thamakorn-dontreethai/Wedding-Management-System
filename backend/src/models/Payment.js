import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    installment: { type: Number, required: true, enum: [1, 2] },
    amount: { type: Number, required: true },
    slipUrl: { type: String, required: true },
    transferDate: { type: Date, required: true },
    bankName: { type: String },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    verifiedAt: { type: Date },
    rejectReason: { type: String },
}, { timestamps: true })

export default mongoose.model('Payment', paymentSchema)