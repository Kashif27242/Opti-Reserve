import bcrypt from "bcrypt";
import UserRepository from "#repositories/UserRepository.js"; // ✅ updated

class AuthController {
  showRegister(req, res) {
    res.render("auth/register");
  }

  async register(req, res) {
    const { name, email, password } = req.body;

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      req.flash("error", "Email already registered");
      return res.redirect("/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserRepository.create({
      name,
      email,
      password: hashedPassword,
      role: "FACULTY",
      approved: false,
    });

    req.flash("success", "Registration successful! Wait for admin approval.");
    res.redirect("/login");
  }

  showLogin(req, res) {
    res.render("auth/login");
  }

  async login(req, res) {
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

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    req.flash("success", `Welcome ${user.name}`);
    res.redirect("/dashboard");
  }

  logout(req, res) {
    req.session.destroy();
    res.redirect("/login");
  }
}

export default new AuthController();
