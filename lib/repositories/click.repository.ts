import { prisma } from '@/lib/prisma'

export interface ClicksByDay {
  date: string
  count: number
}

export interface GroupedCount {
  label: string
  count: number
}

export interface LinkAnalytics {
  totalClicks: number
  clicksByDay: ClicksByDay[]
  byCountry: GroupedCount[]
  byDevice: GroupedCount[]
  byBrowser: GroupedCount[]
  byOs: GroupedCount[]
  byReferrer: GroupedCount[]
}

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

  static async getClicksByDay(linkId: string, days: number = 30): Promise<ClicksByDay[]> {
    const result = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT
        DATE_TRUNC('day', "createdAt") AS date,
        COUNT(*) AS count
      FROM "Click"
      WHERE "linkId" = ${linkId}
        AND "createdAt" >= NOW() - INTERVAL '1 day' * ${days}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC
    `

    return result.map(row => ({
      date: row.date.toISOString().split('T')[0],
      count: Number(row.count),
    }))
  }

  /**
   * Agrupa cliques por um campo específico (country, device, browser, os, referrer)
   */
  private static async groupByField(
    linkId: string,
    field: 'country' | 'device' | 'browser' | 'os' | 'referrer'
  ): Promise<GroupedCount[]> {
    const result = await prisma.click.groupBy({
      by: [field],
      where: { linkId },
      _count: { _all: true },
      orderBy: { _count: { [field]: 'desc' } },
    })

    return result.map(row => ({
      label: (row[field] as string | null) ?? 'Desconhecido',
      count: row._count._all,
    }))
  }

  static async getByCountry(linkId: string): Promise<GroupedCount[]> {
    return this.groupByField(linkId, 'country')
  }

  static async getByDevice(linkId: string): Promise<GroupedCount[]> {
    return this.groupByField(linkId, 'device')
  }

  static async getByBrowser(linkId: string): Promise<GroupedCount[]> {
    return this.groupByField(linkId, 'browser')
  }

  static async getByOs(linkId: string): Promise<GroupedCount[]> {
    return this.groupByField(linkId, 'os')
  }

  static async getByReferrer(linkId: string): Promise<GroupedCount[]> {
    return this.groupByField(linkId, 'referrer')
  }

  /**
   * Retorna todas as analytics agregadas de um link em uma única chamada
   */
  static async getLinkAnalytics(linkId: string, days: number = 30): Promise<LinkAnalytics> {
    const [totalClicks, clicksByDay, byCountry, byDevice, byBrowser, byOs, byReferrer] =
      await Promise.all([
        this.countByLinkId(linkId),
        this.getClicksByDay(linkId, days),
        this.getByCountry(linkId),
        this.getByDevice(linkId),
        this.getByBrowser(linkId),
        this.getByOs(linkId),
        this.getByReferrer(linkId),
      ])

    return {
      totalClicks,
      clicksByDay,
      byCountry,
      byDevice,
      byBrowser,
      byOs,
      byReferrer,
    }
  }


}