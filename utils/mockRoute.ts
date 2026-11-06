import { Route } from '@playwright/test';

/**
 * TypeScript port of exercises/11_playwright_route_mock.py — same contract,
 * real Playwright Route type instead of a fake. Builds a handler suitable for
 * page.route(pattern, handler): fulfill with mocked JSON when the request URL
 * matches, otherwise let the real request through unmodified.
 */
export function makeJsonMockHandler(urlSubstring: string, jsonBody: unknown, status = 200) {
  return async (route: Route) => {
    const url = route.request().url();
    if (url.includes(urlSubstring)) {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(jsonBody),
      });
      return;
    }
    await route.continue();
  };
}
