import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class BookingRequestController {

    // 🧩 Handle Booking Submission
    static async submitRequest(req, res) {
        const { resourceId, bookingDate, sessions } = req.body;
        // sessions is expected to be an array of timeSlot IDs

        if (!resourceId || !bookingDate || !sessions || sessions.length === 0) {
            req.flash("error", "Please select a date and at least one time slot.");
            return res.redirect(`/user/resources/${resourceId}`);
        }

        const userId = req.session?.user?.id;
        if (!userId) {
            req.flash("error", "You must be logged in to book.");
            return res.redirect("/login");
        }

        try {
            // Ensure sessions is an array (if single select, might be string)
            const slotIds = Array.isArray(sessions) ? sessions : [sessions];

            const date = new Date(bookingDate);
            const resourceIdInt = parseInt(resourceId);

            // Check for conflicts for each slot
            const conflicts = [];
            const validBookings = [];

            for (const slotId of slotIds) {
                const slotIdInt = parseInt(slotId);

                const existing = await prisma.booking.findFirst({
                    where: {
                        resourceId: resourceIdInt,
                        bookingDate: date,
                        timeSlotId: slotIdInt,
                        status: { in: ["pending", "confirmed"] }
                    }
                });

                if (existing) {
                    // Fetch slot details for error message
                    const slot = await prisma.timeSlot.findUnique({ where: { id: slotIdInt } });
                    conflicts.push(slot ? `${slot.startTime}-${slot.endTime}` : `Slot ${slotId}`);
                } else {
                    validBookings.push({
                        userId,
                        resourceId: resourceIdInt,
                        timeSlotId: slotIdInt,
                        bookingDate: date,
                        status: "pending"
                    });
                }
            }

            if (conflicts.length > 0) {
                req.flash("error", `The following slots are already booked or pending: ${conflicts.join(", ")}`);
                return res.redirect(`/user/resources/${resourceId}`);
            }

            // Create bookings
            await prisma.booking.createMany({
                data: validBookings
            });

            req.flash("success", "Booking request submitted successfully! Waiting for approval.");
            res.redirect(`/user/resources/${resourceId}`);

        } catch (error) {
            console.error("Error submitting booking:", error);
            req.flash("error", "Internal server error.");
            res.redirect(`/user/resources/${resourceId}`);
        }
    }

    // 🧩 API to check availability (for frontend JS)
    static async checkAvailability(req, res) {
        const { resourceId, date } = req.query;

        if (!resourceId || !date) {
            return res.status(400).json({ error: "Missing parameters" });
        }

        try {
            const bookings = await prisma.booking.findMany({
                where: {
                    resourceId: parseInt(resourceId),
                    bookingDate: new Date(date),
                    status: { in: ["pending", "confirmed"] }
                },
                select: { timeSlotId: true }
            });

            const bookedSlotIds = bookings.map(b => b.timeSlotId);
            res.json({ bookedSlotIds });
        } catch (error) {
            console.error("Error checking availability:", error);
            res.status(500).json({ error: "Server error" });
        }
    }
}

export default BookingRequestController;
