import Payment from '../models/Payment.js'
import Booking from '../models/Booking.js'
import Receipt from '../models/Receipt.js'

// POST /api/payments — ลูกค้าแนบสลิป
export const submitPayment = async (req, res) => {
    try {
        const { bookingId, installment, amount, transferDate, bankName } = req.body
        const slipUrl = req.file?.path  // Cloudinary URL จาก multer

        if (!slipUrl) return res.status(400).json({ message: 'กรุณาแนบสลิป' })

        const booking = await Booking.findOne({ _id: bookingId, customer: req.user._id })
        if (!booking) return res.status(404).json({ message: 'ไม่พบการจอง' })

        const payment = await Payment.create({
            booking: bookingId,
            customer: req.user._id,
            installment: Number(installment),
            amount: Number(amount),
            slipUrl,
            transferDate,
            bankName,
        })

        // อัปเดตสถานะการจอง
        booking.status = installment == 1 ? 'deposit1_pending' : 'deposit2_pending'
        await booking.save()

        res.status(201).json(payment)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// PATCH /api/payments/:id/verify — Admin ตรวจสลิป
export const verifyPayment = async (req, res) => {
    try {
        const { status, rejectReason } = req.body
        const payment = await Payment.findById(req.params.id).populate('booking')

        if (!payment) return res.status(404).json({ message: 'ไม่พบการชำระเงิน' })

        payment.status = status
        payment.verifiedBy = req.user._id
        payment.verifiedAt = new Date()
        if (rejectReason) payment.rejectReason = rejectReason
        await payment.save()

        const booking = payment.booking
        if (status === 'approved') {
            booking.status = payment.installment === 1 ? 'deposit1_paid' : 'confirmed'
            await booking.save()

            // ออกใบเสร็จอัตโนมัติ
            await Receipt.create({
                booking: booking._id,
                payment: payment._id,
                customer: payment.customer,
                amount: payment.amount,
                installment: payment.installment,
                issuedBy: req.user._id,
            })
        } else {
            booking.status = payment.installment === 1 ? 'pending' : 'deposit1_paid'
            await booking.save()
        }

        res.json({ message: `ชำระเงิน${status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}แล้ว` })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET /api/payments/pending — Admin ดูที่รอตรวจ
export const getPendingPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ status: 'pending' })
            .populate('customer', 'name email phone')
            .populate({ path: 'booking', populate: { path: 'venue', select: 'name' } })
            .sort({ createdAt: -1 })
        res.json(payments)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}