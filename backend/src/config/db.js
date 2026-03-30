const mongoose = require("mongoose");
const Admin = require("../models/Admin");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const seedDefaultAdmin = async () => {
    const shouldSeed = process.env.NODE_ENV !== "production" || process.env.ENABLE_DEFAULT_ADMIN_SEED === "true";
    if (!shouldSeed) return;

    const defaultAdmin = {
        username: process.env.DEFAULT_ADMIN_USERNAME || "admin",
        email: (process.env.DEFAULT_ADMIN_EMAIL || "admin@wedding.local").toLowerCase(),
        password: process.env.DEFAULT_ADMIN_PASSWORD || "admin123456",
        phone: process.env.DEFAULT_ADMIN_PHONE || "0899999999",
    };

    const existingAdmin = await Admin.findOne({ email: defaultAdmin.email });
    if (existingAdmin) return;

    await Admin.create(defaultAdmin);
    console.log(`Default admin created: ${defaultAdmin.email}`);
};

const connectDB = async () => {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error("MongoDB connection error: MONGODB_URI is not set");
        if (process.env.NODE_ENV === "production") {
            process.exit(1);
        }
        return;
    }

    const isProduction = process.env.NODE_ENV === "production";
    const maxAttempts = isProduction ? 3 : Infinity;
    let attempt = 0;

    while (attempt < maxAttempts) {
        attempt += 1;
        try {
            await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 5000,
            });
            await seedDefaultAdmin();
            console.log("MongoDB Connected: Wedding DB");
            return;
        } catch (error) {
            console.error(
                `MongoDB connection error (attempt ${attempt}):`,
                error.message || error
            );

            if (isProduction && attempt >= maxAttempts) {
                process.exit(1);
            }

            await wait(5000);
        }
    }
};

module.exports = connectDB;