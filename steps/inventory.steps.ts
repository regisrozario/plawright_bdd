import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures/pages.fixture';

const { Given, When, Then } = createBdd(test);

const PRICE_PATTERN = /^\$\d+\.\d{2}$/;

Given('I am logged in as {string}', async ({ loginPage }, username: string) => {
  await loginPage.goto('/');
  await loginPage.login(username, 'secret_sauce');
});

Then('every product should have a non-empty name and a well-formed price', async ({ inventoryPage }) => {
  const products = await inventoryPage.getAllProducts();

  expect(products.length).toBeGreaterThan(0);
  for (const product of products) {
    expect(product.name.trim().length).toBeGreaterThan(0);
    expect(product.price).toMatch(PRICE_PATTERN);
  }
});

When('I add {string} to the cart', async ({ inventoryPage }, name: string) => {
  await inventoryPage.addToCartByName(name);
});

Then('the cart badge should show {string}', async ({ inventoryPage }, count: string) => {
  await expect(inventoryPage.cartBadge).toHaveText(count);
});
