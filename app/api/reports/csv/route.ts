import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { UserRepository } from '@/lib/repositories'
import { ClickRepository } from '@/lib/repositories/click.repository'
import { WorkspaceRepository } from '@/lib/repositories/workspace.repository'

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

  if (workspaceId) {
    if (user.plan !== 'AGENCY') {
      return NextResponse.json({ error: 'Relatórios por workspace disponíveis apenas no plano Agência.' }, { status: 403 })
    }
    const member = await WorkspaceRepository.getMember(workspaceId, user.id)
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    data = await ClickRepository.getReportDataForWorkspace(workspaceId, days)
  } else {
    data = await ClickRepository.getReportDataForUser(user.id, days)
  }

  const period = workspaceId ? `workspace_${workspaceId}` : 'conta'
  const lines: string[] = []

  lines.push(`Relatório Encurtly — ${period}`)
  lines.push(`Período: últimos ${days} dias`)
  lines.push(`Total de cliques,${data.totalClicks}`)
  lines.push('')
  lines.push('Top Links')
  lines.push('Slug,Título,Cliques')
  data.topLinks.forEach((l) => lines.push(`${l.slug},${l.title ?? ''},${l.clicks}`))
  lines.push('')
  lines.push('Top Países')
  lines.push('País,Cliques')
  data.byCountry.forEach((c) => lines.push(`${c.label},${c.count}`))
  lines.push('')
  lines.push('Dispositivos')
  lines.push('Dispositivo,Cliques')
  data.byDevice.forEach((d) => lines.push(`${d.label},${d.count}`))
  lines.push('')
  lines.push('Referrers')
  lines.push('Referrer,Cliques')
  data.byReferrer.forEach((r) => lines.push(`${r.label},${r.count}`))

  const csv = lines.join('\n')
  const filename = `encurtly-relatorio-${new Date().toISOString().split('T')[0]}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}