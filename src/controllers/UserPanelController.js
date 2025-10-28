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
  const id = parseInt(req.params.id);

  const resource = await prisma.resource.findUnique({
    where: { id },
  });

  if (!resource) return res.status(404).send("Resource not found");

  // ✅ Wrap in array, then get first element
  const formattedResources = UserPanelController.formatResourceImages([resource]);
  const formattedResource = formattedResources[0];

  // Fetch category name if exists
  let categoryName = null;
  if (formattedResource.categoryId) {
    const category = await prisma.resourceCategory.findUnique({
      where: { id: formattedResource.categoryId },
    });
    categoryName = category?.name || null;
  }

  // Render EJS with user layout
  res.render("user/layout", {
    title: formattedResource.name,
    body: "../user/resources/details",   // ✅ Correct
    formattedResource,
    categoryName,
    user: req.session.user || null,
    message: req.flash("message"),
    errors: req.flash("errors"),
  });
}


}

export default UserPanelController;
