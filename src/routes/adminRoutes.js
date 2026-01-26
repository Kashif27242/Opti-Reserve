import express from "express";
import { ensureAdmin } from "#middleware/authMiddleware.js";
import ResourceCategoryController from "#controllers/admin/ResourceCategoryController.js";
import ResourceController from "#controllers/admin/ResourceController.js";
import BookingController from "#controllers/admin/BookingController.js";
import TimeSlotController from "#controllers/admin/TimeSlotController.js";

const router = express.Router();

// -------- Dashboard --------
router.get("/dashboard", ResourceCategoryController.showDashboard);

// -------- Categories --------
router.get("/categories", ResourceCategoryController.index);
router.get("/categories/create", ResourceCategoryController.create);
router.post("/categories", ResourceCategoryController.store);
router.post("/categories/delete/:id", ResourceCategoryController.delete);

// -------- Resources --------
router.get("/resources/list", ResourceController.index);
router.get("/resources/create", ResourceController.create);
router.post("/resources", ResourceController.store);
router.get("/resources/delete/:id", ResourceController.delete);


// -------- Bookings --------
router.get("/bookings", BookingController.index);
router.get("/bookings/create", BookingController.create);
router.post("/bookings", BookingController.store);
router.post("/bookings/:id/approve", BookingController.approve);
router.post("/bookings/:id/reject", BookingController.reject);
router.post("/bookings/:id/delete", BookingController.delete);

// -------- Time Slots --------
router.get("/timeslots", TimeSlotController.index);
router.get("/timeslots/create", TimeSlotController.create);
router.post("/timeslots", TimeSlotController.store);
router.get("/timeslots/:id/edit", TimeSlotController.edit);
router.put("/timeslots/:id", TimeSlotController.update);
router.post("/timeslots/:id/delete", TimeSlotController.delete);

// -------- Contacts --------
import ContactController from "#controllers/admin/contactController.js";
router.get("/contacts", ContactController.index);
router.get("/contacts/:id", ContactController.show);
router.post("/contacts/delete/:id", ContactController.delete);

// -------- Sliders --------
import SliderController from "#controllers/admin/SliderController.js";
import { makeUploader } from "#utils/uploader.js";

const upload = makeUploader("uploads/sliders");

router.get("/sliders", SliderController.index);
router.get("/sliders/create", SliderController.create);
router.post("/sliders", upload.single("image"), SliderController.store);
router.post("/sliders/:id/toggle", SliderController.toggleStatus);
router.post("/sliders/delete/:id", SliderController.delete);

// -------- Users --------
import UserController from "#controllers/admin/UserController.js";
router.get("/users", UserController.index);
router.get("/users/:id/edit", UserController.edit);
router.post("/users/:id/update", UserController.update);
router.post("/users/:id/toggle", UserController.toggleStatus);
router.post("/users/:id/approve", UserController.approve);
router.post("/users/delete/:id", UserController.delete);

export default router; // ✅ FIXED
