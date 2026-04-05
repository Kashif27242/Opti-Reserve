import express from "express";
import { ensureAuthenticated } from "#middleware/authMiddleware.js";
import HomeController from "#controllers/user/HomeController.js";
import ContactController from "#controllers/user/ContactController.js";
import ResourceBrowserController from "#controllers/user/ResourceBrowserController.js";
import UserBookingController from "#controllers/user/UserBookingController.js";
import ProfileController from "#controllers/user/ProfileController.js";

const router = express.Router();

router.get("/welcome", HomeController.showWelcome);
router.get("/contact", ContactController.showContact);
router.get("/user/resources", ResourceBrowserController.showUserResources);
router.get("/user/resources/:id", ResourceBrowserController.showResourceDetails);

// Booking Routes
import BookingRequestController from "#controllers/BookingRequestController.js";
router.post("/booking/request", BookingRequestController.submitRequest);
router.post("/booking/waitlist", BookingRequestController.joinWaitlist); // ✅ New route
router.get("/api/booking/availability", BookingRequestController.checkAvailability);
router.get("/user/my-bookings", UserBookingController.showMyBookings);

// Contact Submission
router.post("/contacts/store", ContactController.store);

// Change Password
router.get("/user/change-password", ProfileController.showChangePassword);
router.post("/user/change-password", ProfileController.updatePassword);

export default router;
