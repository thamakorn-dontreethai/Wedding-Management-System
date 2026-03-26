import Venue from '../models/Venue.js'
import Package from '../models/Package.js'
import Booking from '../models/Booking.js'
import Payment from '../models/Payment.js'

// ============ VENUE ============

// GET /api/venues?province=&minGuests=&maxPrice=&date=
export const getVenues = async (req, res) => {
    try {
        const { province, minGuests, maxPrice, date } = req.query
        const filter = { isActive: true }
        if (province) filter.province = province
        if (minGuests) filter['capacity.buffet'] = { $gte: Number(minGuests) }
        if (maxPrice) filter.pricePerSession = { $lte: Number(maxPrice) }

        let venues = await Venue.find(filter)

        // กรองวันว่าง
        if (date) {
            const booked = await Booking.distinct('venue', {
                eventDate: new Date(date),
                status: { $nin: ['cancelled'] },
            })
            venues = venues.filter(v => !booked.map(String).includes(String(v._id)))
        }

        res.json(venues)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// PUT /api/admin/venues/:id/availability — Admin อัปเดตวันว่าง
export const updateVenueAvailability = async (req, res) => {
    try {
        const venue = await Venue.findByIdAndUpdate(
            req.params.id,
            { availableDates: req.body.availableDates },
            { new: true }
        )
        res.json(venue)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// ============ PACKAGE ============

// GET /api/packages?venueId=
export const getPackages = async (req, res) => {
    try {
        const filter = { isActive: true }
        if (req.query.venueId) filter.venue = req.query.venueId
        const packages = await Package.find(filter).populate('venue', 'name capacity')
        res.json(packages)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST /api/admin/packages — Admin เพิ่มแพ็คเกจ
export const createPackage = async (req, res) => {
    try {
        const pkg = await Package.create(req.body)
        res.status(201).json(pkg)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// PUT /api/admin/packages/:id
export const updatePackage = async (req, res) => {
    try {
        const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.json(pkg)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// ============ REPORTS ============

// GET /api/admin/reports/revenue?year=2024
export const getRevenueReport = async (req, res) => {
    try {
        const year = Number(req.query.year) || new Date().getFullYear()
        const data = await Payment.aggregate([
            {
                $match: {
                    status: 'approved',
                    createdAt: {
                        $gte: new Date(`${year}-01-01`),
                        $lt: new Date(`${year + 1}-01-01`),
                    },
                },
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    totalRevenue: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ])

        // แปลงให้ครบ 12 เดือน
        const months = Array.from({ length: 12 }, (_, i) => {
            const found = data.find(d => d._id === i + 1)
            return { month: i + 1, totalRevenue: found?.totalRevenue || 0, count: found?.count || 0 }
        })

        res.json(months)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET /api/admin/reports/summary
export const getSummary = async (req, res) => {
    try {
        const [totalBookings, confirmed, pending, totalRevenue] = await Promise.all([
            Booking.countDocuments(),
            Booking.countDocuments({ status: 'confirmed' }),
            Booking.countDocuments({ status: { $in: ['pending', 'deposit1_pending', 'deposit2_pending'] } }),
            Payment.aggregate([{ $match: { status: 'approved' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        ])
        res.json({
            totalBookings,
            confirmed,
            pending,
            totalRevenue: totalRevenue[0]?.total || 0,
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}