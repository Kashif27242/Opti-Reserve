import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class ContactController {
    static showContact(req, res) {
        const Banner = { image_path: "/images/contact-banner.jpg" };
        res.render('user/layout', {
            title: "Contact Us - OptiReserve",
            body: "../user/contacts/contact",
            Banner,
            message: req.flash("message"),
            errors: req.flash("errors"),
            user: req.session.user || null,
        });
    }

    static async store(req, res) {
        try {
            const { first_name, last_name, email, phone, comments, informBY } = req.body;

            if (!first_name || !last_name || !email || !phone || !comments) {
                req.flash("errors", ["All fields are required."]);
                return res.redirect("/contact");
            }

            const informByString = Array.isArray(informBY) ? informBY.join(", ") : informBY;

            await prisma.contact.create({
                data: {
                    firstName: first_name,
                    lastName: last_name,
                    email,
                    phone,
                    comments,
                    informBy: informByString,
                },
            });

            req.flash("message", "Thank you! We have successfully received your submission and will be in touch shortly.");
            res.redirect("/contact");

        } catch (error) {
            console.error("Error storing contact:", error);
            req.flash("errors", ["Something went wrong. Please try again."]);
            res.redirect("/contact");
        }
    }
}

export default ContactController;
