import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { UserRepository } from '@/lib/repositories'
import { WorkspaceRepository } from '@/lib/repositories/workspace.repository'

import { prisma } from '@/lib/prisma'

// GET — lista workspaces do usuário
export async function GET() {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await UserRepository.findByClerkId(userId)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const workspaces = await WorkspaceRepository.findByUserId(user.id)
    return NextResponse.json(workspaces)
}

// POST — cria workspace
export async function POST(req: NextRequest) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await UserRepository.findByClerkId(userId)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (user.plan !== 'AGENCY') {
        return NextResponse.json(
            { error: 'Workspaces disponíveis apenas no plano Agência.' },
            { status: 403 }
        )
    }

    const { name } = await req.json()
    if (!name?.trim()) return NextResponse.json({ error: 'Nome obrigatório.' }, { status: 400 })

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

    const existing = await WorkspaceRepository.findBySlug(slug)
    if (existing) {
        return NextResponse.json({ error: 'Já existe um workspace com esse nome.' }, { status: 409 })
    }

    const workspace = await prisma.workspace.create({
        data: {
            name,
            slug,
            members: {
                create: { userId: user.id, role: 'ADMIN' },
            },
        },
        include: {
            members: {
                include: { user: { select: { id: true, name: true, email: true } } },
            },
            _count: { select: { links: true } },
        },
    })
    return NextResponse.json(workspace, { status: 201 })
}