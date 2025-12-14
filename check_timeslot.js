
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    try {
        const timeSlot = await prisma.timeSlot.findUnique({
            where: { id: 1 }
        });
        console.log("TimeSlot with ID 1:", timeSlot);

        if (!timeSlot) {
            const firstSlot = await prisma.timeSlot.findFirst();
            console.log("First available TimeSlot:", firstSlot);
        }

    } catch (error) {
        console.error("Error fetching time slot:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
