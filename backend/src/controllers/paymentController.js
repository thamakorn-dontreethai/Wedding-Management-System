const Payment = require("../models/Payment");
const Receipt = require("../models/Receipt");
const Booking = require("../models/Booking");
const cloudinary = require("../config/cloudinary");

// POST /api/payments  (Customer แนบสลิป)
exports.uploadPayment = async (req, res) => {
    try {
        const { bookingId, installment, amount, slipUrl, transferDate, bankName } = req.body;
        let finalSlipUrl = slipUrl || "";

        if (Number(installment) === 2) {
            const booking = await Booking.findById(bookingId).select("eventDate");
            if (!booking) return res.status(404).json({ message: "ไม่พบข้อมูลการจอง" });
            const deadline = new Date(booking.eventDate);
            deadline.setDate(deadline.getDate() + 7);
            if (new Date() > deadline) {
                return res.status(400).json({
                    message: `หมดเวลาชำระเงินงวด 2 แล้ว (ต้องชำระภายใน 7 วันหลังจบพิธี)`
                });
            }
        }

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            finalSlipUrl = result.secure_url;
        }

        const payment = await Payment.create({
            bookingId,
            customerId: req.user.id,
            installment,
            amount,
            slipUrl: finalSlipUrl,
            transferDate: transferDate || Date.now(),
            bankName,
        });

        const newStatus = Number(installment) === 1 ? "deposit1_paid" : "deposit2_paid";
        await Booking.findByIdAndUpdate(bookingId, { status: newStatus, rejectionNote: null });

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
            installment: payment.installment,
            issuedBy: req.user.id
        });

        // อัปเดต booking status ตาม installment ที่ approve
        const nextStatus = payment.installment === 1 ? "deposit2_pending" : "confirmed";
        await Booking.findByIdAndUpdate(payment.bookingId, { status: nextStatus });

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
// PUT /api/payments/:id/reject (Admin)
exports.rejectPayment = async (req, res) => {
    try {
        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            { status: "rejected", rejectReason: req.body.rejectReason },
            { new: true }
        );
        if (!payment) return res.status(404).json({ message: "Payment not found" });

        // Revert booking status เพื่อให้ลูกค้าส่งสลิปใหม่ได้
        const revertStatus = payment.installment === 1 ? "deposit1_pending" : "deposit2_pending";
        const note = req.body.rejectReason || "สลิปถูกปฏิเสธ";
        await Booking.findByIdAndUpdate(payment.bookingId, {
            status: revertStatus,
            rejectionNote: note,
        });

        res.json(payment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};