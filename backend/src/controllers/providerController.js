const Provider = require("../models/Providers");
const Booking = require("../models/Booking");

// GET /api/providers?serviceType=&date=YYYY-MM-DD
exports.getProviders = async (req, res) => {
    try {
        const { serviceType, date } = req.query;
        const filter = {};

        if (serviceType) {
            const allowedServiceTypes = ["food", "photo", "music"];
            if (!allowedServiceTypes.includes(serviceType)) {
                return res.status(400).json({ message: "Invalid serviceType" });
            }
            filter.serviceType = serviceType;
        }

        let providers = await Provider.find(filter).sort({ createdAt: -1 });

        if (date) {
            // หา provider ที่ติดงานในวันนั้น (มีใน booking อื่นอยู่แล้ว)
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const bookingsOnDate = await Booking.find({
                eventDate: { $gte: startOfDay, $lte: endOfDay },
                status: { $nin: ["cancelled"] },
            }).select("foodProviderId photoProviderId musicProviderId");

            const bookedIds = new Set();
            bookingsOnDate.forEach(b => {
                if (b.foodProviderId) bookedIds.add(b.foodProviderId.toString());
                if (b.photoProviderId) bookedIds.add(b.photoProviderId.toString());
                if (b.musicProviderId) bookedIds.add(b.musicProviderId.toString());
            });

            // กรอง: ไม่อยู่ใน bookedIds และไม่ได้ mark วันนั้นว่าไม่สะดวก
            providers = providers.filter(p =>
                !bookedIds.has(p._id.toString()) &&
                !p.unavailableDates?.some(ud => ud.dateKey === date)
            );
        }

        res.json(providers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/providers/me
exports.getMyProviderProfile = async (req, res) => {
    try {
        const provider = await Provider.findById(req.user.id);
        if (!provider) return res.status(404).json({ message: "Provider not found" });
        res.json(provider);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/providers/me/pricing
exports.updateMyProviderPricing = async (req, res) => {
    try {
        const nextPrice = Number(req.body.price);
        if (!Number.isFinite(nextPrice) || nextPrice < 0) {
            return res.status(400).json({ message: "Invalid price" });
        }

        const existingProvider = await Provider.findById(req.user.id);
        if (!existingProvider) return res.status(404).json({ message: "Provider not found" });
        if (existingProvider.serviceType === "food") {
            return res.status(403).json({ message: "Food provider cannot update pricing" });
        }

        const provider = await Provider.findByIdAndUpdate(
            req.user.id,
            { price: nextPrice },
            { new: true, runValidators: true }
        );

        if (!provider) return res.status(404).json({ message: "Provider not found" });
        res.json(provider);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// PUT /api/providers/me/profile
exports.updateMyProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, bankName, bankAccount } = req.body;
        const provider = await Provider.findByIdAndUpdate(
            req.user.id,
            { firstName, lastName, phone, bankName, bankAccount },
            { new: true, runValidators: true }
        );
        if (!provider) return res.status(404).json({ message: "Provider not found" });
        res.json(provider);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// PUT /api/providers/me/availability
exports.updateMyAvailability = async (req, res) => {
    try {
        const { unavailableDates, maxGuests, supportsMealType } = req.body;
        const update = {};
        if (unavailableDates !== undefined) update.unavailableDates = unavailableDates;
        if (maxGuests !== undefined) update.maxGuests = Number(maxGuests);
        if (supportsMealType !== undefined) update.supportsMealType = supportsMealType;
        const provider = await Provider.findByIdAndUpdate(req.user.id, update, { new: true });
        if (!provider) return res.status(404).json({ message: "Provider not found" });
        res.json(provider);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// GET /api/providers/me/orders
exports.getMyOrders = async (req, res) => {
    try {
        const provider = await Provider.findById(req.user.id).select("serviceType");
        const fieldMap = { food: "foodProviderId", music: "musicProviderId", photo: "photoProviderId" };
        const field = fieldMap[provider.serviceType];
        if (!field) return res.status(400).json({ message: "Unknown serviceType" });

        const bookings = await Booking.find({ [field]: req.user.id })
            .populate("customerId", "username email")
            .sort({ eventDate: 1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/providers/orders/:bookingId/status
exports.updateOrderStatus = async (req, res) => {
    try {
        const provider = await Provider.findById(req.user.id).select("serviceType");
        const { status } = req.body;
        const allowed = ["acknowledged", "ready"];
        if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

        const field = `orderStatuses.${provider.serviceType}`;
        const booking = await Booking.findByIdAndUpdate(
            req.params.bookingId,
            { [field]: status },
            { new: true }
        );
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        res.json(booking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// GET /api/providers/me/report?from=YYYY-MM-DD&to=YYYY-MM-DD
exports.getMyReport = async (req, res) => {
    try {
        const provider = await Provider.findById(req.user.id).select("serviceType price");
        const fieldMap = { food: "foodProviderId", music: "musicProviderId", photo: "photoProviderId" };
        const field = fieldMap[provider.serviceType];
        if (!field) return res.status(400).json({ message: "Unknown serviceType" });

        const { from, to } = req.query;
        const filter = { [field]: req.user.id };
        if (from || to) {
            filter.eventDate = {};
            if (from) filter.eventDate.$gte = new Date(from);
            if (to) filter.eventDate.$lte = new Date(to);
        }

        const bookings = await Booking.find(filter)
            .populate("customerId", "username")
            .sort({ eventDate: 1 });

        const totalIncome = bookings.length * (provider.price || 0);
        res.json({ bookings, totalIncome, count: bookings.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
