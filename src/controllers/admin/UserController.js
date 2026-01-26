import UserRepository from "#repositories/UserRepository.js";

class UserController {
    async index(req, res) {
        try {
            const users = await UserRepository.getAllUsers();
            res.render("admin/layout", {
                title: "Manage Users",
                body: "../admin/users/index",
                users,
                user: req.session.user || null,
            });
        } catch (error) {
            console.error("Error fetching users:", error);
            req.flash("error", "Failed to fetch users.");
            res.redirect("/dashboard");
        }
    }

    async edit(req, res) {
        try {
            const { id } = req.params;
            const user = await UserRepository.findById(Number(id));
            if (!user) {
                req.flash("error", "User not found.");
                return res.redirect("/users");
            }
            res.render("admin/layout", {
                title: "Edit User",
                body: "../admin/users/edit",
                user,
                userSession: req.session.user || null, // Pass session user as userSession to avoid conflict with 'user' variable
            });
        } catch (error) {
            console.error("Error fetching user for edit:", error);
            req.flash("error", "Failed to fetch user.");
            res.redirect("/users");
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, email, role, approved } = req.body;

            await UserRepository.updateUser(Number(id), {
                name,
                email,
                role,
                approved: approved === "true",
            });

            req.flash("success", "User updated successfully.");
            res.redirect("/users");
        } catch (error) {
            console.error("Error updating user:", error);
            req.flash("error", "Failed to update user.");
            res.redirect(`/users/${req.params.id}/edit`);
        }
    }

    async toggleStatus(req, res) {
        try {
            const { id } = req.params;
            const user = await UserRepository.findById(Number(id));
            if (!user) {
                req.flash("error", "User not found.");
                return res.redirect("/users");
            }

            await UserRepository.updateUser(Number(id), {
                approved: !user.approved,
            });

            req.flash("success", `User ${!user.approved ? "activated" : "deactivated"} successfully.`);
            res.redirect("/users");
        } catch (error) {
            console.error("Error toggling user status:", error);
            req.flash("error", "Failed to toggle user status.");
            res.redirect("/users");
        }
    }

    async approve(req, res) {
        try {
            const { id } = req.params;
            await UserRepository.approveUser(Number(id));
            req.flash("success", "User approved successfully.");
            res.redirect("/users");
        } catch (error) {
            console.error("Error approving user:", error);
            req.flash("error", "Failed to approve user.");
            res.redirect("/users");
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            await UserRepository.deleteUser(Number(id));
            req.flash("success", "User deleted successfully.");
            res.redirect("/users");
        } catch (error) {
            console.error("Error deleting user:", error);
            req.flash("error", "Failed to delete user.");
            res.redirect("/users");
        }
    }
}

export default new UserController();
