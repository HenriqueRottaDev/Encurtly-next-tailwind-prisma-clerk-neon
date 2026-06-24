import { prisma } from '@/lib/prisma'

export class CustomDomainRepository {
  static async findByUserId(userId: string) {
    return prisma.customDomain.findUnique({ where: { userId } })
  }

  static async findByWorkspaceId(workspaceId: string) {
    return prisma.customDomain.findUnique({ where: { workspaceId } })
  }

  static async findByDomain(domain: string) {
    return prisma.customDomain.findUnique({ where: { domain } })
  }

  static async createForUser(userId: string, domain: string) {
    return prisma.customDomain.create({ data: { userId, domain } })
  }

  static async createForWorkspace(workspaceId: string, domain: string) {
    return prisma.customDomain.create({ data: { workspaceId, domain } })
  }

  static async setVerified(id: string, verified: boolean) {
    return prisma.customDomain.update({ where: { id }, data: { verified } })
  }

  static async delete(id: string) {
    return prisma.customDomain.delete({ where: { id } })
  }
}