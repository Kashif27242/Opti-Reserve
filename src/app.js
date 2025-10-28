import express from "express";
import session from "express-session";
import flash from "connect-flash";
import methodOverride from "method-override";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const prisma = new PrismaClient(); // 🔹 Prisma Client

// 🧩 Core Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// 🖼️ Static Files
app.use(express.static(path.join(process.cwd(), "src/public")));
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));

// 🧠 Sessions + Flash
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false, // ✅ Important for persistence
    cookie: {
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
      secure: false,
      httpOnly: true,
    },
  })
);
app.use(flash());

// 🌐 EJS Template Engine
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src/views"));

// 🌍 Global Middleware for flash + user data + categories
import { route } from "#utils/routes.js";

app.use(async (req, res, next) => {
  try {
    // 🧭 Fetch Resource Categories dynamically
    const categories = await prisma.resourceCategory.findMany({
      orderBy: { name: "asc" },
    });
    res.locals.categories = categories;
  } catch (err) {
    console.error("⚠️ Error fetching categories:", err.message);
    res.locals.categories = [];
  }

  // Flash messages + user session
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.user = req.session?.user || null;
  res.locals.route = route;

  // Prevent browser caching
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");

  next();
});

// 🧭 Main Web Routes
import webRoutes from "#routes/web.js";
app.use("/", webRoutes);

export default app;
