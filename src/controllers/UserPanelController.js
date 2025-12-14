// controllers/UserPanelController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import path from "path";
class UserPanelController {

  static async showWelcome(req, res) {
    if (!req.session.user) {
      req.flash("error", "Please login first");
      return res.redirect("/login");
    }

    // Only non-admin users
    if (req.session.user.role === "ADMIN") {
      req.flash("error", "Admins cannot access this page");
      return res.redirect("/login");
    }

    try {
      const sliders = await prisma.slider.findMany({
        where: { active: true },
        orderBy: { createdAt: "desc" },
      });

      res.render('user/layout', {
        title: `Welcome ${req.session.user.name} - LMG Motors`,
        body: "../user/welcome",
        user: req.session.user,
        sliders // Pass sliders to view
      });
    } catch (error) {
      console.error("Error fetching sliders:", error);
      res.render('user/layout', {
        title: `Welcome ${req.session.user.name} - LMG Motors`,
        body: "../user/welcome",
        user: req.session.user,
        sliders: []
      });
    }
  }


  static showContact(req, res) {
    const Banner = { image_path: "/images/contact-banner.jpg" };
    res.render('user/layout', {
      title: "Contact Us - OptiReserve",
      body: "../user/contacts/contact", // use string, NOT path.join()
      Banner,
      message: req.flash("message"),
      errors: req.flash("errors"),
      user: req.session.user || null,
    });
  }



  static formatResourceImages(resources) {
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";

    return resources.map(resource => ({
      ...resource,
      image: resource.image
        ? `${baseUrl}/uploads/resources/${resource.image}`
        : `${baseUrl}/images/placeholder.jpg`,
    }));
  }




  // Show all user resources
  static async showUserResources(req, res) {
    const filter = req.query.filter || "all";
    let where = {};

    // If filter is not 'all', filter by category id
    if (filter !== "all") {
      where = { categoryId: parseInt(filter) }; // assuming `resource` has `categoryId` field
    }

    const resourcesData = await prisma.resource.findMany({
      where,
      orderBy: { id: "desc" },
    });

    // ✅ Format image paths
    const resources = UserPanelController.formatResourceImages(resourcesData);

    res.render("user/layout", {
      title: "Our Services - OptiReserve",
      body: "../user/resources/index",
      resources,
      filter,
      user: req.session.user || null,
      message: req.flash("message") || "",
      errors: req.flash("errors") || [],
    });
  }




  // Show Resource Details
  static async showResourceDetails(req, res) {
    try {
      const id = parseInt(req.params.id);

      // ✅ Validate ID
      if (isNaN(id)) {
        return res.status(400).send("Invalid resource ID");
      }

      // ✅ Fetch resource
      const resource = await prisma.resource.findUnique({
        where: { id },
      });

      if (!resource) {
        return res.status(404).send("Resource not found");
      }

      // ✅ Format resource images
      const formattedResources = UserPanelController.formatResourceImages([resource]);
      const formattedResource = formattedResources[0];

      // ✅ Fetch category name if exists
      let categoryName = null;
      if (formattedResource.categoryId) {
        const category = await prisma.resourceCategory.findUnique({
          where: { id: formattedResource.categoryId },
        });
        categoryName = category?.name || null;
      }

      // ✅ Fetch Time Slots
      const timeSlots = await prisma.timeSlot.findMany({
        orderBy: { startTime: "asc" },
      });

      // ✅ Render user layout with proper variable names
      res.render("user/layout", {
        title: formattedResource.name,
        body: "../user/resources/details",
        resource: formattedResource, // 👈 renamed so EJS uses 'resource'
        categoryName,
        timeSlots, // Pass time slots to view
        user: req.session.user || null,
        message: req.flash("message"),
        errors: req.flash("errors"),
      });
    } catch (error) {
      console.error("Error fetching resource details:", error);
      res.status(500).send("Internal Server Error");
    }
  }



  // Show My Bookings
  static async showMyBookings(req, res) {
    if (!req.session.user) {
      req.flash("error", "Please login first");
      return res.redirect("/login");
    }

    try {
      const bookings = await prisma.booking.findMany({
        where: { userId: req.session.user.id },
        include: {
          resource: true,
          timeSlot: true,
        },
        orderBy: { bookingDate: "desc" },
      });

      res.render("user/layout", {
        title: "My Bookings - Opti-Reserve",
        body: "../user/bookings/index",
        bookings,
        user: req.session.user,
        message: req.flash("message"),
        errors: req.flash("errors"),
      });
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  // 🧩 Show Change Password Form
  static showChangePassword(req, res) {
    if (!req.session.user) {
      req.flash("error", "Please login first");
      return res.redirect("/login");
    }

    res.render("user/layout", {
      title: "Change Password - Opti-Reserve",
      body: "../user/profile/change-password",
      user: req.session.user,
      message: req.flash("message"),
      errors: req.flash("errors"),
    });
  }

  // 🧩 Update Password
  static async updatePassword(req, res) {
    if (!req.session.user) {
      req.flash("error", "Please login first");
      return res.redirect("/login");
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;
    const errors = [];

    if (!currentPassword || !newPassword || !confirmPassword) {
      errors.push("All fields are required.");
    }

    if (newPassword !== confirmPassword) {
      errors.push("New password and confirm password do not match.");
    }

    if (newPassword.length < 6) {
      errors.push("New password must be at least 6 characters long.");
    }

    if (errors.length > 0) {
      req.flash("errors", errors);
      return res.redirect("/user/change-password");
    }

    try {
      // Fetch user to get current password hash
      const user = await prisma.user.findUnique({
        where: { id: req.session.user.id },
      });

      if (!user) {
        req.flash("error", "User not found.");
        return res.redirect("/login");
      }

      // Verify current password
      const bcrypt = await import("bcrypt");
      const isMatch = await bcrypt.default.compare(currentPassword, user.password);

      if (!isMatch) {
        req.flash("errors", ["Incorrect current password."]);
        return res.redirect("/user/change-password");
      }

      // Hash new password
      const hashedPassword = await bcrypt.default.hash(newPassword, 10);

      // Update password in DB
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      req.flash("message", "Password updated successfully.");
      res.redirect("/user/change-password");

    } catch (error) {
      console.error("Error updating password:", error);
      req.flash("errors", ["An error occurred while updating the password."]);
      res.redirect("/user/change-password");
    }
  }
}

export default UserPanelController;
