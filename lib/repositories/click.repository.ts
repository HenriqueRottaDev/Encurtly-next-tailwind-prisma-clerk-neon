import { prisma } from '@/lib/prisma'

export type CreateClickDto = {
  linkId: string
  referrer?: string | null
  country?: string | null
  city?: string | null
  device?: string | null
  os?: string | null
  browser?: string | null
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
}

export class ClickRepository {
  static async create(data: CreateClickDto) {
    return prisma.click.create({ data })
  }

  static async countByLinkId(linkId: string): Promise<number> {
    return prisma.click.count({
      where: { linkId },
    })
  }

  static async findByLinkId(linkId: string) {
    return prisma.click.findMany({
      where: { linkId },
      orderBy: { createdAt: 'desc' },
    })
  }
}