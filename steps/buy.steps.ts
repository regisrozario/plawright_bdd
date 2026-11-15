import { createBdd, DataTable } from 'playwright-bdd';
import { test, expect } from '../fixtures/pages.fixture';
import { CONFIG_OPTION_GROUPS, ConfigOptionGroup } from '../pages/buy-configurator.page';

const { When, Then } = createBdd(test);

When('I search for {string}', async ({ homePage }, term: string) => {
  await homePage.search(term);
});

When('I open the {string} product page from the search results', async ({ searchResultsPage }, product: string) => {
  await searchResultsPage.openProduct(product);
});

When('I choose to buy {string}', async ({ productPage }, product: string) => {
  await productPage.buy(product);
});

When('I select the {string} color', async ({ buyConfiguratorPage }, color: string) => {
  await buyConfiguratorPage.selectColor(color);
});

// Rows are applied in order: the configurator unlocks sections top to bottom.
When('I choose the following options:', async ({ buyConfiguratorPage }, table: DataTable) => {
  for (const { option, choice } of table.hashes()) {
    if (!(option in CONFIG_OPTION_GROUPS)) {
      throw new Error(`Unknown option "${option}". Expected one of: ${Object.keys(CONFIG_OPTION_GROUPS).join(', ')}`);
    }
    await buyConfiguratorPage.selectOption(option as ConfigOptionGroup, choice);
  }
});

// Asserts state only — the button is never clicked (read-only rule).
Then('the "Add to Bag" button should be enabled', async ({ buyConfiguratorPage }) => {
  await expect(buyConfiguratorPage.addToBagButton).toBeEnabled();
});
