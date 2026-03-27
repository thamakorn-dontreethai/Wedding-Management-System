import mongoose from 'mongoose'

const venueSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    address: { type: String, required: true },
    province: { type: String, required: true, index: true },
    capacityBuffet: { type: Number, required: true },
    capacityChinese: { type: Number, required: true },
    pricePerSession: { type: Number, required: true },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Venue', venueSchema)