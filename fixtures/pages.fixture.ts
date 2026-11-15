import { test as base } from 'playwright-bdd';
import { HomePage } from '../pages/home.page';
import { ProductListingPage } from '../pages/product-listing.page';
import { BagPage } from '../pages/bag.page';

type Pages = {
  homePage: HomePage;
  productListingPage: ProductListingPage;
  bagPage: BagPage;
};

/**
 * Playwright Test's fixture system is the framework's built-in dependency
 * injection mechanism: tests declare which page objects they need as
 * parameters, and this file is the only place that knows how to construct
 * them. Swapping a page object's implementation (or injecting a fake for a
 * unit-style test) never requires touching a test file.
 *
 * Extends playwright-bdd's own `test` (not raw @playwright/test) — required
 * since playwright-bdd 9.x: createBdd() rejects a test instance that doesn't
 * ultimately derive from playwright-bdd's test.
 */
export const test = base.extend<Pages>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productListingPage: async ({ page }, use) => {
    await use(new ProductListingPage(page));
  },
  bagPage: async ({ page }, use) => {
    await use(new BagPage(page));
  },
});

export { expect } from '@playwright/test';
