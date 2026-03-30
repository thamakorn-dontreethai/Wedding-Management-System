const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    installment: { type: Number, required: true, enum: [1, 2] },
    amount: { type: Number, required: true },
    slipUrl: { type: String, default: "" },       // ✅ ไม่ required
    transferDate: { type: Date, default: Date.now },  // ✅ default วันนี้
    bankName: { type: String },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    verifiedAt: { type: Date },
    rejectReason: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);