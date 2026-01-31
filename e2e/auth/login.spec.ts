import { expect, test } from '@playwright/test';

test.describe('User Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Iniciar Sesión');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    // E2E test user credentials
    await page.fill('input[name="email"]', 'e2e-test@doncandidoia.com');
    await page.fill('input[name="password"]', 'E2eTest2024!');

    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });

    await expect(page).toHaveURL('/dashboard');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    // Verify error message is displayed
    await expect(
      page.locator('text=/error|incorrecto|inválido/i')
    ).toBeVisible();

    // Verify we're still on login page
    await expect(page).toHaveURL('/login');
  });

  test('should navigate to registration page', async ({ page }) => {
    await page.click('text=Regístrate aquí');

    await expect(page).toHaveURL('/register');
  });

  test('should validate email format', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'password123');

    // HTML5 validation should prevent submission
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('should show loading state during login', async ({ page }) => {
    await page.fill('input[name="email"]', 'e2e-test@doncandidoia.com');
    await page.fill('input[name="password"]', 'E2eTest2024!');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Verify button shows loading state
    await expect(submitButton).toBeDisabled();
  });
});
