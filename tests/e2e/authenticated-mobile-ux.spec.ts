import { expect, test, type Page } from '@playwright/test';

const email = process.env.BOTSAPAY_E2E_EMAIL;
const password = process.env.BOTSAPAY_E2E_PASSWORD;

async function login(page: Page) {
  test.skip(!email || !password, 'Set BOTSAPAY_E2E_EMAIL and BOTSAPAY_E2E_PASSWORD to run authenticated flows.');

  const isFixtureLogin = email === 'botsapay.e2e@gmail.com';
  await page.goto(isFixtureLogin ? '/login?e2e=1' : '/login');
  await page.getByLabel('Email').fill(email ?? '');
  await page.getByLabel('Password').fill(password ?? '');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/home/, { timeout: 20_000 });
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

async function visitTab(page: Page, name: string, heading: string | RegExp) {
  await page.getByText(name, { exact: true }).last().click();
  await expect(page.getByText(heading).first()).toBeVisible({ timeout: 15_000 });
  await expectNoHorizontalOverflow(page);
}

test.describe('BotsaPay authenticated mobile UX', () => {
  test('logged-in customer can scan the core app tabs', async ({ page }) => {
    await login(page);

    await expect(page.getByText(/Hello,/)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Send money')).toBeVisible();
    await expect(page.getByText('Scan QR')).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await visitTab(page, 'Wallets', 'Wallets');
    await visitTab(page, 'Activity', 'Activity');
    await visitTab(page, 'Alerts', 'Alerts');
    await visitTab(page, 'Profile', 'Profile');
  });

  test('wallet and activity content is usable after login', async ({ page }) => {
    await login(page);

    await page.getByText('Wallets', { exact: true }).last().click();
    await expect(page.getByText(/Create wallet|No wallets yet|Available balance/).first()).toBeVisible({ timeout: 15_000 });
    await expectNoHorizontalOverflow(page);

    await page.getByText('Activity', { exact: true }).last().click();
    await expect(page.getByLabel('Search activity')).toBeVisible({ timeout: 15_000 });
    await page.getByLabel('Search activity').fill('top');
    await expectNoHorizontalOverflow(page);
  });
});
