import { test, expect } from '@playwright/test';

test('content, navigation and project filters work', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/Kerno Studio/);
  await expect(page.locator('h1')).toContainText('Ideas con núcleo.');
  await expect(page.locator('.project-card:visible')).toHaveCount(4);
  await page.getByRole('button', { name: 'Producto digital', exact: true }).click();
  await expect(page.locator('.project-card:visible')).toHaveCount(2);
  await page.getByRole('button', { name: 'Web & marca', exact: true }).click();
  await expect(page.locator('.project-card:visible')).toHaveCount(2);
  await page.getByRole('button', { name: /Todos/ }).click();
  await expect(page.locator('.project-card:visible')).toHaveCount(4);
  await page.locator('.service-list summary').nth(1).click();
  await expect(page.locator('.service-list details').nth(1)).toHaveAttribute('open', '');
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Abrir menú' }).click();
    await expect(page.locator('#mobile-nav')).toBeVisible();
    await page.locator('#mobile-nav a[href="#contacto"]').click();
    await expect(page.locator('#mobile-nav')).toBeHidden();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await expect(page.locator('.contact-button')).toHaveAttribute('href', /^https:\/\/wa.me\/5491161120433/);
  expect(errors).toEqual([]);
});

test('reduced motion keeps all content accessible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.char')).toHaveCount(0);
  await expect(page.locator('.hero-particles')).toHaveCount(0);
  await page.locator('#contacto').scrollIntoViewIfNeeded();
  await expect(page.locator('.contact-button')).toBeVisible();
});

test('particle entrance resolves to text and orbits pause offscreen', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.char').first()).toBeAttached();
  const secondLine = page.locator('h1 .gradient-text');
  await expect(secondLine).toHaveCSS('background-image', 'none');
  await expect(secondLine.locator('.char').first()).toHaveCSS('opacity', '0');
  await expect(page.locator('.hero-particles')).toHaveCount(0, { timeout: 8000 });
  await expect(secondLine.locator('.char').first()).toHaveCSS('opacity', '1');
  await expect(page.locator('.char').first()).toHaveCSS('opacity', '1');
  await expect(page.locator('.orbit .satellite')).toHaveCount(3);
  const satellite = page.locator('.orbit-one .satellite');
  const initial = await satellite.evaluate(node => node.style.left);
  await expect.poll(() => satellite.evaluate(node => node.style.left)).not.toBe(initial);
  await page.locator('#contacto').scrollIntoViewIfNeeded();
  await expect(page.locator('.hero')).toHaveClass(/motion-paused/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.char')).toHaveCount(0);
  await expect(page.locator('h1')).toContainText('Ideas con núcleo.');
  expect(errors).toEqual([]);
});
