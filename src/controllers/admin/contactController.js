import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class ContactController {

    // 🧩 List all contacts (Admin)
    static async index(req, res) {
        try {
            const contacts = await prisma.contact.findMany({
                orderBy: { createdAt: "desc" },
            });

            res.render("admin/layout", {
                title: "Contact Messages - Opti-Reserve",
                body: "../admin/contacts/index",
                contacts,
                user: req.session.user || null,
            });
        } catch (error) {
            console.error("Error loading contacts:", error);
            req.flash("error", "Unable to load contacts");
            res.redirect("/dashboard");
        }
    }

    // 🧩 Show single contact (Admin)
    static async show(req, res) {
        const { id } = req.params;
        try {
            const contact = await prisma.contact.findUnique({
                where: { id: Number(id) },
            });

            if (!contact) {
                req.flash("error", "Contact message not found");
                return res.redirect("/contacts");
            }

            res.render("admin/layout", {
                title: "Message Details - Opti-Reserve",
                body: "../admin/contacts/show",
                contact,
                user: req.session.user || null,
            });
        } catch (error) {
            console.error("Error loading contact details:", error);
            req.flash("error", "Unable to load contact details");
            res.redirect("/contacts");
        }
    }



    // 🧩 Delete contact (Admin)
    static async delete(req, res) {
        const { id } = req.params;
        try {
            await prisma.contact.delete({ where: { id: Number(id) } });
            req.flash("success", "Message deleted successfully");
        } catch (error) {
            console.error("Error deleting contact:", error);
            req.flash("error", "Unable to delete message");
        }
        res.redirect("/contacts");
    }
}

export default ContactController;
