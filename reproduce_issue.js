
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Attempting to fetch bookings...");
        const bookings = await prisma.booking.findMany({
            orderBy: { bookingDate: "desc" },
            include: {
                user: true,
                resource: true,
                timeSlot: true,
            }
        });
        console.log("Successfully fetched bookings:", bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
