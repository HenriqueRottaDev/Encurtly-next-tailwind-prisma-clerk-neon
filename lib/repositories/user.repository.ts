import { prisma } from '@/lib/prisma'
import { User } from '@prisma/client'

export class UserRepository {
  static async findByClerkId(clerkId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { clerkId },
    })
  }

  static async create(data: {
    clerkId: string
    email: string
    name?: string | null
  }): Promise<User> {
    return prisma.user.create({ data })
  }

  static async deleteByClerkId(clerkId: string): Promise<void> {
    await prisma.user.delete({
      where: { clerkId },
    })
  }
}