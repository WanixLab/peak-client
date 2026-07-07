import { test, expect, type Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@wanix.dev');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/home$/);
}

test.describe('sidebar (desktop)', () => {
  // Desktop Chrome viewport (1280px) → permanent, collapsible rail.
  test('collapses to an icon-only rail and shows tooltips', async ({ page }) => {
    await login(page);

    const drawer = page.locator('.MuiDrawer-paper');
    // Expanded: full width with a visible label.
    expect((await drawer.boundingBox())!.width).toBeGreaterThan(200);
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();

    // Collapse via the header toggle.
    await page.getByRole('button', { name: 'toggle sidebar' }).click();
    await expect.poll(async () => Math.round((await drawer.boundingBox())!.width)).toBeLessThan(100);

    // Labels are gone from the rail; hovering an icon reveals its tooltip.
    await expect(drawer.getByText('Home', { exact: true })).toHaveCount(0);
    await drawer.locator('.MuiListItemButton-root').first().hover();
    await expect(page.getByRole('tooltip')).toHaveText('Home');
  });

  test('logout returns to the login screen', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: 'account menu' }).click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
