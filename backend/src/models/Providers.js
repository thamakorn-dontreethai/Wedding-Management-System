const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const providerSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String },
    serviceType: { type: String, required: true, enum: ["food", "music", "photo"] },
    supportsMealType: { type: String, enum: ["buffet", "chinese", "both"], default: "both" }, // สำหรับ food provider
    price: { type: Number, default: 500, min: 0 },
    maxGuests: { type: Number, default: 0 },
    bankName: { type: String },
    bankAccount: { type: String },
    unavailableDates: [{ dateKey: { type: String }, note: { type: String } }],
}, { timestamps: true });

providerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

providerSchema.methods.matchPassword = async function (entered) {
    return await bcrypt.compare(entered, this.password);
};

providerSchema.set("toJSON", {
    transform: (_, ret) => { delete ret.password; return ret; }
});

module.exports = mongoose.model("provider", providerSchema);