import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures/pages.fixture';
import { makeJsonMockHandler } from '../utils/mockRoute';

const { Given, When, Then } = createBdd(test);

const PAGE_HTML = `
  <html>
    <body>
      <div id="price">loading...</div>
      <script>
        fetch('/api/price').then(r => r.json()).then(data => {
          document.getElementById('price').textContent = '$' + data.price.toFixed(2);
        });
      </script>
    </body>
  </html>
`;

// page.goto establishes a real origin so the page's relative fetch('/api/price')
// has something to resolve against; the actual route+setContent happens in the
// next step, after the mock is registered.
Given('a page that fetches the price from {string}', async ({ page }, _endpoint: string) => {
  await page.goto('https://example.com');
});

When('the {string} endpoint is mocked to return a price of {float}', async ({ page }, endpoint: string, price: number) => {
  await page.route(`**${endpoint}`, makeJsonMockHandler(endpoint, { price }));
  await page.setContent(PAGE_HTML);
});

Then('the page should display the price {string}', async ({ page }, expected: string) => {
  await expect(page.locator('#price')).toHaveText(expected);
});
