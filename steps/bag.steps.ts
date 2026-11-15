import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures/pages.fixture';

const { Given, Then } = createBdd(test);

Given('I am on the shopping bag page', async ({ bagPage }) => {
  await bagPage.open();
});

Then('the bag heading should be {string}', async ({ bagPage }, text: string) => {
  await expect(bagPage.heading).toHaveText(text);
});
