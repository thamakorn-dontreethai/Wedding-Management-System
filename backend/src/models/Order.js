import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
    serviceType: { type: String, required: true, enum: ['food', 'music', 'photo'] },
    eventDate: { type: Date, required: true },
    guestCount: { type: Number },
    providerFee: { type: Number, required: true },
    status: {
        type: String,
        enum: ['assigned', 'acknowledged', 'prepared', 'completed'],
        default: 'assigned',
    },
    notes: { type: String },
}, { timestamps: true })

export default mongoose.model('Order', orderSchema)