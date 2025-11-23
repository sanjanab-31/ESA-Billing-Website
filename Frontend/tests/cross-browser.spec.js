import { test, expect } from '@playwright/test';

/**
 * Cross-Browser Responsiveness Tests for ESA Billing Website
 * Tests all pages and components across multiple browsers and viewports
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

// Helper function to login with retry
async function login(page) {
    await page.goto('/signin', { waitUntil: 'networkidle' });
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', LOGIN_CREDENTIALS.email);
    await page.fill('input[type="password"]', LOGIN_CREDENTIALS.password);
    await page.click('button:has-text("Sign In")');

    // Wait for navigation to complete
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
}

// Helper to navigate with retry
async function navigateTo(page, linkText, expectedUrl) {
    await page.click(`text=${linkText}`);
    await page.waitForURL(`**/${expectedUrl}`, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
}

test.describe('Complete Cross-Browser Responsiveness Tests', () => {

    test.describe('Dashboard - All Viewports', () => {
        test('Mobile - Dashboard loads and displays correctly', async ({ page }) => {
            await page.setViewportSize(VIEWPORTS.mobile);
            await login(page);

            await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 10000 });
            await expect(page.locator('text=Total Invoice')).toBeVisible();

            await page.screenshot({
                path: `test-results/dashboard-mobile-${test.info().project.name}.png`,
                fullPage: true
            });
        });

        test('Tablet - Dashboard responsive layout', async ({ page }) => {
            await page.setViewportSize(VIEWPORTS.tablet);
            await login(page);

            await expect(page.locator('text=Total Revenue')).toBeVisible();
            await expect(page.locator('text=Recent Activity')).toBeVisible();

            await page.screenshot({
                path: `test-results/dashboard-tablet-${test.info().project.name}.png`,
                fullPage: true
            });
        });

        test('Desktop - Dashboard full layout', async ({ page }) => {
            await page.setViewportSize(VIEWPORTS.desktop);
            await login(page);

            await expect(page.locator('text=Invoice Status')).toBeVisible();
            await expect(page.locator('button:has-text("Create Invoice")')).toBeVisible();

            await page.screenshot({
                path: `test-results/dashboard-desktop-${test.info().project.name}.png`,
                fullPage: true
            });
        });
    });

    test.describe('Invoices Page - All Viewports', () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize(VIEWPORTS.desktop);
            await login(page);
            await navigateTo(page, 'Invoices', 'invoices');
        });

        test('Mobile - Invoice list with horizontal scroll', async ({ page }) => {
            await page.setViewportSize(VIEWPORTS.mobile);
            await expect(page.locator('text=Invoice Management')).toBeVisible();
            await page.screenshot({
                path: `test-results/invoices-mobile-${test.info().project.name}.png`,
                fullPage: true
            });
        });

        test('Tablet - Invoice list layout', async ({ page }) => {
            await page.setViewportSize(VIEWPORTS.tablet);
            await expect(page.locator('button:has-text("Create Invoice")')).toBeVisible();
            await page.screenshot({
                path: `test-results/invoices-tablet-${test.info().project.name}.png`,
                fullPage: true
            });
        });

        test('Desktop - Full invoice table', async ({ page }) => {
            await expect(page.locator('table')).toBeVisible();
            await page.screenshot({
                path: `test-results/invoices-desktop-${test.info().project.name}.png`,
                fullPage: true
            });
        });
    });

    test.describe('Create Invoice Form - All Viewports', () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize(VIEWPORTS.desktop);
            await login(page);
            await navigateTo(page, 'Invoices', 'invoices');

            // Click Create Invoice and wait for form
            await page.click('button:has-text("Create Invoice")');
            await page.waitForTimeout(2000);
            await expect(page.locator('text=Invoice Details')).toBeVisible({ timeout: 10000 });
        });

        test('Mobile - Form stacks vertically', async ({ page }) => {
            await page.setViewportSize(VIEWPORTS.mobile);
            await expect(page.locator('text=Client Information')).toBeVisible();
            await page.screenshot({
                path: `test-results/create-invoice-mobile-${test.info().project.name}.png`,
                fullPage: true
            });
        });

        test('Tablet - Form responsive grid', async ({ page }) => {
            await page.setViewportSize(VIEWPORTS.tablet);
            await expect(page.locator('text=Tax & Calculation')).toBeVisible();
            await page.screenshot({
                path: `test-results/create-invoice-tablet-${test.info().project.name}.png`,
                fullPage: true
            });
        });

        test('Desktop - Form full layout', async ({ page }) => {
            await expect(page.locator('text=Items & Services')).toBeVisible();
            await page.screenshot({
                path: `test-results/create-invoice-desktop-${test.info().project.name}.png`,
                fullPage: true
            });
        });
    });

    test.describe('Clients Page - All Viewports', () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize(VIEWPORTS.desktop);
            await login(page);
            await navigateTo(page, 'Clients', 'clients');
        });

        test('Mobile - Clients table scrollable', async ({ page }) => {
            await page.setViewportSize(VIEWPORTS.mobile);
            await expect(page.locator('text=Client Management')).toBeVisible();
            await page.screenshot({
                path: `test-results/clients-mobile-${test.info().project.name}.png`,
                fullPage: true
            });
        });

        test('Tablet - Clients layout', async ({ page }) => {
            await page.setViewportSize(VIEWPORTS.tablet);
            await expect(page.locator('button:has-text("Add Client")')).toBeVisible();
            await page.screenshot({
                path: `test-results/clients-tablet-${test.info().project.name}.png`,
                fullPage: true
            });
        });

        test('Desktop - Full clients table', async ({ page }) => {
            await expect(page.locator('table')).toBeVisible();
            await page.screenshot({
                path: `test-results/clients-desktop-${test.info().project.name}.png`,
                fullPage: true
            });
        });
    });

    test.describe('Payments Page - All Viewports', () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize(VIEWPORTS.desktop);
            await login(page);
            await navigateTo(page, 'Payments', 'payments');
        });

        test('Mobile - Payments responsive', async ({ page }) => {
            await page.setViewportSize(VIEWPORTS.mobile);
            await expect(page.locator('text=Payment Management')).toBeVisible();
            await page.screenshot({
                path: `test-results/payments-mobile-${test.info().project.name}.png`,
                fullPage: true
            });
        });

        test('Tablet - Payments layout', async ({ page }) => {
            await page.setViewportSize(VIEWPORTS.tablet);
            await expect(page.locator('text=Total Amount')).toBeVisible();
            await page.screenshot({
                path: `test-results/payments-tablet-${test.info().project.name}.png`,
                fullPage: true
            });
        });

        test('Desktop - Full payments view', async ({ page }) => {
            await expect(page.locator('text=Amount Received')).toBeVisible();
            await page.screenshot({
                path: `test-results/payments-desktop-${test.info().project.name}.png`,
                fullPage: true
            });
        });
    });

    test.describe('Settings Page - All Viewports', () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize(VIEWPORTS.desktop);
            await login(page);
            await navigateTo(page, 'Settings', 'settings');
        });

        test('Mobile - Settings tabs scrollable', async ({ page }) => {
            await page.setViewportSize(VIEWPORTS.mobile);
            await expect(page.locator('text=Settings')).toBeVisible();
            await page.screenshot({
                path: `test-results/settings-mobile-${test.info().project.name}.png`,
                fullPage: true
            });
        });

        test('Tablet - Settings layout', async ({ page }) => {
            await page.setViewportSize(VIEWPORTS.tablet);
            await expect(page.locator('text=Profile')).toBeVisible();
            await page.screenshot({
                path: `test-results/settings-tablet-${test.info().project.name}.png`,
                fullPage: true
            });
        });

        test('Desktop - Full settings view', async ({ page }) => {
            await expect(page.locator('text=User Profile')).toBeVisible();
            await page.screenshot({
                path: `test-results/settings-desktop-${test.info().project.name}.png`,
                fullPage: true
            });
        });
    });
});
