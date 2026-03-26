import mongoose from 'mongoose'

const packageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
    basePrice: { type: Number, required: true },

    // บริการที่รวมอยู่ในแพ็คเกจ (optional เลือกเพิ่มได้)
    includedServices: {
        food: { type: Boolean, default: false },
        music: { type: Boolean, default: false },
        photo: { type: Boolean, default: false },
    },

    // ราคาเพิ่มต่อบริการ (ถ้าไม่รวม)
    serviceAddons: {
        food: { type: Number, default: 0 },
        music: { type: Number, default: 0 },
        photo: { type: Number, default: 0 },
    },

    isActive: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Package', packageSchema)