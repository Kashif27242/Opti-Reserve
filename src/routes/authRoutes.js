import express from "express";
import AuthController from "#controllers/AuthController.js";
import { registerRoute } from "#utils/routes.js";
import passport from "passport";

const router = express.Router();

// Register
registerRoute("register.show", "/register");
router.get("/register", AuthController.showRegister);

registerRoute("register.submit", "/register");
router.post("/register", AuthController.register);

// Login
registerRoute("login.show", "/login");
router.get("/login", AuthController.showLogin);

registerRoute("login.submit", "/login");
router.post("/login", AuthController.login);

// Logout
registerRoute("logout", "/logout");
router.get("/logout", AuthController.logout);

router.get("/forgot-password", AuthController.showForgotPassword);
router.post("/forgot-password", AuthController.verifyUserForReset);

router.get("/reset-password", AuthController.showResetPassword);
router.post("/reset-password", AuthController.resetPassword);

// Google Auth Routes
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", failureFlash: true }),
    (req, res) => {
        // Successful authentication
        req.session.user = {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        };

        if (req.user.role === "ADMIN") {
            res.redirect("/dashboard");
        } else {
            if (!req.user.approved) {
                req.session.user = null; // Clear app session
                req.logout((err) => { // Clear passport session
                    if (err) console.error("Logout error:", err);
                    req.flash("error", "Your account is waiting for approval. Please wait for an admin to approve your request.");
                    return res.redirect("/login");
                });
                return;
            }
            res.redirect("/welcome");
        }
    }
);

export default router;
