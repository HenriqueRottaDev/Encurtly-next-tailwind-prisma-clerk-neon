import { test, expect } from '@playwright/test'

test('a página inicial carrega corretamente', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/Encurtly/)
  await expect(page.getByRole('heading', { name: /Encurte links/i })).toBeVisible()
})

test('botão "Criar conta" leva para o sign-up', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: 'Criar conta' }).first().click()
  await page.waitForURL(/sign-up/)
  expect(page.url()).toContain('sign-up')
})

test('redireciona para login ao tentar acessar o dashboard sem estar logado', async ({ page }) => {
  await page.goto('/dashboard')

  await page.waitForURL(/sign-in/)
  expect(page.url()).toContain('sign-in')
})