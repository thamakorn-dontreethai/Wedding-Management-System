const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const authController = require("../controllers/authController");
const venueController = require("../controllers/venueComtroller");
const bookingController = require("../controllers/bookingController");
const paymentController = require("../controllers/paymentController");

// Auth
router.post("/auth/register/customer", authController.registerCustomer);
router.post("/auth/register/provider", authController.registerProvider);
router.post("/auth/login", authController.login);

// Venues
router.get("/venues", venueController.getAllVenues);
router.get("/venues/:id", venueController.getVenueById);
router.post("/venues", auth(["admin"]), venueController.createVenue);
router.put("/venues/:id", auth(["admin"]), venueController.updateVenue);

// Bookings
router.post("/bookings", auth(["customer"]), bookingController.createBooking);
router.get("/bookings/my", auth(["customer"]), bookingController.getMyBookings);
router.put("/bookings/:id/status", auth(["admin"]), bookingController.updateStatus);

// Payments
router.post("/payments", auth(["customer"]), paymentController.uploadPayment);
router.put("/payments/:id/approve", auth(["admin"]), paymentController.approvePayment);
router.get("/payments", auth(["admin"]), paymentController.getAllPayments);

module.exports = router;