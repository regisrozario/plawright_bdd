import { BasePage } from './base.page';

export interface ProductSummary {
  name: string;
  price: string;
}

/**
 * A category landing page such as /mac/, whose "Explore the lineup" gallery
 * shows one tile per product with a "From $X ..." starting price.
 *
 * Selector notes (verified live 2026-11-14):
 * - Apple's class names are CSS-module hashes (e.g. ProductTile_pricing__mJzcd)
 *   that change between deploys, so only the stable prefix is matched.
 * - The gallery renders a second, hidden copy of every tile; filtering to
 *   visible tiles avoids counting each product twice.
 */
export class ProductListingPage extends BasePage {
  readonly productTiles = this.locator('li[data-analytics-gallery-item-id]')
    .filter({ has: this.locator('[class*="ProductTile_pricing"]') })
    .filter({ visible: true });

  /**
   * Opens a product's marketing page from its lineup tile. Each tile has two
   * "Learn more, <name>" links (image + text, verified live 2026-11-15) and a
   * hidden duplicate tile, hence visible + first.
   */
  async openProduct(name: string) {
    await this.page
      .getByRole('main')
      .getByRole('link', { name: `Learn more, ${name}`, exact: true })
      .filter({ visible: true })
      .first()
      .click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Content-validation building block: scrape every visible product tile.
   * Point it at two surfaces (viewports, locales) and diff the results for a
   * cross-platform content check.
   */
  async getAllProducts(): Promise<ProductSummary[]> {
    await this.productTiles.first().waitFor();
    const count = await this.productTiles.count();
    const products: ProductSummary[] = [];
    for (let i = 0; i < count; i++) {
      const tile = this.productTiles.nth(i);
      const name = await tile.locator('h3').first().innerText();
      const pricing = await tile.locator('[class*="ProductTile_pricing"]').first().innerText();
      products.push({
        name: name.replace(/\s+/g, ' ').trim(), // names contain &nbsp;
        price: pricing.split('\n')[0].trim(),   // drop the "Lease from ..." line
      });
    }
    return products;
  }
}
