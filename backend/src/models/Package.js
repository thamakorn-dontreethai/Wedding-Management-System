const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", default: null },
    basePrice: { type: Number, required: true },
    maxGuests: { type: Number, default: 0 },
    includeFood: { type: Boolean, default: false },
    includeMusic: { type: Boolean, default: false },
    includePhoto: { type: Boolean, default: false },
    addonFoodPrice: { type: Number, default: 0 },
    addonMusicPrice: { type: Number, default: 0 },
    addonPhotoPrice: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Package", packageSchema);