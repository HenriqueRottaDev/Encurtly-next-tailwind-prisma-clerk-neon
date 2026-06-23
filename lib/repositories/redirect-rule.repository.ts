import { prisma } from '@/lib/prisma'

export type RedirectRuleType = 'country' | 'device' | 'time'

export interface CreateRedirectRuleDto {
  type: RedirectRuleType
  condition: string
  url: string
  order?: number
  linkId: string
}

export interface UpdateRedirectRuleDto {
  type?: RedirectRuleType
  condition?: string
  url?: string
  order?: number
}

export class RedirectRuleRepository {
  static async findByLinkId(linkId: string) {
    return prisma.redirectRule.findMany({
      where: { linkId },
      orderBy: { order: 'asc' },
    })
  }

  static async findById(id: string) {
    return prisma.redirectRule.findUnique({ where: { id } })
  }

  static async create(data: CreateRedirectRuleDto) {
    return prisma.redirectRule.create({ data })
  }

  static async update(id: string, data: UpdateRedirectRuleDto) {
    return prisma.redirectRule.update({ where: { id }, data })
  }

  static async delete(id: string) {
    return prisma.redirectRule.delete({ where: { id } })
  }

  static async deleteByLinkId(linkId: string) {
    return prisma.redirectRule.deleteMany({ where: { linkId } })
  }
}