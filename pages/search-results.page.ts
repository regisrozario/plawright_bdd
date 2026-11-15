import { BasePage } from './base.page';

/**
 * apple.com search results (/us/search/<term>). Product matches render as
 * cards with an h2 product name followed by "Learn more" / "Buy" / "Support"
 * links (verified live 2026-11-14). Matching the heading exactly matters:
 * "iPhone 17" also returns "iPhone 17e" and "iPhone 17 - Apple" page results.
 */
export class SearchResultsPage extends BasePage {
  productCard(name: string) {
    return this.page
      .getByRole('heading', { name, exact: true, level: 2 })
      .locator('xpath=..');
  }

  async openProduct(name: string) {
    await this.productCard(name).getByRole('link', { name: 'Learn more' }).click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
