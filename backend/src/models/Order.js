import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceType: { type: String, enum: ['food', 'music', 'photo'], required: true },
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