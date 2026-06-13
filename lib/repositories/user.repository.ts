import { prisma } from '@/lib/prisma'
import { PrismaClient } from '@prisma/client'

type User = Awaited<ReturnType<PrismaClient['user']['findUnique']>> extends infer T
  ? NonNullable<T>
  : never

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