import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures/pages.fixture';

const { Given, When, Then } = createBdd(test);

Given('I am on the login page', async ({ loginPage }) => {
  await loginPage.goto('/');
});

When('I log in as {string} with password {string}', async ({ loginPage }, username: string, password: string) => {
  await loginPage.login(username, password);
});

Then('I should be redirected to the inventory page', async ({ page }) => {
  await expect(page).toHaveURL(/inventory\.html/);
});

Then('I should see an error message containing {string}', async ({ loginPage }, text: string) => {
  await expect(loginPage.errorMessage).toBeVisible();
  await expect(loginPage.errorMessage).toContainText(text);
});
