# Playwright Cross-Browser Testing Setup

## Overview
This project uses Playwright for automated cross-browser testing across Chrome, Firefox, Safari (WebKit), and Edge, including mobile viewports.

## Installation
Browsers are already installed. If you need to reinstall:
```bash
npx playwright install
```

## Running Tests

### Run all tests (headless mode)
```bash
npm test
```

### Run tests with browser UI visible
```bash
npm run test:headed
```

### Run tests in interactive UI mode
```bash
npm run test:ui
```

### Run tests on specific browsers

**Chrome only:**
```bash
npm run test:chromium
```

**Firefox only:**
```bash
npm run test:firefox
```

**Safari (WebKit) only:**
```bash
npm run test:webkit
```

**Mobile browsers only:**
```bash
npm run test:mobile
```

### View test report
```bash
npm run test:report
```

## Test Coverage

The responsiveness tests cover:

### Pages Tested:
- ✅ Dashboard
- ✅ Invoices (list and create form)
- ✅ Clients
- ✅ Payments
- ✅ Settings

### Viewports Tested:
- **Mobile**: 375x667 (iPhone SE)
- **Tablet**: 768x1024 (iPad)
- **Desktop**: 1440x900 (Standard desktop)

### Browsers Tested:
- ✅ Chromium (Chrome/Edge)
- ✅ Firefox
- ✅ WebKit (Safari)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)
- ✅ Microsoft Edge
- ✅ Google Chrome

## Test Files

- `tests/responsiveness.spec.js` - Main responsiveness tests
- `playwright.config.js` - Playwright configuration

## Screenshots

Test screenshots are automatically saved to `test-results/` directory when tests run.

## Debugging

### Run specific test file:
```bash
npx playwright test tests/responsiveness.spec.js
```

### Run specific test:
```bash
npx playwright test -g "should be responsive on mobile"
```

### Debug mode:
```bash
npx playwright test --debug
```

### Generate code (record actions):
```bash
npx playwright codegen http://localhost:5173
```

## CI/CD Integration

The tests are configured to run in CI environments with:
- Automatic retries (2 retries on failure)
- HTML report generation
- Screenshots on failure
- Video recording on failure

## Tips

1. **Make sure dev server is running** before running tests (Playwright will start it automatically)
2. **Use headed mode** (`npm run test:headed`) to see what's happening
3. **Use UI mode** (`npm run test:ui`) for the best debugging experience
4. **Check test-results/** folder for screenshots and videos of failed tests

## Troubleshooting

### Tests failing?
1. Ensure `npm run dev` is working
2. Check if Firebase credentials are set in `.env`
3. Run tests in headed mode to see what's happening
4. Check the HTML report: `npm run test:report`

### Slow tests?
- Run specific browser: `npm run test:chromium`
- Run specific test file instead of all tests
- Increase timeout in `playwright.config.js` if needed

## Documentation

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
