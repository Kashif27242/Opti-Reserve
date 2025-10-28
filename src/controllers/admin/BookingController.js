import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class BookingController {
  // 🧹 Private helper: Fetch all bookings
  static async #fetchBookings() {
    return await prisma.booking.findMany({
      orderBy: { bookingDate: "desc" },
    });
  }

  // 🧹 Private helper: Fetch all resources for dropdown
  static async #fetchResources() {
    return await prisma.resource.findMany({
      orderBy: { name: "asc" },
    });
  }

  // 🧩 Show all bookings
  static async index(req, res) {
    try {
      const bookings = await this.#fetchBookings();

      res.render("admin/layout", {
        title: "Resource Bookings - Opti-Reserve",
        body: "../admin/bookings/index",
        bookings,
        user: req.session.user || null,
      });
    } catch (error) {
      console.error("Error loading bookings:", error);
      req.flash("error", "Unable to load bookings");
      res.redirect("/dashboard");
    }
  }

  // 🧩 Show booking creation form
  static async create(req, res) {
    try {
      const resources = await this.#fetchResources();

      res.render("admin/layout", {
        title: "New Booking - Opti-Reserve",
        body: "../admin/bookings/create",
        resources,
        user: req.session.user || null,
      });
    } catch (error) {
      console.error("Error loading booking form:", error);
      req.flash("error", "Unable to load booking form");
      res.redirect("/bookings");
    }
  }

  // 🧩 Store new booking
  static async store(req, res) {
    const { resourceId, bookingDate } = req.body;

    if (!resourceId || !bookingDate) {
      req.flash("error", "All fields are required");
      return res.redirect("/bookings/create");
    }

    try {
      const userId = req.session?.user?.id || null;

      // 🔍 Check for existing booking at same time
      const existing = await prisma.booking.findFirst({
        where: {
          resourceId: Number(resourceId),
          bookingDate: new Date(bookingDate),
        },
      });

      if (existing) {
        req.flash("error", "This slot is already booked");
        return res.redirect("/bookings/create");
      }

      await prisma.booking.create({
        data: {
          userId,
          resourceId: Number(resourceId),
          bookingDate: new Date(bookingDate),
          status: "pending",
        },
      });

      req.flash("success", "Booking request submitted successfully");
      res.redirect("/bookings");
    } catch (error) {
      console.error("Error storing booking:", error);
      req.flash("error", "Unable to create booking");
      res.redirect("/bookings/create");
    }
  }

  // 🧩 Delete booking (optional admin feature)
  static async delete(req, res) {
    const { id } = req.params;

    try {
      await prisma.booking.delete({ where: { id: Number(id) } });
      req.flash("success", "Booking deleted successfully");
    } catch (error) {
      console.error("Error deleting booking:", error);
      req.flash("error", "Unable to delete booking");
    }

    res.redirect("/bookings");
  }
}

export default BookingController;
