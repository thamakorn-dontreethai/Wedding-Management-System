const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const cloudinary = require("../config/cloudinary");
// POST /api/venues/:id/upload-image
router.post("/venues/:id/upload-image", upload.single("image"), async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path);
        const venue = await Venue.findByIdAndUpdate(
            req.params.id,
            { $push: { images: result.secure_url } },
            { new: true }
        );
        res.json({ url: result.secure_url, venue });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const authController = require("../controllers/authController");
const venueController = require("../controllers/venueComtroller");
const bookingController = require("../controllers/bookingController");
const paymentController = require("../controllers/paymentController");
const providerController = require("../controllers/providerController");
const packageController = require("../controllers/packageController");

// Auth
router.post("/auth/register/customer", authController.registerCustomer);
router.post("/auth/register/provider", authController.registerProvider);
router.post("/auth/register/admin", authController.registerAdmin);
router.post("/auth/login", authController.login);
router.get("/auth/me", auth(["customer"]), authController.getMe);
router.put("/auth/me", auth(["customer"]), authController.updateMe);

// Packages
router.get("/packages", packageController.getAllPackages);
router.post("/packages", auth(["admin"]), packageController.createPackage);
router.put("/packages/:id", auth(["admin"]), packageController.updatePackage);
router.delete("/packages/:id", auth(["admin"]), packageController.deletePackage);

// Venues
router.get("/venues", venueController.getAllVenues);
router.get("/venues/:id", venueController.getVenueById);
router.post("/venues", auth(["admin"]), venueController.createVenue);
router.put("/venues/:id", auth(["admin"]), venueController.updateVenue);

// Providers
router.get("/providers", providerController.getProviders);
router.get("/providers/me", auth(["provider"]), providerController.getMyProviderProfile);
router.put("/providers/me/profile", auth(["provider"]), providerController.updateMyProfile);
router.put("/providers/me/pricing", auth(["provider"]), providerController.updateMyProviderPricing);
router.put("/providers/me/availability", auth(["provider"]), providerController.updateMyAvailability);
router.get("/providers/me/orders", auth(["provider"]), providerController.getMyOrders);
router.put("/providers/orders/:bookingId/status", auth(["provider"]), providerController.updateOrderStatus);
router.get("/providers/me/report", auth(["provider"]), providerController.getMyReport);

// Bookings
router.post("/bookings", auth(["customer"]), bookingController.createBooking);
router.get("/bookings/my", auth(["customer"]), bookingController.getMyBookings);
router.get("/bookings/all", auth(["admin"]), bookingController.getAllBookings);  // ✅ เพิ่ม
router.put("/bookings/:id/status", auth(["admin"]), bookingController.updateStatus);


// Payments
router.post("/payments", auth(["customer"]), paymentController.uploadPayment);
router.put("/payments/:id/approve", auth(["admin"]), paymentController.approvePayment);
router.put("/payments/:id/reject", auth(["admin"]), paymentController.rejectPayment);  // ✅ เพิ่ม
router.get("/payments", auth(["admin"]), paymentController.getAllPayments);

module.exports = router;