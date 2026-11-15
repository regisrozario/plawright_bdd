import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures/pages.fixture';

const { Given, When, Then } = createBdd(test);

Given('I am on the Apple home page', async ({ homePage }) => {
  await homePage.open();
});

When('I click {string} in the global navigation', async ({ homePage }, link: string) => {
  await homePage.clickNavLink(link);
});

Then('the page title should be {string}', async ({ page }, title: string) => {
  await expect(page).toHaveTitle(title);
});

Then('the URL path should be {string}', async ({ page }, path: string) => {
  await expect.poll(() => new URL(page.url()).pathname).toBe(path);
});
