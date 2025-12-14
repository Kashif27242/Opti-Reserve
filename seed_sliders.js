import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const sliders = [
        {
            image: "https://szabist-isb.edu.pk/wp-content/uploads/2020/05/356A7777-3.jpg",
            title: "Welcome to Opti-Reserve",
            description: "Smart Booking. Simple Experience.",
            active: true,
        },
        {
            image: "https://wpassets.graana.com/blog/wp-content/uploads/2023/12/Szabist-Collage-Larkana.jpg",
            title: "Reserve Smarter",
            description: "Seamless scheduling for modern users",
            active: true,
        },
        {
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            title: "Experience Efficiency",
            description: "Reliable bookings anytime, anywhere",
            active: true,
        },
    ];

    console.log("Seeding sliders...");

    for (const slider of sliders) {
        await prisma.slider.create({
            data: slider,
        });
    }

    console.log("Sliders seeded successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
