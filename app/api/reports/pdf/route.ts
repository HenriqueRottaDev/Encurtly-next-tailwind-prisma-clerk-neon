import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { UserRepository } from '@/lib/repositories'
import { ClickRepository } from '@/lib/repositories/click.repository'
import { WorkspaceRepository } from '@/lib/repositories/workspace.repository'
import { renderToBuffer } from '@react-pdf/renderer'
import { ReportDocument } from '@/components/reports/report-document'

const PLAN_DAYS = { FREE: 0, BASIC: 0, PRO: 90, AGENCY: 365 }

export async function GET(req: NextRequest) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await UserRepository.findByClerkId(userId)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (user.plan === 'FREE' || user.plan === 'BASIC') {
        return NextResponse.json({ error: 'Relatórios disponíveis nos planos Pro e Agência.' }, { status: 403 })
    }

    const sp = req.nextUrl.searchParams
    const workspaceId = sp.get('workspaceId')
    const days = PLAN_DAYS[user.plan]

    let data: Awaited<ReturnType<typeof ClickRepository.getReportDataForUser>>
    let title = 'Relatório Geral'

    if (workspaceId) {
        if (user.plan !== 'AGENCY') {
            return NextResponse.json({ error: 'Relatórios por workspace disponíveis apenas no plano Agência.' }, { status: 403 })
        }
        const member = await WorkspaceRepository.getMember(workspaceId, user.id)
        if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        const workspace = await WorkspaceRepository.findById(workspaceId)
        title = `Relatório — ${workspace?.name ?? 'Workspace'}`
        data = await ClickRepository.getReportDataForWorkspace(workspaceId, days)
    } else {
        data = await ClickRepository.getReportDataForUser(user.id, days)
    }

    const buffer = await renderToBuffer(
        ReportDocument({ title, days, data, generatedAt: new Date().toISOString() })
    )

    const filename = `encurtly-relatorio-${new Date().toISOString().split('T')[0]}.pdf`

    return new NextResponse(buffer as unknown as BodyInit, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
        },
    })
}