import { checkLinkLimit, checkClickLimit } from '@/lib/utils/check-limits'
import { prisma } from '@/lib/prisma'

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    link: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    click: {
      count: jest.fn(),
    },
  },
}))

beforeEach(() => {
  jest.clearAllMocks()
})

// ─── checkLinkLimit ─────────────────────────────────

describe('checkLinkLimit', () => {
  it('permite criar links quando o plano é FREE e está abaixo do limite', async () => {
    ;(prisma.link.count as jest.Mock).mockResolvedValue(10)

    const result = await checkLinkLimit('user_123', 'FREE')

    expect(result.allowed).toBe(true)
    expect(result.currentCount).toBe(10)
    expect(result.limit).toBe(50)
  })

  it('bloqueia criação quando o plano FREE atinge o limite de 50 links', async () => {
    ;(prisma.link.count as jest.Mock).mockResolvedValue(50)

    const result = await checkLinkLimit('user_123', 'FREE')

    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('50')
    expect(result.reason).toContain('Free')
  })

  it('bloqueia quando o plano FREE ultrapassa o limite', async () => {
    ;(prisma.link.count as jest.Mock).mockResolvedValue(75)

    const result = await checkLinkLimit('user_123', 'FREE')

    expect(result.allowed).toBe(false)
  })

  it('permite links ilimitados no plano PRO', async () => {
    ;(prisma.link.count as jest.Mock).mockResolvedValue(99999)

    const result = await checkLinkLimit('user_123', 'PRO')

    expect(result.allowed).toBe(true)
  })

  it('permite links ilimitados no plano AGENCY', async () => {
    ;(prisma.link.count as jest.Mock).mockResolvedValue(99999)

    const result = await checkLinkLimit('user_123', 'AGENCY')

    expect(result.allowed).toBe(true)
  })

  it('não consulta o banco quando o plano tem links ilimitados', async () => {
    await checkLinkLimit('user_123', 'PRO')

    expect(prisma.link.count).not.toHaveBeenCalled()
  })
})

// ─── checkClickLimit ────────────────────────────────

describe('checkClickLimit', () => {
  it('permite cliques quando está abaixo do limite do plano FREE', async () => {
    ;(prisma.link.findMany as jest.Mock).mockResolvedValue([
      { id: 'link_1' },
      { id: 'link_2' },
    ])
    ;(prisma.click.count as jest.Mock).mockResolvedValue(500)

    const result = await checkClickLimit('user_123', 'FREE')

    expect(result.allowed).toBe(true)
    expect(result.currentCount).toBe(500)
    expect(result.limit).toBe(1000)
  })

  it('bloqueia quando atinge o limite de cliques do plano FREE', async () => {
    ;(prisma.link.findMany as jest.Mock).mockResolvedValue([{ id: 'link_1' }])
    ;(prisma.click.count as jest.Mock).mockResolvedValue(1000)

    const result = await checkClickLimit('user_123', 'FREE')

    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('1000')
  })

  it('retorna zero cliques quando o usuário não tem links', async () => {
    ;(prisma.link.findMany as jest.Mock).mockResolvedValue([])

    const result = await checkClickLimit('user_123', 'FREE')

    expect(result.allowed).toBe(true)
    expect(result.currentCount).toBe(0)
    expect(prisma.click.count).not.toHaveBeenCalled()
  })

  it('permite até 25000 cliques no plano PRO', async () => {
    ;(prisma.link.findMany as jest.Mock).mockResolvedValue([{ id: 'link_1' }])
    ;(prisma.click.count as jest.Mock).mockResolvedValue(24999)

    const result = await checkClickLimit('user_123', 'PRO')

    expect(result.allowed).toBe(true)
    expect(result.limit).toBe(25000)
  })

  it('bloqueia ao atingir 25000 cliques no plano PRO', async () => {
    ;(prisma.link.findMany as jest.Mock).mockResolvedValue([{ id: 'link_1' }])
    ;(prisma.click.count as jest.Mock).mockResolvedValue(25000)

    const result = await checkClickLimit('user_123', 'PRO')

    expect(result.allowed).toBe(false)
  })

  it('permite até 100000 cliques no plano AGENCY', async () => {
    ;(prisma.link.findMany as jest.Mock).mockResolvedValue([{ id: 'link_1' }])
    ;(prisma.click.count as jest.Mock).mockResolvedValue(99999)

    const result = await checkClickLimit('user_123', 'AGENCY')

    expect(result.allowed).toBe(true)
  })

  it('filtra cliques apenas do mês atual', async () => {
    ;(prisma.link.findMany as jest.Mock).mockResolvedValue([{ id: 'link_1' }])
    ;(prisma.click.count as jest.Mock).mockResolvedValue(100)

    await checkClickLimit('user_123', 'FREE')

    const callArgs = (prisma.click.count as jest.Mock).mock.calls[0][0]
    expect(callArgs.where.createdAt.gte).toBeInstanceOf(Date)
  })
})