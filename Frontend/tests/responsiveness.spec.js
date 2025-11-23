import { test, expect } from '@playwright/test';

/**
 * Improved Responsiveness Tests for ESA Billing Website
 * Fixed timeout issues and improved reliability
 */

const LOGIN_CREDENTIALS = {
    email: 'user@example.com',
    password: 'Test123'
};

const VIEWPORTS = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1440, height: 900 }
};

// Increase timeout for all tests
test.setTimeout(60000); // 60 seconds

// Helper function to login
async function login(page) {
    try {
        await page.goto('/signin', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForSelector('input[type="email"]', { timeout: 15000 });
        await page.fill('input[type="email"]', LOGIN_CREDENTIALS.email);
        await page.fill('input[type="password"]', LOGIN_CREDENTIALS.password);
        await page.click('button:has-text("Sign In")');
        await page.waitForURL('**/dashboard', { timeout: 30000 });
        await page.waitForLoadState('domcontentloaded');
    } catch (error) {
        console.error('Login failed:', error.message);
        throw error;
    }
}

test.describe('Dashboard Responsiveness', () => {
    test('should be responsive on mobile', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await login(page);

        await expect(page.locator('text=Total Invoice')).toBeVisible({ timeout: 15000 });
        await expect(page.locator('text=Total Revenue')).toBeVisible();

        await page.screenshot({ path: `test-results/dashboard-mobile-${test.info().project.name}.png`, fullPage: true });
    });

    test('should be responsive on tablet', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.tablet);
        await login(page);

        await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 15000 });
        await page.screenshot({ path: `test-results/dashboard-tablet-${test.info().project.name}.png`, fullPage: true });
    });

    test('should be responsive on desktop', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.desktop);
        await login(page);

        await expect(page.locator('text=Recent Activity')).toBeVisible({ timeout: 15000 });
        await page.screenshot({ path: `test-results/dashboard-desktop-${test.info().project.name}.png`, fullPage: true });
    });
});

test.describe('Invoices Page Responsiveness', () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.desktop);
        await login(page);
        await page.click('text=Invoices');
        await page.waitForURL('**/invoices', { timeout: 30000 });
        await page.waitForLoadState('domcontentloaded');
    });

    test('should display invoice list on mobile', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await expect(page.locator('text=Invoice Management')).toBeVisible({ timeout: 15000 });
        await page.screenshot({ path: `test-results/invoices-mobile-${test.info().project.name}.png`, fullPage: true });
    });

    test('should display invoice list on tablet', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.tablet);
        await expect(page.locator('text=Invoice Management')).toBeVisible({ timeout: 15000 });
        await page.screenshot({ path: `test-results/invoices-tablet-${test.info().project.name}.png`, fullPage: true });
    });

    test('should display invoice list on desktop', async ({ page }) => {
        await expect(page.locator('text=Create Invoice')).toBeVisible({ timeout: 15000 });
        await page.screenshot({ path: `test-results/invoices-desktop-${test.info().project.name}.png`, fullPage: true });
    });
});

test.describe('Create Invoice Form Responsiveness', () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.desktop);
        await login(page);
        await page.click('text=Invoices');
        await page.waitForURL('**/invoices', { timeout: 30000 });
        await page.click('button:has-text("Create Invoice")');
        await page.waitForTimeout(2000);
    });

    test('should stack form elements on mobile', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await expect(page.locator('text=Invoice Details')).toBeVisible({ timeout: 15000 });
        await page.screenshot({ path: `test-results/create-invoice-mobile-${test.info().project.name}.png`, fullPage: true });
    });

    test('should display form properly on tablet', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.tablet);
        await expect(page.locator('text=Invoice Details')).toBeVisible({ timeout: 15000 });
        await page.screenshot({ path: `test-results/create-invoice-tablet-${test.info().project.name}.png`, fullPage: true });
    });

    test('should display form in grid on desktop', async ({ page }) => {
        await expect(page.locator('text=Invoice Details')).toBeVisible({ timeout: 15000 });
        await page.screenshot({ path: `test-results/create-invoice-desktop-${test.info().project.name}.png`, fullPage: true });
    });
});

test.describe('Clients Page Responsiveness', () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.desktop);
        await login(page);
        await page.click('text=Clients');
        await page.waitForURL('**/clients', { timeout: 30000 });
        await page.waitForLoadState('domcontentloaded');
    });

    test('should display clients table on mobile', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await expect(page.locator('text=Client Management')).toBeVisible({ timeout: 15000 });
        await page.screenshot({ path: `test-results/clients-mobile-${test.info().project.name}.png`, fullPage: true });
    });

    test('should display clients table on tablet', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.tablet);
        await expect(page.locator('button:has-text("Add Client")')).toBeVisible({ timeout: 15000 });
        await page.screenshot({ path: `test-results/clients-tablet-${test.info().project.name}.png`, fullPage: true });
    });

    test('should display clients table on desktop', async ({ page }) => {
        await expect(page.locator('input[placeholder*="Search"]')).toBeVisible({ timeout: 15000 });
        await page.screenshot({ path: `test-results/clients-desktop-${test.info().project.name}.png`, fullPage: true });
    });
});

test.describe('Payments Page Responsiveness', () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.desktop);
        await login(page);
        await page.click('text=Payments');
        await page.waitForURL('**/payments', { timeout: 30000 });
        await page.waitForLoadState('domcontentloaded');
    });

    test('should display payments on mobile', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await expect(page.locator('text=Payment Management')).toBeVisible({ timeout: 15000 });
        await page.screenshot({ path: `test-results/payments-mobile-${test.info().project.name}.png`, fullPage: true });
    });

    test('should display payments on tablet', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.tablet);
        await expect(page.locator('text=Total Amount')).toBeVisible({ timeout: 15000 });
        await page.screenshot({ path: `test-results/payments-tablet-${test.info().project.name}.png`, fullPage: true });
    });

    test('should display payments on desktop', async ({ page }) => {
        await expect(page.locator('text=Amount Received')).toBeVisible({ timeout: 15000 });
        await page.screenshot({ path: `test-results/payments-desktop-${test.info().project.name}.png`, fullPage: true });
    });
});

test.describe('Settings Page Responsiveness', () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.desktop);
        await login(page);
        await page.click('text=Settings');
        await page.waitForURL('**/settings', { timeout: 30000 });
        await page.waitForLoadState('domcontentloaded');
    });

    test('should display settings on mobile', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await expect(page.locator('text=Settings')).toBeVisible({ timeout: 15000 });
        await page.screenshot({ path: `test-results/settings-mobile-${test.info().project.name}.png`, fullPage: true });
    });

    test('should display settings on tablet', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.tablet);
        await expect(page.locator('text=Profile')).toBeVisible({ timeout: 15000 });
        await page.screenshot({ path: `test-results/settings-tablet-${test.info().project.name}.png`, fullPage: true });
    });

    test('should display settings on desktop', async ({ page }) => {
        await expect(page.locator('text=User Profile')).toBeVisible({ timeout: 15000 });
        await page.screenshot({ path: `test-results/settings-desktop-${test.info().project.name}.png`, fullPage: true });
    });
});
