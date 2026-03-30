const Booking = require("../models/Booking");
const Schedule = require("../models/Schedules");
const Provider = require("../models/Providers");
const Package = require("../models/Package");
const mongoose = require("mongoose");

// POST /api/bookings
exports.createBooking = async (req, res) => {
    try {
        const {
            venueId, venueName, packageId, eventDate, guestCount, mealType,
            addFood, addPhoto, addMusic,
            foodProviderId, photoProviderId, musicProviderId,
            totalPrice, depositAmount, remainingAmount, notes,
        } = req.body;

        if (!eventDate) return res.status(400).json({ message: "eventDate is required" });

        const dateKey = new Date(eventDate).toISOString().split("T")[0];
        const startOfDay = new Date(dateKey); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateKey); endOfDay.setHours(23, 59, 59, 999);

        // 1 วันจองได้เพียง 1 งาน (ยกเว้นงานที่ถูกยกเลิก)
        const existingBookingOnDate = await Booking.findOne({
            eventDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $nin: ["cancelled"] },
        }).select("_id");

        if (existingBookingOnDate) {
            return res.status(400).json({ message: "วันที่นี้มีผู้จองแล้ว กรุณาเลือกวันอื่น" });
        }

        let resolvedPackageId = null;
        if (packageId) {
            if (!mongoose.Types.ObjectId.isValid(packageId)) {
                return res.status(400).json({ message: "packageId ไม่ถูกต้อง" });
            }

            const pkg = await Package.findOne({ _id: packageId, isActive: true }).select("_id maxGuests");
            if (!pkg) {
                return res.status(400).json({ message: "ไม่พบแพ็กเกจที่เลือก" });
            }

            if (pkg.maxGuests > 0 && Number(guestCount) > pkg.maxGuests) {
                return res.status(400).json({ message: `แพ็กเกจนี้รองรับสูงสุด ${pkg.maxGuests} คน` });
            }

            resolvedPackageId = pkg._id;
        }

        // ตรวจสอบ provider ว่างในวันนั้น
        const selectedProviderIds = [foodProviderId, photoProviderId, musicProviderId].filter(Boolean);
        if (selectedProviderIds.length > 0) {
            // ตรวจสอบ unavailableDates ของแต่ละ provider
            const providerDocs = await Provider.find({ _id: { $in: selectedProviderIds } }).select("firstName lastName unavailableDates");
            for (const p of providerDocs) {
                if (p.unavailableDates?.some(ud => ud.dateKey === dateKey)) {
                    return res.status(400).json({ message: `${p.firstName} ${p.lastName} ไม่ว่างในวันที่เลือก` });
                }
            }

            // ตรวจสอบว่าถูก assign ในการจองอื่นวันเดียวกันหรือไม่
            const conflict = await Booking.findOne({
                eventDate: { $gte: startOfDay, $lte: endOfDay },
                status: { $nin: ["cancelled"] },
                $or: [
                    foodProviderId ? { foodProviderId } : null,
                    photoProviderId ? { photoProviderId } : null,
                    musicProviderId ? { musicProviderId } : null,
                ].filter(Boolean),
            });
            if (conflict) {
                return res.status(400).json({ message: "ผู้ให้บริการที่เลือกถูกจองในวันนั้นไปแล้ว กรุณาเลือกใหม่" });
            }
        }

        // ✅ ไม่บังคับ packageId แล้ว
        const booking = await Booking.create({
            customerId: req.user.id,
            packageId: resolvedPackageId,
            venueId: mongoose.Types.ObjectId.isValid(venueId) ? venueId : new mongoose.Types.ObjectId(),
            venueName,
            eventDate,
            guestCount,
            mealType,
            addFood: !!addFood,
            addPhoto: !!addPhoto,
            addMusic: !!addMusic,
            foodProviderId: foodProviderId || null,
            photoProviderId: photoProviderId || null,
            musicProviderId: musicProviderId || null,
            totalPrice,
            depositAmount,
            remainingAmount,
            notes,
            status: "pending",
        });

        // อัปเดต schedule provider
        if (musicProviderId) {
            await Schedule.findOneAndUpdate(
                { providerId: musicProviderId },
                { $push: { bookedDates: eventDate } },
                { upsert: true }
            );
        }

        res.status(201).json(booking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// GET /api/bookings/my (Customer)
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ customerId: req.user.id })
            .populate("venueId", "name province images pricePerSession") // ✅ เลือก field ที่ต้องการ
            .populate("packageId", "name basePrice maxGuests")
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/bookings/:id/status (Admin)
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

// GET /api/bookings/all (Admin)
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("customerId", "username email")
            .populate("venueId", "name province")
            .populate("packageId", "name basePrice")
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};