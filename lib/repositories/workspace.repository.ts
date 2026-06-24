import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export class WorkspaceRepository {
  static async findByUserId(userId: string) {
    return prisma.workspace.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { links: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  static async findById(id: string) {
    return prisma.workspace.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'asc' }
        },
        _count: { select: { links: true } },
      },
    })
  }

  static async findBySlug(slug: string) {
    return prisma.workspace.findUnique({ where: { slug } })
  }

  static async create(name: string, slug: string, userId: string) {
    return prisma.workspace.create({
      data: {
        name,
        slug,
        members: {
          create: { userId, role: 'ADMIN' },
        },
      },
    })
  }

  static async delete(id: string) {
    return prisma.workspace.delete({ where: { id } })
  }

  static async getMember(workspaceId: string, userId: string) {
    return prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    })
  }

  static async removeMember(workspaceId: string, userId: string) {
    return prisma.workspaceMember.delete({
      where: { userId_workspaceId: { userId, workspaceId } },
    })
  }

  static async updateMemberRole(workspaceId: string, userId: string, role: Role) {
    return prisma.workspaceMember.update({
      where: { userId_workspaceId: { userId, workspaceId } },
      data: { role },
    })
  }

  // Convites
  static async createInvite(workspaceId: string, role: Role) {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 dias

    return prisma.workspaceInvite.create({
      data: { workspaceId, role, expiresAt },
    })
  }

  static async findInviteByToken(token: string) {
    return prisma.workspaceInvite.findUnique({
      where: { token },
      include: { workspace: true },
    })
  }

  static async useInvite(token: string, userId: string) {
    const invite = await this.findInviteByToken(token)
    if (!invite) throw new Error('Convite não encontrado.')
    if (invite.usedAt) throw new Error('Convite já utilizado.')
    if (new Date() > invite.expiresAt) throw new Error('Convite expirado.')

    // Verifica se já é membro
    const existing = await this.getMember(invite.workspaceId, userId)
    if (existing) throw new Error('Você já é membro deste workspace.')

    // Adiciona membro e marca convite como usado
    await prisma.$transaction([
      prisma.workspaceMember.create({
        data: { userId, workspaceId: invite.workspaceId, role: invite.role },
      }),
      prisma.workspaceInvite.update({
        where: { token },
        data: { usedAt: new Date() },
      }),
    ])

    return invite
  }

  static async deleteInvite(id: string) {
    return prisma.workspaceInvite.delete({ where: { id } })
  }

  static async findLinksByWorkspaceId(workspaceId: string) {
    return prisma.link.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { clicks: true } } },
    })
  }

  static async findTopLinkByWorkspaceId(workspaceId: string) {
    const links = await prisma.link.findMany({
      where: { workspaceId },
      include: { _count: { select: { clicks: true } } },
      orderBy: { clicks: { _count: 'desc' } },
      take: 1,
    })
    return links[0] ?? null
  }
}