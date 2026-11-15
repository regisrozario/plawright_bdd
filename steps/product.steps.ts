import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures/pages.fixture';

const { Given, Then } = createBdd(test);

// e.g. "From $699 or $58.25/mo. for 12 mo.*" — US store, optional thousands
// separator and cents.
const STARTING_PRICE_PATTERN = /^From \$\d{1,3}(,?\d{3})*(\.\d{2})?\b/;

Given('I am on the {string} product page', async ({ productListingPage }, path: string) => {
  await productListingPage.goto(path);
});

Then('every product should have a non-empty name and a well-formed starting price', async ({ productListingPage }) => {
  const products = await productListingPage.getAllProducts();

  expect(products.length).toBeGreaterThan(0);
  for (const product of products) {
    expect(product.name.length, `name for ${JSON.stringify(product)}`).toBeGreaterThan(0);
    expect(product.price, `price for "${product.name}"`).toMatch(STARTING_PRICE_PATTERN);
  }
});

Then('the product lineup should include {string}', async ({ productListingPage }, name: string) => {
  const names = (await productListingPage.getAllProducts()).map(p => p.name);
  expect(names).toContain(name);
});
