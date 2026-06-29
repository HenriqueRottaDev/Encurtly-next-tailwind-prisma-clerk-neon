import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { UserRepository, LinkRepository } from '@/lib/repositories'
import QRCode from 'qrcode'
import { WorkspaceRepository } from '@/lib/repositories/workspace.repository'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const user = await UserRepository.findByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const { id } = await params
  const link = await LinkRepository.findById(id)

  if (!link) return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 })
  if (link.userId !== user.id) {
    if (!link.workspaceId) return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 })
    const member = await WorkspaceRepository.getMember(link.workspaceId, user.id)
    if (!member) return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 })
  }

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/${link.slug}`

  const qrCodeDataUrl = await QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: {
      dark: '#534AB7',
      light: '#FFFFFF',
    },
  })

  return NextResponse.json({ qrCode: qrCodeDataUrl, url })
}