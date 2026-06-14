import { prisma } from '@/lib/prisma'

// Função pura — fácil de testar, sem dependência externa
export function isValidSlug(slug: string): boolean {
  return /^[a-zA-Z0-9-_]{3,50}$/.test(slug)
}

// Função com dependência — testada separadamente
export async function generateUniqueSlug(): Promise<string> {
  const { nanoid } = await import('nanoid')
  let slug = nanoid(6)

  const existing = await prisma.link.findUnique({ where: { slug } })
  if (existing) return generateUniqueSlug()

  return slug
}