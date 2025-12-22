import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class UserBookingController {
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

export default UserBookingController;
