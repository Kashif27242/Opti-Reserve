// controllers/ResourceCategoryController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class ResourceCategoryController {

  // 🧩 Show all categories
  static async index(req, res) {
    try {
      const categories = await prisma.resourceCategory.findMany({
        orderBy: { id: "desc" },
      });

     
      res.render("admin/layout", {
        title: "Resource Categories - Opti-Reserve",
        body: "../admin/categories/index", // ✅ relative path from layout
        categories,
        user: req.session.user || null,
      });

    } catch (err) {
      console.error("Error loading categories:", err);
      req.flash("error", "Unable to load categories");
      res.redirect("/dashboard");
    }
  }




static async showDashboard(req, res) {
    try {
      res.render("admin/layout", {
        title: "Dashboard - Opti-Reserve",
        body: "../admin/dashboard/dashboard", // ✅ corrected spelling
        user: req.session.user || null,
      });
    } catch (error) {
      console.error("Error rendering dashboard:", error);
      res.status(500).send("Internal Server Error");
    }
  }



  // 🧩 Show create form
  static async create(req, res) {
    res.render("admin/layout", {
      title: "Add Resource Category - Opti-Reserve",
      body: "../admin/categories/create",
      user: req.session.user || null,
    });
  }

  // 🧩 Save new category
  static async store(req, res) {
    const { name } = req.body;

    if (!name?.trim()) {
      req.flash("error", "Category name is required");
      return res.redirect("/categories/create");
    }

    try {
      await prisma.resourceCategory.create({ data: { name: name.trim() } });
      req.flash("success", "Category added successfully");
      res.redirect("/categories");
    } catch (err) {
      console.error("Error creating category:", err);
      req.flash("error", "Failed to create category");
      res.redirect("/categories/create");
    }
  }

  // 🧩 Delete category
  static async delete(req, res) {
    const { id } = req.params;
    try {
      await prisma.resourceCategory.delete({ where: { id: Number(id) } });
      req.flash("success", "Category deleted successfully");
      res.redirect("/categories");
    } catch (err) {
      console.error("Error deleting category:", err);
      req.flash("error", "Unable to delete category");
      res.redirect("/categories");
    }
  }
}

export default ResourceCategoryController;
