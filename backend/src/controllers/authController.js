const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Customer = require("../models/customers");
const Provider = require("../models/providers");

const generateToken = (id, role) =>
    jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register/customer
exports.registerCustomer = async (req, res) => {
    try {
        const { username, password, email, phone } = req.body;
        const hashed = await bcrypt.hash(password, 10);
        const customer = await Customer.create({ username, password: hashed, email, phone });
        res.status(201).json({ token: generateToken(customer._id, "customer"), customer });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// POST /api/auth/register/provider
exports.registerProvider = async (req, res) => {
    try {
        const { name, type, email, password, phone, bankAccount, maxGuests } = req.body;
        const hashed = await bcrypt.hash(password, 10);
        const provider = await Provider.create({ name, type, email, password: hashed, phone, bankAccount, maxGuests });
        res.status(201).json({ token: generateToken(provider._id, "provider"), provider });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        let user;

        if (role === "customer") user = await Customer.findOne({ email });
        else if (role === "provider") user = await Provider.findOne({ email });
        else return res.status(400).json({ message: "Invalid role" });

        if (!user) return res.status(404).json({ message: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "Wrong password" });

        res.json({ token: generateToken(user._id, role), user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};