import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class BookingController {
  // 🧹 Helper: Fetch all bookings
  static async fetchBookings() {
    return await prisma.booking.findMany({
      orderBy: { bookingDate: "desc" },
      include: {
        user: true,
        resource: true,
        timeSlot: true,
      }
    });
  }

  // 🧹 Helper: Fetch all resources for dropdown
  static async fetchResources() {
    return await prisma.resource.findMany({
      orderBy: { name: "asc" },
    });
  }

  // 🧹 Helper: Fetch all users for dropdown
  static async fetchUsers() {
    return await prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true }
    });
  }

  // 🧹 Helper: Fetch all time slots
  static async fetchTimeSlots() {
    return await prisma.timeSlot.findMany({
      orderBy: { startTime: "asc" },
    });
  }

  // 🧩 Show all bookings
  static async index(req, res) {
    try {
      const bookings = await BookingController.fetchBookings();

      res.render("admin/layout", {
        title: "Resource Bookings - Opti-Reserve",
        body: "../admin/bookings/index",
        bookings,
        user: req.session.user || null,
      });
    } catch (error) {
      console.error("Error loading bookings:", error);
      req.flash("error", "Unable to load bookings: " + error.message);
      res.redirect("/dashboard");
    }
  }

  // 🧩 Show booking creation form
  static async create(req, res) {
    try {
      const resources = await BookingController.fetchResources();
      const users = await BookingController.fetchUsers();
      const timeSlots = await BookingController.fetchTimeSlots();

      res.render("admin/layout", {
        title: "New Booking - Opti-Reserve",
        body: "../admin/bookings/create",
        resources,
        users,
        timeSlots,
        user: req.session.user || null,
      });
    } catch (error) {
      console.error("Error loading booking form:", error);
      req.flash("error", "Unable to load booking form: " + error.message);
      res.redirect("/bookings");
    }
  }

  // 🧩 Store new booking
  static async store(req, res) {
    const { resourceId, bookingDate, userId, timeSlotId } = req.body;

    if (!resourceId || !bookingDate || !userId || !timeSlotId) {
      req.flash("error", "All fields are required");
      return res.redirect("/bookings/create");
    }

    try {
      // 🔍 Check for existing booking at same time
      const existing = await prisma.booking.findFirst({
        where: {
          resourceId: Number(resourceId),
          bookingDate: new Date(bookingDate),
          timeSlotId: Number(timeSlotId),
          status: { in: ["pending", "confirmed"] }
        },
      });

      if (existing) {
        req.flash("error", "This slot is already booked");
        return res.redirect("/bookings/create");
      }

      await prisma.booking.create({
        data: {
          userId: Number(userId),
          resourceId: Number(resourceId),
          bookingDate: new Date(bookingDate),
          timeSlotId: Number(timeSlotId),
          status: "pending",
        },
      });

      req.flash("success", "Booking request submitted successfully");
      res.redirect("/bookings");
    } catch (error) {
      console.error("Error storing booking:", error);
      req.flash("error", "Unable to create booking: " + error.message);
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
  // 🧩 Approve booking
  static async approve(req, res) {
    const { id } = req.params;
    try {
      await prisma.booking.update({
        where: { id: Number(id) },
        data: { status: "confirmed" },
      });
      req.flash("success", "Booking approved");
    } catch (error) {
      console.error("Error approving booking:", error);
      req.flash("error", "Unable to approve booking");
    }
    res.redirect("/bookings");
  }

  // 🧩 Reject booking
  static async reject(req, res) {
    const { id } = req.params;
    try {
      await prisma.booking.update({
        where: { id: Number(id) },
        data: { status: "rejected" },
      });
      req.flash("success", "Booking rejected");
    } catch (error) {
      console.error("Error rejecting booking:", error);
      req.flash("error", "Unable to reject booking");
    }
    res.redirect("/bookings");
  }
}

export default BookingController;
