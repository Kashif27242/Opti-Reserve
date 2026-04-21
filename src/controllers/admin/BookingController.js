import { PrismaClient } from "@prisma/client";
import WaitlistRepository from "#repositories/WaitlistRepository.js";
import MailService from "#utils/mailService.js";
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

      // ⏳ Fetch Waitlist Entries
      const waitlist = await prisma.waitlist.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
          resource: true,
          timeSlot: true,
        },
      });

      res.render("admin/layout", {
        title: "Resource Bookings - Opti-Reserve",
        body: "../admin/bookings/index",
        bookings,
        waitlist, // ✅ Pass waitlist to view
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

      const newBooking = await prisma.booking.create({
        data: {
          userId: Number(userId),
          resourceId: Number(resourceId),
          bookingDate: new Date(bookingDate),
          timeSlotId: Number(timeSlotId),
          status: "confirmed",
        },
        include: { user: true, resource: true, timeSlot: true }
      });

      // 📧 Send Approval Email
      try {
        if (newBooking.user) {
          await MailService.sendStatusUpdate(newBooking.user, newBooking, newBooking.resource, newBooking.timeSlot, "confirmed");
        }
      } catch (emailError) {
        console.error("Error sending admin booking email:", emailError);
      }

      req.flash("success", "Booking created and approved successfully");
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
      const booking = await prisma.booking.findUnique({ where: { id: Number(id) } });

      await prisma.booking.delete({ where: { id: Number(id) } });

      // 🔄 Trigger Waitlist Promotion if it was a confirmed/pending booking
      if (booking && (booking.status === "confirmed" || booking.status === "pending")) {
        await BookingController.promoteWaitlistUser(booking.resourceId, booking.bookingDate, booking.timeSlotId);
      }

      req.flash("success", "Booking deleted successfully");
    } catch (error) {
      console.error("Error deleting booking:", error);
      req.flash("error", "Unable to delete booking");
    }

    res.redirect("/bookings");
  }

  // 🧩 Approve All pending bookings
  static async approveAll(req, res) {
    try {
      const pendingBookings = await prisma.booking.findMany({
        where: { status: "pending" },
        include: { user: true, resource: true, timeSlot: true }
      });

      if (pendingBookings.length === 0) {
        req.flash("success", "No pending bookings to approve");
        return res.redirect("/bookings");
      }

      // Update all to confirmed
      await prisma.booking.updateMany({
        where: { status: "pending" },
        data: { status: "confirmed" },
      });

      // Send emails asynchronously
      pendingBookings.forEach(booking => {
        if (booking.user) {
          MailService.sendStatusUpdate(booking.user, booking, booking.resource, booking.timeSlot, "confirmed").catch(err => {
            console.error(`Failed to send email to ${booking.user.email}:`, err);
          });
        }
      });

      req.flash("success", `Successfully approved all ${pendingBookings.length} pending bookings`);
    } catch (error) {
      console.error("Error approving all bookings:", error);
      req.flash("error", "Unable to approve all bookings");
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

      // 📧 Send Approval Email
      (async () => {
        const booking = await prisma.booking.findUnique({
          where: { id: Number(id) },
          include: { user: true, resource: true, timeSlot: true }
        });
        if (booking && booking.user) {
          await MailService.sendStatusUpdate(booking.user, booking, booking.resource, booking.timeSlot, "confirmed");
        }
      })();

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
      const booking = await prisma.booking.findUnique({ where: { id: Number(id) } });

      await prisma.booking.update({
        where: { id: Number(id) },
        data: { status: "rejected" },
      });

      // 🔄 Trigger Waitlist Promotion
      if (booking) {
        await BookingController.promoteWaitlistUser(booking.resourceId, booking.bookingDate, booking.timeSlotId);

        // 📧 Send Rejection Email
        (async () => {
          const user = await prisma.user.findUnique({ where: { id: booking.userId } });
          const resource = await prisma.resource.findUnique({ where: { id: booking.resourceId } });
          const slot = await prisma.timeSlot.findUnique({ where: { id: booking.timeSlotId } });
          if (user && resource && slot) {
            await MailService.sendStatusUpdate(user, booking, resource, slot, "rejected");
          }
        })();
      }

      req.flash("success", "Booking rejected");
    } catch (error) {
      console.error("Error rejecting booking:", error);
      req.flash("error", "Unable to reject booking");
    }
    res.redirect("/bookings");
  }

  // 🧹 Helper: Promote the next user from the waitlist
  static async promoteWaitlistUser(resourceId, bookingDate, timeSlotId) {
    try {
      const waitlist = await WaitlistRepository.findBySlot(resourceId, bookingDate, timeSlotId);

      if (waitlist.length > 0) {
        const nextInLine = waitlist[0];

        // Create a new pending booking for the promoted user
        await prisma.booking.create({
          data: {
            userId: nextInLine.userId,
            resourceId: nextInLine.resourceId,
            timeSlotId: nextInLine.timeSlotId,
            bookingDate: nextInLine.bookingDate,
            status: "pending", // Or "confirmed" if you want auto-approval
          }
        });

        // Update waitlist entry status
        await WaitlistRepository.updateStatus(nextInLine.id, "promoted");

        // 📧 Send Promotion Email
        (async () => {
          const user = await prisma.user.findUnique({ where: { id: nextInLine.userId } });
          const resource = await prisma.resource.findUnique({ where: { id: nextInLine.resourceId } });
          const slot = await prisma.timeSlot.findUnique({ where: { id: nextInLine.timeSlotId } });
          if (user && resource && slot) {
            await MailService.sendWaitlistPromotion(user, resource, slot, nextInLine.bookingDate);
          }
        })();

        console.log(`Promoted user ${nextInLine.userId} from waitlist for resource ${resourceId}`);
      }
    } catch (error) {
      console.error("Error promoting waitlist user:", error);
    }
  }
}

export default BookingController;
