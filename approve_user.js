import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.update({
        where: { email: 'turkkashif786@gmail.com' },
        data: { approved: true, role: 'ADMIN' } // Making admin for convenience
    });
    console.log("User approved and made ADMIN:", user);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
