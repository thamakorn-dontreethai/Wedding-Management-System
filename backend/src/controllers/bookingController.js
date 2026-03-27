const Booking = require("../models/Booking");
const Package = require("../models/Package");
const Schedule = require("../models/Schedules");

// POST /api/bookings
exports.createBooking = async (req, res) => {
    try {
        const { packageId, venueId, weddingDate, guestCount, customServices } = req.body;
        const pkg = await Package.findById(packageId);
        if (!pkg) return res.status(404).json({ message: "Package not found" });

        const booking = await Booking.create({
            customerId: req.user.id,
            packageId,
            venueId,
            weddingDate,
            guestCount,
            customServices,
            totalPrice: pkg.basePrice
        });

        // อัปเดต schedule ของ provider
        if (customServices?.musicProviderId) {
            await Schedule.findOneAndUpdate(
                { providerId: customServices.musicProviderId },
                { $push: { bookedDates: weddingDate } },
                { upsert: true }
            );
        }

        res.status(201).json(booking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// GET /api/bookings/my  (Customer)
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ customerId: req.user.id })
            .populate("packageId venueId");
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/bookings/:id/status  (Admin)
exports.updateStatus = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json(booking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};