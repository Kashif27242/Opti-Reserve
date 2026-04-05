import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class ResourceBrowserController {

    static formatResourceImages(resources) {
        const baseUrl = process.env.BASE_URL || "http://localhost:3000";

        return resources.map(resource => ({
            ...resource,
            image: resource.image
                ? `${baseUrl}/uploads/resources/${resource.image}`
                : `${baseUrl}/images/placeholder.jpg`,
        }));
    }

    // Show all user resources
    static async showUserResources(req, res) {
        const filter = req.query.filter || "all";
        let where = {};

        // If filter is not 'all', filter by category id
        if (filter !== "all") {
            where = { categoryId: parseInt(filter) };
        }

        const resourcesData = await prisma.resource.findMany({
            where,
            orderBy: { id: "desc" },
        });

        // ✅ Format image paths
        const resources = ResourceBrowserController.formatResourceImages(resourcesData);

        res.render("user/layout", {
            title: "Our Services - OptiReserve",
            body: "../user/resources/index",
            resources,
            filter,
            user: req.session.user || null,
        });
    }

    // Show Resource Details
    static async showResourceDetails(req, res) {
        try {
            const id = parseInt(req.params.id);

            // ✅ Validate ID
            if (isNaN(id)) {
                return res.status(400).send("Invalid resource ID");
            }

            // ✅ Fetch resource
            const resource = await prisma.resource.findUnique({
                where: { id },
            });

            if (!resource) {
                return res.status(404).send("Resource not found");
            }

            // ✅ Format resource images
            const formattedResources = ResourceBrowserController.formatResourceImages([resource]);
            const formattedResource = formattedResources[0];

            // ✅ Fetch category name if exists
            let categoryName = null;
            if (formattedResource.categoryId) {
                const category = await prisma.resourceCategory.findUnique({
                    where: { id: formattedResource.categoryId },
                });
                categoryName = category?.name || null;
            }

            // ✅ Fetch Time Slots
            const timeSlots = await prisma.timeSlot.findMany({
                orderBy: { startTime: "asc" },
            });

            // ✅ Render user layout with proper variable names
            res.render("user/layout", {
                title: formattedResource.name,
                body: "../user/resources/details",
                resource: formattedResource,
                categoryName,
                timeSlots,
                user: req.session.user || null,
            });
        } catch (error) {
            console.error("Error fetching resource details:", error);
            res.status(500).send("Internal Server Error");
        }
    }
}

export default ResourceBrowserController;
