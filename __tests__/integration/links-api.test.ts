import { GET, POST } from '@/app/api/links/route'
import { prisma } from '@/lib/prisma'
import { createRequest } from '../helpers/request'

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    link: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    click: {
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

// Mock do Clerk
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

import { auth } from '@clerk/nextjs/server'

// Dados fictícios para os testes
const mockUser = {
  id: 'user_123',
  clerkId: 'clerk_123',
  email: 'teste@encurtly.com',
  name: 'Usuário Teste',
  plan: 'FREE',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockLink = {
  id: 'link_123',
  slug: 'meu-link',
  url: 'https://google.com',
  title: 'Google',
  description: null,
  password: null,
  expiresAt: null,
  maxClicks: null,
  disabled: false,
  userId: 'user_123',
  workspaceId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: { clicks: 0 },
}

// Limpa os mocks antes de cada teste
beforeEach(() => {
  jest.clearAllMocks()
})

// ─── GET /api/links ────────────────────────────────────

describe('GET /api/links', () => {
  it('retorna 401 quando não está autenticado', async () => {
    ;(auth as unknown as jest.Mock).mockResolvedValue({ userId: null })

    const res = await GET()

    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Não autorizado')
  })

  it('retorna 404 quando usuário não existe no banco', async () => {
    ;(auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_123' })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    const res = await GET()

    expect(res.status).toBe(404)
  })

  it('retorna lista de links do usuário', async () => {
    ;(auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_123' })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    ;(prisma.link.findMany as jest.Mock).mockResolvedValue([mockLink])

    const res = await GET()

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(1)
    expect(body[0].slug).toBe('meu-link')
  })
})

// ─── POST /api/links ───────────────────────────────────

describe('POST /api/links', () => {
  it('retorna 401 quando não está autenticado', async () => {
    ;(auth as unknown as jest.Mock).mockResolvedValue({ userId: null })

    const req = createRequest('http://localhost:3000/api/links', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://google.com' }),
    })
    const res = await POST(req)

    expect(res.status).toBe(401)
  })

  it('retorna 400 quando URL é inválida', async () => {
    ;(auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_123' })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

    const req = createRequest('http://localhost:3000/api/links', {
      method: 'POST',
      body: JSON.stringify({ url: 'url-invalida' }),
    })
    const res = await POST(req)

    expect(res.status).toBe(400)
  })

  it('retorna 409 quando slug já está em uso', async () => {
    ;(auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_123' })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    ;(prisma.link.findUnique as jest.Mock).mockResolvedValue(mockLink) // slug já existe

    const req = createRequest('http://localhost:3000/api/links', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://google.com', slug: 'meu-link' }),
    })
    const res = await POST(req)

    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toBe('Slug já em uso')
  })

  it('cria link com sucesso', async () => {
    ;(auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_123' })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    ;(prisma.link.findUnique as jest.Mock).mockResolvedValue(null) // slug disponível
    ;(prisma.link.create as jest.Mock).mockResolvedValue(mockLink)

    const req = createRequest('http://localhost:3000/api/links', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://google.com', slug: 'meu-link' }),
    })
    const res = await POST(req)

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.slug).toBe('meu-link')
    expect(body.url).toBe('https://google.com')
  })

  it('retorna 400 quando slug tem caracteres inválidos', async () => {
    ;(auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_123' })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

    const req = createRequest('http://localhost:3000/api/links', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://google.com', slug: 'slug inválido!' }),
    })
    const res = await POST(req)

    expect(res.status).toBe(400)
  })
})