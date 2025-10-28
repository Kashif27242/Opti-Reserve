import bcrypt from "bcrypt";
import UserRepository from "#repositories/UserRepository.js"; // ✅ updated
import { validateRegisterInput } from "#utils/validation.js";

class AuthController {
  showRegister(req, res) {
    res.render("auth/register");
  }

  async register(req, res) {
    try {
      const { name, email, password, dob } = req.body;

      // ✅ Validation handled in separate function
      const validationError = validateRegisterInput({ name, email, password, dob });
      if (validationError) {
        req.flash("error", validationError);
        return res.redirect("/register");
      }

      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        req.flash("error", "Email is already registered.");
        return res.redirect("/register");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await UserRepository.create({
        name,
        email,
        password: hashedPassword,
        dob: new Date(dob),
        role: "FACULTY",
        approved: true,
      });

      req.flash("success", "Registration successful! You can now log in.");
      res.redirect("/login");
    } catch (error) {
      console.error("Registration Error:", error);
      req.flash("error", "Something went wrong. Please try again.");
      res.redirect("/register");
    }
  }


  showLogin(req, res) {
    res.render("auth/login");
  }

  // controllers/AuthController.js (example)
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await UserRepository.findByEmail(email);
      if (!user) {
        req.flash("error", "Invalid credentials");
        return res.redirect("/login");
      }

      if (!user.approved) {
        req.flash("error", "Your account is not approved yet");
        return res.redirect("/login");
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        req.flash("error", "Invalid credentials");
        return res.redirect("/login");
      }

      // Store user in session
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      // ✅ Role-based redirect
      if (user.role && user.role.toUpperCase() === "ADMIN") {
        return res.redirect("/dashboard");
      } else {
        return res.redirect("/welcome");
      }
    } catch (err) {
      console.error("Login Error:", err);
      req.flash("error", "Something went wrong. Please try again.");
      res.redirect("/login");
    }
  }


  logout(req, res) {
    // Destroy the session completely
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        req.flash("error", "Error logging out. Please try again.");
        return res.redirect("/login");
      }

      // ✅ Clear the session cookie from browser
      res.clearCookie("connect.sid", { path: "/" });

      // ✅ Prevent caching (back button issue)
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      // ✅ Redirect to login page
      return res.redirect("/login");
    });
  }

  showForgotPassword(req, res) {
    res.render("auth/forgot-password");
  }

  async verifyUserForReset(req, res) {
    const { email, dob } = req.body;

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      req.flash("error", "Email not found");
      return res.redirect("/forgot-password");
    }

    const userDob = new Date(user.dob).toISOString().split("T")[0];
    if (userDob !== dob) {
      req.flash("error", "Date of Birth does not match");
      return res.redirect("/forgot-password");
    }

    // ✅ Save user id temporarily for reset
    req.session.resetUserId = user.id;

    res.redirect("/reset-password");
  }


  showResetPassword(req, res) {
    if (!req.session.resetUserId) {
      req.flash("error", "Session expired. Try again.");
      return res.redirect("/forgot-password");
    }
    res.render("auth/reset-password");
  }

  async resetPassword(req, res) {
    const { new_password, confirm_password } = req.body;
    const userId = req.session.resetUserId;

    if (!userId) {
      req.flash("error", "Session expired. Try again.");
      return res.redirect("/forgot-password");
    }

    if (new_password !== confirm_password) {
      req.flash("error", "Passwords do not match");
      return res.redirect("/reset-password");
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await UserRepository.updatePassword(userId, hashedPassword);

    delete req.session.resetUserId;
    req.flash("success", "Password reset successful. Please log in.");
    res.redirect("/login");
  }

}

export default new AuthController();
