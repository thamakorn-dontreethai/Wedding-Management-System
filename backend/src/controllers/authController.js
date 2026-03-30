const jwt = require("jsonwebtoken");
const Customer = require("../models/Customers");
const Provider = require("../models/Providers");
const Admin = require("../models/Admin");

const formatRegisterError = (err) => {
    if (err?.code === 11000 && err?.keyPattern?.email) {
        return "อีเมลนี้ถูกใช้งานแล้ว";
    }

    if (err?.name === "ValidationError") {
        return "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
    }

    return err?.message || "สมัครสมาชิกไม่สำเร็จ";
};

const generateToken = (id, role) =>
    jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

// POST /api/auth/register/customer
exports.registerCustomer = async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;
        const customer = await Customer.create({ username, email, password, phone });
        res.status(201).json({ token: generateToken(customer._id, "customer"), user: customer });
    } catch (err) {
        res.status(400).json({ message: formatRegisterError(err) });
    }
};

// POST /api/auth/register/admin
exports.registerAdmin = async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;
        const admin = await Admin.create({ username, email, password, phone });
        res.status(201).json({ token: generateToken(admin._id, "admin"), user: admin });
    } catch (err) {
        res.status(400).json({ message: formatRegisterError(err) });
    }
};

// POST /api/auth/register/provider
exports.registerProvider = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, serviceType } = req.body;
        const provider = await Provider.create({ firstName, lastName, email, password, phone, serviceType });
        res.status(201).json({ token: generateToken(provider._id, "provider"), user: provider });
    } catch (err) {
        res.status(400).json({ message: formatRegisterError(err) });
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        console.log("Login attempt:", { email, role });
        let user;

        if (role === "customer")
            user = await Customer.findOne({ email });
        else if (role === "provider")
            user = await Provider.findOne({ email });
        else if (role === "admin")
            user = await Admin.findOne({ email });
        else
            return res.status(400).json({ message: "Invalid role" });

        console.log("User found:", user ? "YES" : "NO");
        if (!user)
            return res.status(401).json({ message: "User not found" });

        console.log("password in db:", user.password);
        console.log("password input:", password);

        const match = await user.matchPassword(password);
        console.log("Password match:", match);

        if (!match)
            return res.status(401).json({ message: "Wrong password" });

        res.json({ token: generateToken(user._id, role), user });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: err.message });
    }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user.id);
        if (!customer) return res.status(404).json({ message: "User not found" });
        res.json(customer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/auth/me
exports.updateMe = async (req, res) => {
    try {
        const { username, phone, address } = req.body;
        const customer = await Customer.findByIdAndUpdate(
            req.user.id,
            { username, phone, address },
            { new: true, runValidators: true }
        );
        if (!customer) return res.status(404).json({ message: "User not found" });
        res.json(customer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};