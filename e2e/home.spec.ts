import { test, expect } from '@playwright/test'

test('a página inicial carrega corretamente', async ({ page }) => {
  await page.goto('/')

  // Verifica se a página carregou (ajuste conforme o conteúdo da sua home)
  await expect(page).toHaveTitle(/Encurtly/)
})

test('redireciona para login ao tentar acessar o dashboard sem estar logado', async ({ page }) => {
  await page.goto('/dashboard')

  // Deve redirecionar para sign-in (Clerk)
  await page.waitForURL(/sign-in/)
  expect(page.url()).toContain('sign-in')
})