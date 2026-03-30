const Package = require("../models/Package");

// GET /api/packages
exports.getAllPackages = async (req, res) => {
    try {
        const packages = await Package.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(packages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/packages (Admin)
exports.createPackage = async (req, res) => {
    try {
        const { name, description, basePrice, maxGuests } = req.body;
        const pkg = await Package.create({ name, description, basePrice, maxGuests });
        res.status(201).json(pkg);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// PUT /api/packages/:id (Admin)
exports.updatePackage = async (req, res) => {
    try {
        const { name, description, basePrice, maxGuests } = req.body;
        const pkg = await Package.findByIdAndUpdate(
            req.params.id,
            { name, description, basePrice, maxGuests },
            { new: true, runValidators: true }
        );
        if (!pkg) return res.status(404).json({ message: "Package not found" });
        res.json(pkg);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE /api/packages/:id (Admin) - soft delete
exports.deletePackage = async (req, res) => {
    try {
        const pkg = await Package.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!pkg) return res.status(404).json({ message: "Package not found" });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
