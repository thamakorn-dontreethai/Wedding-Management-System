import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
    eventDate: { type: Date, required: true, index: true },
    guestCount: { type: Number, required: true },
    mealType: { type: String, required: true, enum: ['buffet', 'chinese'] },
    addFood: { type: Boolean, default: false },
    addMusic: { type: Boolean, default: false },
    addPhoto: { type: Boolean, default: false },
    totalPrice: { type: Number, required: true },
    depositAmount: { type: Number, required: true },
    remainingAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'deposit1_pending', 'deposit1_paid', 'deposit2_pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending',
    },
    notes: { type: String },
}, { timestamps: true })

export default mongoose.model('Booking', bookingSchema)