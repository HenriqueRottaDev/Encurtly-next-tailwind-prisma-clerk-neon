import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  console.log('🔔 Webhook recebido!')

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.log('❌ CLERK_WEBHOOK_SECRET não encontrado')
    return new Response('Webhook secret não configurado', { status: 500 })
  }

  console.log('✅ Secret encontrado')

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  console.log('Headers svix:', { svix_id, svix_timestamp, svix_signature })

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.log('❌ Headers ausentes')
    return new Response('Headers do webhook ausentes', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  console.log('📦 Evento recebido:', payload.type)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
    console.log('✅ Webhook verificado:', evt.type)
  } catch (err) {
    console.log('❌ Erro na verificação:', err)
    return new Response('Webhook inválido', { status: 400 })
  }

  if (evt.type === 'user.created') {
    console.log('👤 Criando usuário no banco...')
    const { id, email_addresses, first_name, last_name } = evt.data

    try {
      const user = await prisma.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0].email_address,
          name: [first_name, last_name].filter(Boolean).join(' ') || null,
        },
      })
      console.log('✅ Usuário criado:', user)
    } catch (err) {
      console.log('❌ Erro ao criar usuário:', err)
    }
  }

  if (evt.type === 'user.deleted') {
    await prisma.user.delete({
      where: { clerkId: evt.data.id! },
    })
  }

  return new Response('OK', { status: 200 })
}