import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class TimeSlotController {
    // 🧩 List all time slots
    static async index(req, res) {
        try {
            const timeSlots = await prisma.timeSlot.findMany({
                orderBy: { startTime: "asc" },
            });

            res.render("admin/layout", {
                title: "Time Slots - Opti-Reserve",
                body: "../admin/timeslots/index",
                timeSlots,
                user: req.session.user || null,
            });
        } catch (err) {
            console.error("Error loading time slots:", err);
            req.flash("error", "Unable to load time slots");
            res.redirect("/dashboard");
        }
    }

    // 🧩 Show create form
    static async create(req, res) {
        res.render("admin/layout", {
            title: "Add Time Slot - Opti-Reserve",
            body: "../admin/timeslots/create",
            user: req.session.user || null,
        });
    }

    // 🧩 Store new time slot
    static async store(req, res) {
        const { startTime, endTime, label } = req.body;

        if (!startTime || !endTime) {
            req.flash("error", "Start time and End time are required");
            return res.redirect("/timeslots/create");
        }

        try {
            await prisma.timeSlot.create({
                data: {
                    startTime,
                    endTime,
                    label: label?.trim() || null,
                },
            });
            req.flash("success", "Time slot added successfully");
            res.redirect("/timeslots");
        } catch (err) {
            console.error("Error creating time slot:", err);
            req.flash("error", "Failed to create time slot");
            res.redirect("/timeslots/create");
        }
    }

    // 🧩 Show edit form
    static async edit(req, res) {
        const { id } = req.params;
        try {
            const timeSlot = await prisma.timeSlot.findUnique({ where: { id: Number(id) } });
            if (!timeSlot) {
                req.flash("error", "Time slot not found");
                return res.redirect("/timeslots");
            }

            res.render("admin/layout", {
                title: "Edit Time Slot - Opti-Reserve",
                body: "../admin/timeslots/edit",
                timeSlot,
                user: req.session.user || null,
            });
        } catch (err) {
            console.error("Error loading edit form:", err);
            req.flash("error", "Unable to load edit form");
            res.redirect("/timeslots");
        }
    }

    // 🧩 Update time slot
    static async update(req, res) {
        const { id } = req.params;
        const { startTime, endTime, label } = req.body;

        if (!startTime || !endTime) {
            req.flash("error", "Start time and End time are required");
            return res.redirect(`/timeslots/${id}/edit`);
        }

        try {
            await prisma.timeSlot.update({
                where: { id: Number(id) },
                data: {
                    startTime,
                    endTime,
                    label: label?.trim() || null,
                },
            });
            req.flash("success", "Time slot updated successfully");
            res.redirect("/timeslots");
        } catch (err) {
            console.error("Error updating time slot:", err);
            req.flash("error", "Failed to update time slot");
            res.redirect(`/timeslots/${id}/edit`);
        }
    }

    // 🧩 Delete time slot
    static async delete(req, res) {
        const { id } = req.params;
        try {
            await prisma.timeSlot.delete({ where: { id: Number(id) } });
            req.flash("success", "Time slot deleted successfully");
            res.redirect("/timeslots");
        } catch (err) {
            console.error("Error deleting time slot:", err);
            req.flash("error", "Unable to delete time slot");
            res.redirect("/timeslots");
        }
    }
}

export default TimeSlotController;
