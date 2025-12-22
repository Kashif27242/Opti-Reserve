import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class HomeController {
    static async showWelcome(req, res) {
        if (!req.session.user) {
            req.flash("error", "Please login first");
            return res.redirect("/login");
        }

        // Only non-admin users
        if (req.session.user.role === "ADMIN") {
            req.flash("error", "Admins cannot access this page");
            return res.redirect("/login");
        }

        try {
            const sliders = await prisma.slider.findMany({
                where: { active: true },
                orderBy: { createdAt: "desc" },
            });

            res.render('user/layout', {
                title: `Welcome ${req.session.user.name} - LMG Motors`,
                body: "../user/welcome",
                user: req.session.user,
                sliders // Pass sliders to view
            });
        } catch (error) {
            console.error("Error fetching sliders:", error);
            res.render('user/layout', {
                title: `Welcome ${req.session.user.name} - LMG Motors`,
                body: "../user/welcome",
                user: req.session.user,
                sliders: []
            });
        }
    }
}

export default HomeController;
