import { prisma } from '@/lib/prisma'
import { PrismaClient } from '@prisma/client'

type Link = Awaited<ReturnType<PrismaClient['link']['findUnique']>> extends infer T
  ? NonNullable<T>
  : never

export type LinkWithClickCount = Link & {
  _count: { clicks: number }
}

export interface PaginatedLinks {
  links: LinkWithClickCount[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export type CreateLinkDto = {
  url: string
  slug: string
  title?: string | null
  password?: string | null
  expiresAt?: Date | null
  maxClicks?: number | null
  ctaEnabled?: boolean
  ctaTitle?: string | null
  ctaMessage?: string | null
  ctaButtonText?: string | null
  ctaButtonUrl?: string | null
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

  static async findById(id: string): Promise<Link | null> {
    return prisma.link.findUnique({
      where: { id },
    })
  }

  static async findByUserIdPaginated(
    userId: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<PaginatedLinks> {
    const skip = (page - 1) * perPage

    const [links, total] = await Promise.all([
      prisma.link.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { clicks: true } } },
        skip,
        take: perPage,
      }),
      prisma.link.count({ where: { userId } }),
    ])

    return {
      links,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }
}