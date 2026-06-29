import { expect, test, type Page } from '@playwright/test';

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const documentElement = document.documentElement;
    return documentElement.scrollWidth - documentElement.clientWidth;
  });

  expect(overflow).toBeLessThanOrEqual(1);
}

async function expectPrimaryTouchTargets(page: Page) {
  const targets = page.locator('button, [role="button"]');
  const count = await targets.count();

  for (let index = 0; index < count; index += 1) {
    const target = targets.nth(index);
    if (!(await target.isVisible())) {
      continue;
    }

    const box = await target.boundingBox();
    if (!box) {
      continue;
    }

    expect.soft(box.height, `touch target ${index} height`).toBeGreaterThanOrEqual(44);
    expect.soft(box.width, `touch target ${index} width`).toBeGreaterThanOrEqual(44);
  }
}

async function expectInInitialViewport(page: Page, label: string) {
  const target = page.getByRole('button', { name: label });
  const box = await target.boundingBox();
  const viewport = page.viewportSize();

  expect(box, `${label} button bounds`).not.toBeNull();
  expect(viewport, 'viewport size').not.toBeNull();
  expect((box?.y ?? 0) + (box?.height ?? 0), `${label} button visible without scrolling`).toBeLessThanOrEqual(
    viewport?.height ?? 0,
  );
}

test.describe('BotsaPay unauthenticated mobile UX', () => {
  test('login screen renders cleanly on mobile', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByText('Welcome back')).toBeVisible();
    await expect(page.getByText('Sign in securely to manage wallets')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByText('Forgot password?')).toBeVisible();
    await expect(page.getByText('Create account')).toBeVisible();

    await expectNoHorizontalOverflow(page);
    await expectPrimaryTouchTargets(page);
    await expectInInitialViewport(page, 'Login');
  });

  test('login validation gives immediate, understandable feedback', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Password').fill('short');

    await expect(page.getByText('Enter a valid email address.')).toBeVisible();
    await expect(page.getByText('Password must be at least 8 characters.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeDisabled();
  });

  test('signup path is discoverable from login', async ({ page }) => {
    await page.goto('/login');
    await page.getByText('Create account').click();

    await expect(page).toHaveURL(/\/signup/);
    await expectNoHorizontalOverflow(page);
  });

  test('protected tabs redirect visitors back to login', async ({ page }) => {
    await page.goto('/home');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('Welcome back')).toBeVisible();
  });
});
