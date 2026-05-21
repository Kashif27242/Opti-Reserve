import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import UserRepository from "#repositories/UserRepository.js";
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

    // 🧩 Show User Profile
    static async showProfile(req, res) {
        if (!req.session.user) {
            req.flash("error", "Please login first");
            return res.redirect("/login");
        }

        try {
            const user = await UserRepository.findById(req.session.user.id);
            if (!user) {
                req.flash("error", "User not found.");
                return res.redirect("/login");
            }

            // Format date of birth to YYYY-MM-DD for the HTML5 date input type
            let formattedDob = "";
            if (user.dob) {
                formattedDob = new Date(user.dob).toISOString().split("T")[0];
            }

            res.render("user/layout", {
                title: "My Profile - Opti-Reserve",
                body: "../user/profile/index",
                user: req.session.user,
                profileUser: user,
                formattedDob,
                message: req.flash("message"),
                errors: req.flash("errors"),
            });
        } catch (error) {
            console.error("Error fetching user profile:", error);
            req.flash("errors", ["An error occurred while fetching your profile."]);
            res.redirect("/welcome");
        }
    }

    // 🧩 Update User Profile
    static async updateProfile(req, res) {
        if (!req.session.user) {
            req.flash("error", "Please login first");
            return res.redirect("/login");
        }

        const { name, dob } = req.body;
        const errors = [];

        if (!name || !dob) {
            errors.push("Name and Date of Birth are required.");
        }

        if (errors.length > 0) {
            req.flash("errors", errors);
            return res.redirect("/profile");
        }

        try {
            const updatedUser = await UserRepository.updateUser(req.session.user.id, {
                name,
                dob: new Date(dob),
            });

            // Update session user name to sync UI immediately
            req.session.user.name = updatedUser.name;

            req.flash("message", "Profile updated successfully.");
            res.redirect("/profile");
        } catch (error) {
            console.error("Error updating user profile:", error);
            req.flash("errors", ["An error occurred while updating your profile."]);
            res.redirect("/profile");
        }
    }
}

export default ProfileController;
