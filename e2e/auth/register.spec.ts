import { expect, test } from '@playwright/test';

test.describe('User Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display registration form', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Crear Cuenta');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  });

  test('should register new user successfully', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;

    // Fill registration form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Verify we're on dashboard
    await expect(page).toHaveURL('/dashboard');

    // Verify user is logged in (check for logout button or user menu)
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should show error for mismatched passwords', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'different-password');

    await page.click('button[type="submit"]');

    // Verify error message is displayed
    await expect(
      page.locator('text=Las contraseñas no coinciden')
    ).toBeVisible();

    // Verify we're still on registration page
    await expect(page).toHaveURL('/register');
  });

  test('should show error for short password', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', '12345');
    await page.fill('input[name="confirmPassword"]', '12345');

    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=al menos 6 caracteres')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=Inicia sesión aquí');

    await expect(page).toHaveURL('/login');
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]');

    // HTML5 validation should prevent submission
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveAttribute('required', '');
  });
});
