import express from 'express'
import { register, login, getMe } from '../controllers/authController.js'
import { createBooking, getMyBookings, getAllBookings } from '../controllers/bookingController.js'
import { submitPayment, verifyPayment, getPendingPayments } from '../controllers/paymentController.js'
import { getVenues, updateVenueAvailability, getPackages, createPackage, updatePackage, getRevenueReport, getSummary } from '../controllers/venueController.js'
import { protect, authorize } from '../middleware/auth.js'
import { upload } from '../config/cloudinary.js'

const router = express.Router()

// ── Auth ──────────────────────────────────────────
router.post('/auth/register', register)
router.post('/auth/login', login)
router.get('/auth/me', protect, getMe)

// ── Venues ────────────────────────────────────────
router.get('/venues', protect, getVenues)
router.put('/admin/venues/:id/availability', protect, authorize('admin'), updateVenueAvailability)

// ── Packages ──────────────────────────────────────
router.get('/packages', protect, getPackages)
router.post('/admin/packages', protect, authorize('admin'), createPackage)
router.put('/admin/packages/:id', protect, authorize('admin'), updatePackage)

// ── Bookings ──────────────────────────────────────
router.post('/bookings', protect, authorize('customer'), createBooking)
router.get('/bookings/my', protect, authorize('customer'), getMyBookings)
router.get('/bookings', protect, authorize('admin'), getAllBookings)

// ── Payments ──────────────────────────────────────
router.post('/payments', protect, authorize('customer'), upload.single('slip'), submitPayment)
router.get('/payments/pending', protect, authorize('admin'), getPendingPayments)
router.patch('/payments/:id/verify', protect, authorize('admin'), verifyPayment)

// ── Provider ──────────────────────────────────────
router.get('/provider/orders', protect, authorize('provider'), async (req, res) => {
    const Order = (await import('../models/Order.js')).default
    const orders = await Order.find({ provider: req.user._id })
        .populate({ path: 'booking', populate: [{ path: 'venue', select: 'name address' }, { path: 'customer', select: 'name phone' }] })
        .sort({ eventDate: 1 })
    res.json(orders)
})
router.patch('/provider/orders/:id/status', protect, authorize('provider'), async (req, res) => {
    const Order = (await import('../models/Order.js')).default
    const order = await Order.findOneAndUpdate(
        { _id: req.params.id, provider: req.user._id },
        { status: req.body.status },
        { new: true }
    )
    res.json(order)
})

// ── Admin Reports ─────────────────────────────────
router.get('/admin/reports/revenue', protect, authorize('admin'), getRevenueReport)
router.get('/admin/reports/summary', protect, authorize('admin'), getSummary)

export default router