import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class UserRepository {
  async create(userData) {
    return await prisma.user.create({
      data: userData,
    });
  }

  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async approveUser(id) {
    return await prisma.user.update({
      where: { id },
      data: { approved: true },
    });
  }
}

export default new UserRepository();
