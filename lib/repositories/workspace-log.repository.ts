import { prisma } from '@/lib/prisma'

export type WorkspaceLogAction =
  | 'link.created'
  | 'link.updated'
  | 'link.deleted'
  | 'member.invited'
  | 'member.removed'
  | 'member.role_changed'

export class WorkspaceLogRepository {
  static async create(data: {
    workspaceId: string
    userId: string
    action: WorkspaceLogAction
    description: string
  }) {
    return prisma.workspaceLog.create({ data })
  }

  static async findByWorkspaceId(workspaceId: string) {
    const since = new Date()
    since.setDate(since.getDate() - 30)

    return prisma.workspaceLog.findMany({
      where: {
        workspaceId,
        createdAt: { gte: since },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  static async deleteOlderThan(days: number) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return prisma.workspaceLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    })
  }
}