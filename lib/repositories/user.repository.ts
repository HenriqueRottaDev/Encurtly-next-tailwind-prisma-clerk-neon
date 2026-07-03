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
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 3)

    return prisma.user.create({
      data: {
        ...data,
        plan: 'PRO',
        trialEndsAt,
        hasHadTrial: true,
      },
    })
  }

  static async deleteByClerkId(clerkId: string): Promise<void> {
    await prisma.user.delete({
      where: { clerkId },
    })
  }

  static async updateStripeInfo(
    clerkId: string,
    data: {
      stripeCustomerId?: string
      stripeSubscriptionId?: string | null
      stripeCurrentPeriodEnd?: Date | null
      stripeCancelAtPeriodEnd?: boolean
      plan?: 'FREE' | 'BASIC' | 'PRO' | 'AGENCY'
    }
  ) {
    return prisma.user.update({
      where: { clerkId },
      data,
    })
  }

  static async findByStripeCustomerId(stripeCustomerId: string) {
    return prisma.user.findUnique({
      where: { stripeCustomerId },
    })
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    })
  }
}