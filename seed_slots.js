import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const slots = [
    { startTime: "08:30", endTime: "09:15", label: "Session 1" },
    { startTime: "09:15", endTime: "10:00", label: "Session 2" },
    { startTime: "10:00", endTime: "10:45", label: "Session 3" },
    { startTime: "10:45", endTime: "11:30", label: "Session 4" },
    { startTime: "11:30", endTime: "12:15", label: "Session 5" },
    { startTime: "12:15", endTime: "13:00", label: "Session 6" },
    { startTime: "13:00", endTime: "13:45", label: "Session 7" },
    { startTime: "13:45", endTime: "14:30", label: "Session 8" },
    { startTime: "14:30", endTime: "15:15", label: "Session 9" },
    { startTime: "15:15", endTime: "16:00", label: "Session 10" },
    { startTime: "16:00", endTime: "16:45", label: "Session 11" },
    { startTime: "16:45", endTime: "17:30", label: "Session 12" },
];

async function main() {
    console.log("Seeding time slots...");

    // Clear existing
    await prisma.timeSlot.deleteMany();

    for (const slot of slots) {
        await prisma.timeSlot.create({ data: slot });
    }

    console.log("Time slots seeded successfully.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
