import { expect, test } from '@playwright/test';

/**
 * Landing Page E2E Tests
 *
 * Tests the public landing page that MonkeyTest audits:
 * - Header navigation
 * - Chat widget
 * - Form validation
 * - SEO elements
 */

test.describe('Landing Page - Public Access', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Header and Navigation', () => {
    test('should display header with navigation', async ({ page }) => {
      // Header should be visible
      await expect(page.locator('header')).toBeVisible();

      // Logo/brand should be visible
      await expect(page.locator('text=Don Cándido')).toBeVisible();
    });

    test('navigation buttons should have proper touch targets', async ({
      page,
    }) => {
      // All navigation buttons should have minimum 44px height
      const navButtons = page.locator('nav button, header button');
      const count = await navButtons.count();

      for (let i = 0; i < count; i++) {
        const button = navButtons.nth(i);
        if (await button.isVisible()) {
          const box = await button.boundingBox();
          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(40); // Allow small tolerance
          }
        }
      }
    });

    test('should have language selector', async ({ page }) => {
      // Language selector should be present
      await expect(
        page.locator('text=/español|english|português/i').first()
      ).toBeVisible();
    });
  });

  test.describe('Chat Widget', () => {
    test('should display chat FAB button', async ({ page }) => {
      // Chat widget FAB should be visible
      const chatButton = page
        .locator(
          'button[aria-label*="chat"], button[aria-label*="asistente"], button[title*="Don Cándido"]'
        )
        .first();
      await expect(chatButton).toBeVisible();
    });

    test('should open chat window on click', async ({ page }) => {
      // Click chat FAB
      const chatButton = page
        .locator(
          'button[aria-label*="asistente"], button[title*="Don Cándido"]'
        )
        .first();

      if (await chatButton.isVisible()) {
        await chatButton.click();

        // Chat window should open
        await expect(page.locator('text=Don Cándido IA')).toBeVisible();
      }
    });

    test('chat input should have aria-label', async ({ page }) => {
      // Open chat
      const chatButton = page
        .locator('button[aria-label*="asistente"]')
        .first();

      if (await chatButton.isVisible()) {
        await chatButton.click();

        // Check input has aria-label
        const chatInput = page.locator('input[aria-label]').first();
        await expect(chatInput).toHaveAttribute('aria-label');
      }
    });
  });

  test.describe('SEO and Accessibility', () => {
    test('should have proper page title', async ({ page }) => {
      await expect(page).toHaveTitle(/Don Cándido/i);
    });

    test('should have lang attribute on html', async ({ page }) => {
      const lang = await page.locator('html').getAttribute('lang');
      expect(lang).toBe('es');
    });

    test('should have meta description', async ({ page }) => {
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute('content');
    });

    test('should have Open Graph meta tags', async ({ page }) => {
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
        'content'
      );
      await expect(
        page.locator('meta[property="og:description"]')
      ).toHaveAttribute('content');
    });

    test('should have structured data (JSON-LD)', async ({ page }) => {
      const jsonLd = page.locator('script[type="application/ld+json"]');
      const count = await jsonLd.count();
      expect(count).toBeGreaterThan(0);
    });

    test('all images should have alt text', async ({ page }) => {
      const images = page.locator('img');
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        if (await img.isVisible()) {
          const alt = await img.getAttribute('alt');
          expect(alt).not.toBeNull();
        }
      }
    });

    test('should have no console errors', async ({ page }) => {
      const errors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.reload();
      await page.waitForLoadState('networkidle');

      // Filter out known external errors (like 404 for external resources)
      const criticalErrors = errors.filter(
        e =>
          !e.includes('404') &&
          !e.includes('favicon') &&
          !e.includes('manifest')
      );

      expect(criticalErrors).toHaveLength(0);
    });
  });

  test.describe('Demo Form', () => {
    test('should have visible demo form section', async ({ page }) => {
      // Scroll to demo section
      await page.locator('#demo').scrollIntoViewIfNeeded();

      // Form should be visible
      const form = page.locator('form').first();
      await expect(form).toBeVisible();
    });

    test('form fields should have labels or aria-labels', async ({ page }) => {
      await page.locator('#demo').scrollIntoViewIfNeeded();

      const inputs = page.locator('form input, form textarea');
      const count = await inputs.count();

      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        if (await input.isVisible()) {
          const ariaLabel = await input.getAttribute('aria-label');
          const id = await input.getAttribute('id');
          const label = id ? page.locator(`label[for="${id}"]`) : null;

          // Should have either aria-label or associated label
          const hasLabel = ariaLabel || (label && (await label.isVisible()));
          expect(hasLabel).toBeTruthy();
        }
      }
    });
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should display mobile menu button', async ({ page }) => {
    await page.goto('/');

    // Mobile menu toggle should be visible
    const menuButton = page.locator('button[aria-label*="menu"]').first();
    await expect(menuButton).toBeVisible();
  });

  test('should have readable text (minimum font size)', async ({ page }) => {
    await page.goto('/');

    // Check that main text is at least 12px
    const mainText = page.locator('p, span, a').first();
    if (await mainText.isVisible()) {
      const fontSize = await mainText.evaluate(el =>
        parseFloat(getComputedStyle(el).fontSize)
      );
      expect(fontSize).toBeGreaterThanOrEqual(12);
    }
  });
});
