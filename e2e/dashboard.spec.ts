import { test, expect } from '@playwright/test'
import { clerk } from '@clerk/testing/playwright'

test.describe('Dashboard autenticado', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clerk.loaded({ page })

    await clerk.signIn({
      page,
      emailAddress: process.env.E2E_CLERK_USER_EMAIL!,
    })

    await page.waitForLoadState('networkidle')

    await page.goto('/dashboard')
    await page.waitForURL('**/dashboard', { timeout: 15000 })

    // Espera o conteúdo principal aparecer (cobre o tempo de compilação do Turbopack)
    await expect(page.getByText('Meus Links')).toBeVisible({ timeout: 20000 })
  })

  test('exibe o dashboard após login', async ({ page }) => {
    await expect(page.getByText('Meus Links')).toBeVisible()
    await expect(page.getByRole('button', { name: /Novo Link/i })).toBeVisible()
  })

  test('cria um novo link com sucesso', async ({ page }) => {
    await page.getByRole('button', { name: /Novo Link/i }).click()

    const urlInput = page.getByPlaceholder('https://exemplo.com/url-muito-longa')
    await urlInput.fill('https://www.exemplo-e2e-test.com')

    const slug = `e2e-test-${Date.now()}`
    await page.getByPlaceholder('Slug personalizado (opcional)').fill(slug)

    await page.getByRole('button', { name: 'Encurtar' }).click()

    await expect(page.getByText(`/r/${slug}`)).toBeVisible({ timeout: 10000 })
  })

  test('copia o link ao clicar no botão copiar', async ({ page }) => {
    // Cria um link para garantir que existe pelo menos um na lista
    await page.getByRole('button', { name: /Novo Link/i }).click()

    const slug = `e2e-copy-${Date.now()}`
    await page.getByPlaceholder('https://exemplo.com/url-muito-longa').fill('https://www.exemplo-copy-test.com')
    await page.getByPlaceholder('Slug personalizado (opcional)').fill(slug)
    await page.getByRole('button', { name: 'Encurtar' }).click()

    // Espera o link aparecer
    const newCard = page.locator('.space-y-3 > div').filter({ hasText: slug })
    await expect(newCard).toBeVisible({ timeout: 10000 })

    // Clica no botão de copiar e confirma que o ícone de sucesso aparece
    const copyButton = newCard.getByRole('button', { name: 'Copiar link' })
    await copyButton.click()

    await expect(newCard.getByTestId('copy-success-icon')).toBeVisible({ timeout: 3000 })
  })
})