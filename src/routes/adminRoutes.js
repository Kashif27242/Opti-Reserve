import express from "express";
import { ensureAdmin } from "#middleware/authMiddleware.js";
import ResourceCategoryController from "#controllers/admin/ResourceCategoryController.js";
import ResourceController from "#controllers/admin/ResourceController.js";
import BookingController from "#controllers/admin/BookingController.js";

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
router.get("/resources/dd", ResourceController.dd);

// -------- Bookings --------
router.get("/bookings", BookingController.index);
router.get("/bookings/create", BookingController.create);
router.post("/bookings", BookingController.store);
router.post("/bookings/:id/delete", BookingController.delete);

export default router; // ✅ FIXED
