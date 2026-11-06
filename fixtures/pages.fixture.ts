import { test as base } from 'playwright-bdd';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';

type Pages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
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
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
});

export { expect } from '@playwright/test';
