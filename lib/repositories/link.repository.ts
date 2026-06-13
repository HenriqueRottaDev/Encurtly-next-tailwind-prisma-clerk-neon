import { prisma } from '@/lib/prisma'
import { Link } from '@prisma/client'

export type LinkWithClickCount = Link & {
  _count: { clicks: number }
}

export type CreateLinkDto = {
  url: string
  slug: string
  title?: string | null
  password?: string | null
  expiresAt?: Date | null
  maxClicks?: number | null
}

export class LinkRepository {
  static async findByUserId(userId: string): Promise<LinkWithClickCount[]> {
    return prisma.link.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { clicks: true } } },
    })
  }

  static async findBySlug(slug: string): Promise<Link | null> {
    return prisma.link.findUnique({
      where: { slug },
    })
  }

  static async create(userId: string, data: CreateLinkDto): Promise<Link> {
    return prisma.link.create({
      data: { ...data, userId },
    })
  }

  static async update(id: string, data: Partial<CreateLinkDto> & { disabled?: boolean }): Promise<Link> {
    return prisma.link.update({
      where: { id },
      data,
    })
  }

  static async delete(id: string): Promise<void> {
    await prisma.link.delete({
      where: { id },
    })
  }

  static async countByUserId(userId: string): Promise<number> {
    return prisma.link.count({
      where: { userId },
    })
  }
}