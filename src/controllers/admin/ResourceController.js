// controllers/admin/ResourceController.js
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { makeUploader } from "#utils/uploader.js";

const prisma = new PrismaClient();
const upload = makeUploader("uploads/resources"); // centralized folder

class ResourceController {

  // 🧩 List all resources
  static async index(req, res) {
    try {
      const resources = await prisma.resource.findMany({
        orderBy: { id: "desc" },
      });

      res.render("admin/layout", {
        title: "Resources - Opti-Reserve",
        body: "../admin/resources/index",
        resources,
        user: req.session.user || null,
      });
    } catch (err) {
      console.error("Error loading resources:", err);
      req.flash("error", "Unable to load resources");
      res.redirect("/dashboard");
    }
  }

  // 🧩 Show create form
  static async create(req, res) {
    try {
      const categories = await prisma.resourceCategory.findMany();

      res.render("admin/layout", {
        title: "Add Resource - Opti-Reserve",
        body: "../admin/resources/create",
        categories,
        user: req.session.user || null,
      });
    } catch (err) {
      console.error("Error loading create form:", err);
      req.flash("error", "Unable to load form");
      res.redirect("/resources");
    }
  }

  // 🧩 Store new resource with image upload
  static store(req, res) {
    upload.single("image")(req, res, async (err) => {
      if (err) {
        console.error("File upload error:", err);
        req.flash("error", "Image upload failed");
        return res.redirect("/resources/create");
      }

      const { name, description, available, categoryId } = req.body;
      const image = req.file ? req.file.filename : null;

      if (!name?.trim()) {
        req.flash("error", "Resource name is required");
        return res.redirect("/resources/create");
      }

      try {
        await prisma.resource.create({
          data: {
            name: name.trim(),
            description: description?.trim() || null,
            available: available === "on",
            categoryId: categoryId ? Number(categoryId) : null,
            image, // store uploaded filename
            createdById: req.session?.user?.id || null,
          },
        });

        req.flash("success", "Resource added successfully");
        res.redirect("/resources/list");
      } catch (error) {
        console.error("Error creating resource:", error);
        req.flash("error", "Failed to create resource");
        res.redirect("/resources/create");
      }
    });
  }

  // 🧩 Delete resource and its image
  static async delete(req, res) {
    const { id } = req.params;

    try {
      const resource = await prisma.resource.findUnique({ where: { id: Number(id) } });

      if (!resource) {
        req.flash("error", "Resource not found");
        return res.redirect("/resources");
      }

      // Delete image file if exists
      if (resource.image) {
        const filePath = path.join("public", "uploads/resources", resource.image);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      await prisma.resource.delete({ where: { id: Number(id) } });

      req.flash("success", "Resource deleted successfully");
      res.redirect("/resources");
    } catch (err) {
      console.error("Error deleting resource:", err);
      req.flash("error", "Unable to delete resource");
      res.redirect("/resources");
    }
  }

  // 🧩 Optional: JSON dump for debugging (dd-like)
  static async dd(req, res) {
    try {
      const resources = await prisma.resource.findMany();
      return res.send(`<pre>${JSON.stringify(resources, null, 2)}</pre>`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching resources");
    }
  }
}

export default ResourceController;
