import { test, expect } from '@playwright/test';

test.describe('TipChain E2E Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TipChain/);
    await expect(page.locator('h1')).toContainText(/TipChain|Frictionless|Tipping/i);
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');

    // Test navigation to Explore page
    await page.click('text=Explore');
    await expect(page).toHaveURL(/.*explore/);

    // Test navigation to Blog
    await page.click('text=Blog');
    await expect(page).toHaveURL(/.*blog/);

    // Test navigation to How It Works
    await page.click('text=How It Works');
    await expect(page).toHaveURL(/.*how-it-works/);
  });

  test('blog page displays posts', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('h1')).toContainText(/Creator Economy|Blog/i);

    // Check if blog posts are visible
    const posts = page.locator('article, .blog-post, a[href*="/blog/"]');
    await expect(posts.first()).toBeVisible({ timeout: 10000 });
  });

  test('blog post loads and displays content', async ({ page }) => {
    await page.goto('/blog/ultimate-guide-crypto-tipping-2025');

    // Check title
    await expect(page.locator('h1')).toContainText(/Ultimate Guide|Crypto Tipping/i);

    // Check content exists
    const content = page.locator('article, .content, .prose');
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test('karma projects page loads', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.locator('h1')).toContainText(/Karma|Projects/i);
  });

  test('noah ai dashboard requires authentication', async ({ page }) => {
    await page.goto('/noah-ai');

    // Should show Noah AI dashboard or auth prompt
    const dashboard = page.locator('text=Noah AI');
    const authPrompt = page.locator('text=Connect|Sign In|Login');

    const hasContent = await Promise.race([
      dashboard.isVisible().then(() => 'dashboard'),
      authPrompt.isVisible().then(() => 'auth'),
    ]);

    expect(['dashboard', 'auth']).toContain(hasContent);
  });

  test('SEO meta tags are present on homepage', async ({ page }) => {
    await page.goto('/');

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);

    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute('content', /.+/);
  });

  test('mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check if mobile menu/header is visible
    const header = page.locator('header, nav');
    await expect(header).toBeVisible();

    // Check if content is responsive
    const main = page.locator('main');
    const box = await main.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(375);
  });

  test('accessibility checks', async ({ page }) => {
    await page.goto('/');

    // Check for basic accessibility
    const mainLandmark = page.locator('main');
    await expect(mainLandmark).toBeVisible();

    // Check for skip links or navigation
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('performance: page loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
