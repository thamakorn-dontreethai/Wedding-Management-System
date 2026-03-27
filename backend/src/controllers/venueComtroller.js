const Venue = require("../models/Venue");

// GET /api/venues
exports.getAllVenues = async (req, res) => {
    try {
        const { guestCount, date } = req.query;
        let filter = {};
        if (guestCount) filter["capacity.buffet"] = { $gte: Number(guestCount) };
        if (date) filter.availableDates = new Date(date);
        const venues = await Venue.find(filter);
        res.json(venues);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/venues/:id
exports.getVenueById = async (req, res) => {
    try {
        const venue = await Venue.findById(req.params.id);
        if (!venue) return res.status(404).json({ message: "Venue not found" });
        res.json(venue);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/venues (Admin only)
exports.createVenue = async (req, res) => {
    try {
        const venue = await Venue.create(req.body);
        res.status(201).json(venue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// PUT /api/venues/:id (Admin only)
exports.updateVenue = async (req, res) => {
    try {
        const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(venue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};