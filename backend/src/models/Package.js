import mongoose from 'mongoose'

const packageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
    basePrice: { type: Number, required: true },
    includeFood: { type: Boolean, default: false },
    includeMusic: { type: Boolean, default: false },
    includePhoto: { type: Boolean, default: false },
    addonFoodPrice: { type: Number, default: 0 },
    addonMusicPrice: { type: Number, default: 0 },
    addonPhotoPrice: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Package', packageSchema)