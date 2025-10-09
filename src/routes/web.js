import express from "express";
import AuthController from "#controllers/AuthController.js";
import { registerRoute, route } from "#utils/routes.js";

const router = express.Router();

// ------------------- Auth Routes -------------------

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

// ------------------- Dashboard -------------------
registerRoute("dashboard", "/dashboard");
router.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect(route("login.show"));
  res.render("dashboard", { user: req.session.user });
});

export default router;
