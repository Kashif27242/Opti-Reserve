// controllers/UserPanelController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import path from "path";
class UserPanelController {

  static showWelcome(req, res) {
    if (!req.session.user) {
      req.flash("error", "Please login first");
      return res.redirect("/login");
    }

    // Only non-admin users
    if (req.session.user.role === "ADMIN") {
      req.flash("error", "Admins cannot access this page");
      return res.redirect("/login");
    }

    res.render('user/layout', {
      title: `Welcome ${req.session.user.name} - LMG Motors`,
      body: "../user/welcome",
      user: req.session.user
    });
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

}

export default UserPanelController;
