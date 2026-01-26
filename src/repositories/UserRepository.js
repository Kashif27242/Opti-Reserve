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

  async getAllUsers() {
    return await prisma.user.findMany({
      where: {
        role: {
          not: "ADMIN",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async deleteUser(id) {
    return await prisma.user.delete({
      where: { id },
    });
  }

  async updateUser(id, data) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  async updateGoogleId(id, googleId) {
    return await prisma.user.update({
      where: { id },
      data: { googleId },
    });
  }

  async updatePassword(id, password) {
    return await prisma.user.update({
      where: { id },
      data: { password },
    });
  }
}

export default new UserRepository();
