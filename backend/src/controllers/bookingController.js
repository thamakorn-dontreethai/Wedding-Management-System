import Booking from '../models/Booking.js'
import Venue from '../models/Venue.js'

// POST /api/bookings — ลูกค้าจอง
export const createBooking = async (req, res) => {
    try {
        const { packageId, venueId, eventDate, guestCount, mealType, selectedServices, notes } = req.body

        // ตรวจสอบวันว่างของสถานที่
        const venue = await Venue.findById(venueId)
        if (!venue) return res.status(404).json({ message: 'ไม่พบสถานที่' })

        const dateBooked = await Booking.findOne({
            venue: venueId,
            eventDate: new Date(eventDate),
            status: { $nin: ['cancelled'] },
        })
        if (dateBooked) return res.status(400).json({ message: 'วันนี้ถูกจองแล้ว' })

        // คำนวณราคา
        const { data: pkg } = await import('../models/Package.js').then(m => ({ data: m.default }))
        const packageData = await pkg.findById(packageId)
        if (!packageData) return res.status(404).json({ message: 'ไม่พบแพ็คเกจ' })

        let totalPrice = packageData.basePrice
        if (selectedServices.food && !packageData.includedServices.food) totalPrice += packageData.serviceAddons.food
        if (selectedServices.music && !packageData.includedServices.music) totalPrice += packageData.serviceAddons.music
        if (selectedServices.photo && !packageData.includedServices.photo) totalPrice += packageData.serviceAddons.photo

        const depositAmount = Math.round(totalPrice * 0.3)
        const remainingAmount = totalPrice - depositAmount

        const booking = await Booking.create({
            customer: req.user._id,
            package: packageId,
            venue: venueId,
            eventDate,
            guestCount,
            mealType,
            selectedServices,
            totalPrice,
            depositAmount,
            remainingAmount,
            notes,
            status: 'pending',
        })

        res.status(201).json(booking)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET /api/bookings/my — การจองของฉัน
export const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ customer: req.user._id })
            .populate('package', 'name basePrice')
            .populate('venue', 'name address')
            .sort({ createdAt: -1 })
        res.json(bookings)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET /api/bookings — Admin ดูทั้งหมด
export const getAllBookings = async (req, res) => {
    try {
        const { status, month } = req.query
        const filter = {}
        if (status) filter.status = status
        if (month) {
            const start = new Date(month); start.setDate(1)
            const end = new Date(month); end.setMonth(end.getMonth() + 1)
            filter.eventDate = { $gte: start, $lt: end }
        }
        const bookings = await Booking.find(filter)
            .populate('customer', 'name email phone')
            .populate('package', 'name')
            .populate('venue', 'name')
            .sort({ eventDate: 1 })
        res.json(bookings)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}