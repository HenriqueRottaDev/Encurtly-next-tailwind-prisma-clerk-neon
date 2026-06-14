import { isValidSlug } from '@/lib/utils/slug'

describe('isValidSlug', () => {
  // Casos válidos
  it('aceita slug com letras minúsculas', () => {
    expect(isValidSlug('meulink')).toBe(true)
  })

  it('aceita slug com letras maiúsculas', () => {
    expect(isValidSlug('MeuLink')).toBe(true)
  })

  it('aceita slug com números', () => {
    expect(isValidSlug('link123')).toBe(true)
  })

  it('aceita slug com hífen', () => {
    expect(isValidSlug('meu-link')).toBe(true)
  })

  it('aceita slug com underscore', () => {
    expect(isValidSlug('meu_link')).toBe(true)
  })

  it('aceita slug com 3 caracteres (mínimo)', () => {
    expect(isValidSlug('abc')).toBe(true)
  })

  it('aceita slug com 50 caracteres (máximo)', () => {
    expect(isValidSlug('a'.repeat(50))).toBe(true)
  })

  // Casos inválidos
  it('rejeita slug com espaço', () => {
    expect(isValidSlug('meu link')).toBe(false)
  })

  it('rejeita slug com caracteres especiais', () => {
    expect(isValidSlug('meu@link')).toBe(false)
  })

  it('rejeita slug com menos de 3 caracteres', () => {
    expect(isValidSlug('ab')).toBe(false)
  })

  it('rejeita slug com mais de 50 caracteres', () => {
    expect(isValidSlug('a'.repeat(51))).toBe(false)
  })

  it('rejeita slug vazio', () => {
    expect(isValidSlug('')).toBe(false)
  })
})