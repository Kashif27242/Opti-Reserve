import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class WaitlistRepository {
    async create(data) {
        return await prisma.waitlist.create({
            data,
        });
    }

    async findBySlot(resourceId, bookingDate, timeSlotId) {
        return await prisma.waitlist.findMany({
            where: {
                resourceId: Number(resourceId),
                bookingDate: new Date(bookingDate),
                timeSlotId: Number(timeSlotId),
                status: "waiting",
            },
            orderBy: {
                createdAt: "asc", // FIFO: First in, first out
            },
            include: {
                user: true,
            },
        });
    }

    async updateStatus(id, status) {
        return await prisma.waitlist.update({
            where: { id },
            data: { status },
        });
    }

    async getByUserId(userId) {
        return await prisma.waitlist.findMany({
            where: { userId: Number(userId) },
            include: {
                resource: true,
                timeSlot: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }

    async delete(id) {
        return await prisma.waitlist.delete({
            where: { id },
        });
    }
}

export default new WaitlistRepository();
