const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: false }, // ✅ ไม่ required
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true },
    venueName: { type: String }, // ✅ เพิ่ม
    eventDate: { type: Date, required: true },
    guestCount: { type: Number, required: true },
    mealType: { type: String, required: true, enum: ["buffet", "chinese"] },
    addFood: { type: Boolean, default: false },
    addMusic: { type: Boolean, default: false },
    addPhoto: { type: Boolean, default: false },
    foodProviderId: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", default: null },
    photoProviderId: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", default: null },
    musicProviderId: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", default: null },
    totalPrice: { type: Number, required: true },
    depositAmount: { type: Number, required: true },
    remainingAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ["pending", "deposit1_pending", "deposit1_paid", "deposit2_pending", "deposit2_paid", "confirmed", "completed", "cancelled"],
        default: "pending",
    },
    notes: { type: String },
    rejectionNote: { type: String, default: null },
    orderStatuses: {
        food:  { type: String, enum: ["pending", "acknowledged", "ready"], default: "pending" },
        music: { type: String, enum: ["pending", "acknowledged", "ready"], default: "pending" },
        photo: { type: String, enum: ["pending", "acknowledged", "ready"], default: "pending" },
    },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);