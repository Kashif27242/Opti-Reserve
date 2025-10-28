import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import adminRoutes from "./adminRoutes.js";
import { route } from "#utils/routes.js";

const router = express.Router();

// Root redirect → login
router.get("/", (req, res) => res.redirect(route("login.show")));

// Use modular route groups
router.use("/", authRoutes);
router.use("/", userRoutes);
router.use("/", adminRoutes);

export default router;
