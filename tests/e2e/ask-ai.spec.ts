import { test, expect } from '@playwright/test'

test('completes the primary BookVault AI conversation flow', async ({ page }) => {
  await page.route('**/api/chat', async (route) => {
    await route.fulfill({
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-transform',
        'Content-Type': 'text/event-stream; charset=utf-8',
      },
      body: [
        'event: text\ndata: {"content":"For a reflective mystery, try The Name of the Rose."}\n\n',
        'event: done\ndata: {}\n\n',
      ].join(''),
    })
  })

  await page.goto('/ask-ai')

  const question = page.getByRole('textbox', { name: 'Ask a question' })
  const questionText = 'What reflective mystery should I read next?'
  await expect(question).toBeEnabled()
  await question.click()
  await page.keyboard.type(questionText)
  await expect(question).toHaveValue(questionText)
  const send = page.getByRole('button', { name: 'Send' })
  await expect(send).toBeEnabled()
  await send.click()

  await expect(
    page.getByText('What reflective mystery should I read next?'),
  ).toBeVisible()
  await expect(
    page.getByText('For a reflective mystery, try The Name of the Rose.'),
  ).toBeVisible()
  await expect(send).toBeVisible()
  await expect(send).toBeDisabled()
})
