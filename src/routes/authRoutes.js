import express from "express";
import AuthController from "#controllers/AuthController.js";
import { registerRoute } from "#utils/routes.js";

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

export default router;
