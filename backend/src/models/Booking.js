import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
    eventDate: { type: Date, required: true },
    guestCount: { type: Number, required: true },
    mealType: { type: String, enum: ['buffet', 'chinese'], required: true },

    // บริการที่เลือก
    selectedServices: {
        food: { type: Boolean, default: false },
        music: { type: Boolean, default: false },
        photo: { type: Boolean, default: false },
    },

    totalPrice: { type: Number, required: true },
    depositAmount: { type: Number, required: true },  // มัดจำ 30%
    remainingAmount: { type: Number, required: true },

    status: {
        type: String,
        enum: ['pending', 'deposit1_pending', 'deposit1_paid', 'deposit2_pending', 'deposit2_paid', 'confirmed', 'completed', 'cancelled'],
        default: 'pending',
    },

    notes: { type: String },

}, { timestamps: true })

export default mongoose.model('Booking', bookingSchema)