import { nanoid } from 'nanoid'
import { prisma } from '@/lib/prisma'

export async function generateUniqueSlug(): Promise<string> {
  let slug = nanoid(6) // ex: "aB3xYz"

  // Garante que o slug é único no banco
  const existing = await prisma.link.findUnique({ where: { slug } })
  if (existing) return generateUniqueSlug() // tenta novamente se já existe

  return slug
}

export function isValidSlug(slug: string): boolean {
  return /^[a-zA-Z0-9-_]{3,50}$/.test(slug)
}