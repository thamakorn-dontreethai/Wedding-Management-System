import mongoose from 'mongoose'

const venueSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    address: { type: String, required: true },
    province: { type: String, required: true },
    capacity: {
        buffet: { type: Number, required: true },  // จำนวนแขก buffet สูงสุด
        chinese: { type: Number, required: true },  // จำนวนแขก โต๊ะจีน สูงสุด
    },
    pricePerSession: { type: Number, required: true },
    images: [{ type: String }],
    availableDates: [{ type: Date }],
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

venueSchema.index({ province: 1 })

export default mongoose.model('Venue', venueSchema)