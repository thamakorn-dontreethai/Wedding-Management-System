const Payment = require("../models/Payment");
const Receipt = require("../models/Receipt");
const cloudinary = require("../config/cloudinary");

// POST /api/payments  (Customer แนบสลิป)
exports.uploadPayment = async (req, res) => {
    try {
        const { bookingId, installment, amount } = req.body;
        let slipUrl = "";

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            slipUrl = result.secure_url;
        }

        const payment = await Payment.create({
            bookingId,
            customerId: req.user.id,
            installment,
            amount,
            slipImage: slipUrl
        });

        res.status(201).json(payment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// PUT /api/payments/:id/approve  (Admin)
exports.approvePayment = async (req, res) => {
    try {
        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            { status: "approved", approvedAt: new Date(), approvedBy: req.user.id },
            { new: true }
        );

        // ออกใบเสร็จอัตโนมัติ
        await Receipt.create({
            paymentId: payment._id,
            bookingId: payment.bookingId,
            customerId: payment.customerId,
            amount: payment.amount,
            issuedBy: req.user.id
        });

        res.json({ payment, message: "Payment approved & receipt issued" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// GET /api/payments  (Admin - ดูทั้งหมด)
exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find().populate("bookingId customerId");
        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};