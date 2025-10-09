import express from "express";
import session from "express-session";
import flash from "connect-flash";
import methodOverride from "method-override";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// 🔹 Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🌿 Load environment variables
dotenv.config();

const app = express();

// 🧩 Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// 📁 Static files
app.use(express.static(path.join(__dirname, "public")));

// 🧠 Sessions + Flash Messages
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());

// 🌐 Set EJS as template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 🔗 Global flash & route helper for EJS
import { route } from "#utils/routes.js"; // ✅ uses ESM alias from package.json
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.route = route;
  next();
});

// 🧭 Routes
import webRoutes from "#routes/web.js"; // ✅ uses ESM alias
app.use("/", webRoutes);

export default app;
