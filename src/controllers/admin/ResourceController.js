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
      res.redirect("/resources/list");
    } catch (err) {
      console.error("Error deleting resource:", err);
      req.flash("error", "Unable to delete resource");
      res.redirect("/resources/list");
    }
  }

  // 🧩 Show edit form
  static async edit(req, res) {
    const { id } = req.params;
    try {
      const resource = await prisma.resource.findUnique({ where: { id: Number(id) } });
      const categories = await prisma.resourceCategory.findMany();

      if (!resource) {
        req.flash("error", "Resource not found");
        return res.redirect("/resources/list");
      }

      res.render("admin/layout", {
        title: "Edit Resource - Opti-Reserve",
        body: "../admin/resources/edit",
        resource,
        categories,
        user: req.session.user || null,
      });
    } catch (err) {
      console.error("Error loading edit form:", err);
      req.flash("error", "Unable to load form");
      res.redirect("/resources/list");
    }
  }

  // 🧩 Update resource with image upload
  static update(req, res) {
    upload.single("image")(req, res, async (err) => {
      if (err) {
        console.error("File upload error:", err);
        req.flash("error", "Image upload failed");
        return res.redirect(`/resources/edit/${req.params.id}`);
      }

      const { id } = req.params;
      const { name, description, available, categoryId } = req.body;
      const newImage = req.file ? req.file.filename : null;

      if (!name?.trim()) {
        req.flash("error", "Resource name is required");
        return res.redirect(`/resources/edit/${id}`);
      }

      try {
        const oldResource = await prisma.resource.findUnique({ where: { id: Number(id) } });

        await prisma.resource.update({
          where: { id: Number(id) },
          data: {
            name: name.trim(),
            description: description?.trim() || null,
            available: available === "on",
            categoryId: categoryId ? Number(categoryId) : null,
            ...(newImage && { image: newImage }), // only update image if new one uploaded
          },
        });

        // 🗑️ Delete old image if a new one was uploaded
        if (newImage && oldResource && oldResource.image) {
          const oldPath = path.join("src/public", "uploads/resources", oldResource.image);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        req.flash("success", "Resource updated successfully");
        res.redirect("/resources/list");
      } catch (error) {
        console.error("Error updating resource:", error);
        req.flash("error", "Failed to update resource");
        res.redirect(`/resources/edit/${id}`);
      }
    });
  }
}

export default ResourceController;
