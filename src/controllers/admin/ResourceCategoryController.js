// controllers/ResourceCategoryController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class ResourceCategoryController {

  // 🧩 Show all categories
  static async index(req, res) {
    try {
      const categories = await prisma.resourceCategory.findMany({
        orderBy: { id: "desc" },
      });


      res.render("admin/layout", {
        title: "Resource Categories - Opti-Reserve",
        body: "../admin/categories/index",
        categories,
        user: req.session.user || null,
      });

    } catch (err) {
      console.error("Error loading categories:", err);
      req.flash("error", "Unable to load categories");
      res.redirect("/dashboard");
    }
  }




  static async showDashboard(req, res) {
    try {
      // 📊 Data for Stat Cards
      const [userCount, resourceCount, categoryCount, bookingCount] = await Promise.all([
        prisma.user.count(),
        prisma.resource.count(),
        prisma.resourceCategory.count(),
        prisma.booking.count(),
      ]);

      // 🥧 Booking Status Distribution (Pie Chart)
      const statusCounts = await prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true },
      });

      // 📊 Resource Utilization (Bar Chart - Top 5)
      const resourceUtilization = await prisma.booking.groupBy({
        by: ['resourceId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      });

      // Fetch resource names for the utilization chart
      const resourceIds = resourceUtilization.map(item => item.resourceId);
      const resourcesInfo = await prisma.resource.findMany({
        where: { id: { in: resourceIds } },
        select: { id: true, name: true }
      });

      // Map resource names to counts
      const resourceLabels = resourceUtilization.map(item => {
        const resInfo = resourcesInfo.find(r => r.id === item.resourceId);
        return resInfo ? resInfo.name : `Resource ${item.resourceId}`;
      });
      const resourceData = resourceUtilization.map(item => item._count.id);

      // 📈 Booking Trends (Line Chart - Last 7 Days)
      // 📈 Dynamic Trends Logic (Show last 7 days of activity, or last 7 calendar days)
      const latestBooking = await prisma.booking.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      });

      const endDate = latestBooking ? new Date(latestBooking.createdAt) : new Date();
      endDate.setHours(23, 59, 59, 999); // End of the day of last activity

      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);

      const trends = await prisma.booking.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true }
      });

      const trendData = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        trendData[dateStr] = 0;
      }

      trends.forEach(t => {
        const dateStr = new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (trendData[dateStr] !== undefined) {
          trendData[dateStr]++;
        }
      });

      const trendLabels = Object.keys(trendData);
      const trendCounts = Object.values(trendData);

      // 🕒 Recent Activity Feed (Consolidated)
      const [recentBookingsRaw, recentUsersRaw, recentResourcesRaw] = await Promise.all([
        prisma.booking.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true } }, resource: { select: { name: true } } }
        }),
        prisma.user.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { name: true, createdAt: true }
        }),
        prisma.resource.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { name: true, createdAt: true }
        })
      ]);

      const activities = [
        ...recentBookingsRaw.map(b => ({
          type: 'booking',
          text: `Booking for ${b.resource.name} by ${b.user.name}`,
          time: b.createdAt,
          status: b.status
        })),
        ...recentUsersRaw.map(u => ({
          type: 'user',
          text: `New user registered: ${u.name}`,
          time: u.createdAt
        })),
        ...recentResourcesRaw.map(r => ({
          type: 'resource',
          text: `New resource added: ${r.name}`,
          time: r.createdAt
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

      res.render("admin/layout", {
        title: "Dashboard - Opti-Reserve",
        body: "../admin/dashboard/dashboard",
        stats: {
          users: userCount,
          resources: resourceCount,
          categories: categoryCount,
          bookings: bookingCount
        },
        charts: {
          status: statusCounts,
          utilization: { labels: resourceLabels, data: resourceData },
          trends: { labels: trendLabels, data: trendCounts }
        },
        activities,
        user: req.session.user || null,
      });
    } catch (error) {
      console.error("Error rendering dashboard:", error);
      res.status(500).send("Internal Server Error");
    }
  }



  // 🧩 Show create form
  static async create(req, res) {
    res.render("admin/layout", {
      title: "Add Resource Category - Opti-Reserve",
      body: "../admin/categories/create",
      user: req.session.user || null,
    });
  }

  // 🧩 Save new category
  static async store(req, res) {
    const { name } = req.body;

    if (!name?.trim()) {
      req.flash("error", "Category name is required");
      return res.redirect("/categories/create");
    }

    try {
      await prisma.resourceCategory.create({ data: { name: name.trim() } });
      req.flash("success", "Category added successfully");
      res.redirect("/categories");
    } catch (err) {
      console.error("Error creating category:", err);
      req.flash("error", "Failed to create category");
      res.redirect("/categories/create");
    }
  }

  // 🧩 Delete category
  static async delete(req, res) {
    const { id } = req.params;
    try {
      await prisma.resourceCategory.delete({ where: { id: Number(id) } });
      req.flash("success", "Category deleted successfully");
      res.redirect("/categories");
    } catch (err) {
      console.error("Error deleting category:", err);
      req.flash("error", "Unable to delete category");
      res.redirect("/categories");
    }
  }
}

export default ResourceCategoryController;
