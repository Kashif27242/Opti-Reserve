import express from "express";
import { ensureAuthenticated } from "#middleware/authMiddleware.js";
import UserPanelController from "#controllers/UserPanelController.js";

const router = express.Router();

router.get("/welcome", UserPanelController.showWelcome);
router.get("/contact", UserPanelController.showContact);
router.get("/user/resources", UserPanelController.showUserResources);
router.get("/user/resources/:id", UserPanelController.showResourceDetails);

// Booking Routes
import BookingRequestController from "#controllers/BookingRequestController.js";
router.post("/booking/request", BookingRequestController.submitRequest);
router.get("/api/booking/availability", BookingRequestController.checkAvailability);
router.get("/user/my-bookings", UserPanelController.showMyBookings);

export default router;
