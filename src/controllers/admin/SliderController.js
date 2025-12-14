import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import path from "path";
import fs from "fs";

class SliderController {
    // 🧩 List all sliders
    static async index(req, res) {
        try {
            const sliders = await prisma.slider.findMany({
                orderBy: { createdAt: "desc" },
            });

            res.render("admin/layout", {
                title: "Manage Slider - Opti-Reserve",
                body: "../admin/sliders/index",
                sliders,
                user: req.session.user || null,
            });
        } catch (error) {
            console.error("Error loading sliders:", error);
            req.flash("error", "Unable to load sliders");
            res.redirect("/dashboard");
        }
    }

    // 🧩 Show create form
    static async create(req, res) {
        res.render("admin/layout", {
            title: "Add Slider Image - Opti-Reserve",
            body: "../admin/sliders/create",
            user: req.session.user || null,
        });
    }

    // 🧩 Store new slider
    static async store(req, res) {
        try {
            const { title, description, active, imageUrl } = req.body;

            let imagePath = null;

            if (req.file) {
                imagePath = req.file.filename;
            } else if (imageUrl) {
                imagePath = imageUrl;
            }

            if (!imagePath) {
                req.flash("error", "Please upload an image or provide a URL");
                return res.redirect("/sliders/create");
            }

            await prisma.slider.create({
                data: {
                    image: imagePath,
                    title: title || null,
                    description: description || null,
                    active: active === "on",
                },
            });

            req.flash("success", "Slider image added successfully");
            res.redirect("/sliders");
        } catch (error) {
            console.error("Error creating slider:", error);
            req.flash("error", "Unable to create slider");
            res.redirect("/sliders/create");
        }
    }

    // 🧩 Delete slider
    static async delete(req, res) {
        const { id } = req.params;
        try {
            const slider = await prisma.slider.findUnique({ where: { id: Number(id) } });

            if (slider) {
                // Delete image file
                const imagePath = path.join(process.cwd(), "public/uploads/sliders", slider.image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }

                await prisma.slider.delete({ where: { id: Number(id) } });
                req.flash("success", "Slider image deleted successfully");
            }
        } catch (error) {
            console.error("Error deleting slider:", error);
            req.flash("error", "Unable to delete slider");
        }
        res.redirect("/sliders");
    }

    // 🧩 Toggle active status
    static async toggleStatus(req, res) {
        const { id } = req.params;
        try {
            const slider = await prisma.slider.findUnique({ where: { id: Number(id) } });
            if (slider) {
                await prisma.slider.update({
                    where: { id: Number(id) },
                    data: { active: !slider.active },
                });
                req.flash("success", "Slider status updated");
            }
        } catch (error) {
            console.error("Error updating slider status:", error);
            req.flash("error", "Unable to update status");
        }
        res.redirect("/sliders");
    }
}

export default SliderController;
