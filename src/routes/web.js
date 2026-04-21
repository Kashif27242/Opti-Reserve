import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import adminRoutes from "./adminRoutes.js";
import { route } from "#utils/routes.js";

const router = express.Router();

// Root redirect based on role
// Root redirect based on role
router.get("/", (req, res) => {
    if (req.session.user) {
        if (req.session.user.role === "ADMIN") {
            return res.redirect("/dashboard");
        }
        return res.redirect("/welcome");
    }
    return res.redirect(route("login.show"));
});

// Use modular route groups
router.use("/", authRoutes);
router.use("/", userRoutes);
router.use("/", adminRoutes);

export default router;
