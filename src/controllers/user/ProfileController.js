import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

class ProfileController {
    // 🧩 Show Change Password Form
    static showChangePassword(req, res) {
        if (!req.session.user) {
            req.flash("error", "Please login first");
            return res.redirect("/login");
        }

        res.render("user/layout", {
            title: "Change Password - Opti-Reserve",
            body: "../user/profile/change-password",
            user: req.session.user,
            message: req.flash("message"),
            errors: req.flash("errors"),
        });
    }

    // 🧩 Update Password
    static async updatePassword(req, res) {
        if (!req.session.user) {
            req.flash("error", "Please login first");
            return res.redirect("/login");
        }

        const { currentPassword, newPassword, confirmPassword } = req.body;
        const errors = [];

        if (!currentPassword || !newPassword || !confirmPassword) {
            errors.push("All fields are required.");
        }

        if (newPassword !== confirmPassword) {
            errors.push("New password and confirm password do not match.");
        }

        if (newPassword.length < 6) {
            errors.push("New password must be at least 6 characters long.");
        }

        if (errors.length > 0) {
            req.flash("errors", errors);
            return res.redirect("/user/change-password");
        }

        try {
            // Fetch user to get current password hash
            const user = await prisma.user.findUnique({
                where: { id: req.session.user.id },
            });

            if (!user) {
                req.flash("error", "User not found.");
                return res.redirect("/login");
            }

            // Verify current password
            const isMatch = await bcrypt.compare(currentPassword, user.password);

            if (!isMatch) {
                req.flash("errors", ["Incorrect current password."]);
                return res.redirect("/user/change-password");
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password in DB
            await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            });

            req.flash("message", "Password updated successfully.");
            res.redirect("/user/change-password");

        } catch (error) {
            console.error("Error updating password:", error);
            req.flash("errors", ["An error occurred while updating the password."]);
            res.redirect("/user/change-password");
        }
    }
}

export default ProfileController;
