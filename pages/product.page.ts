import { BasePage } from './base.page';

/**
 * A product marketing page such as /iphone-17/. Its "Buy" links carry an
 * accessible name of "Buy, <product>" (verified live 2026-11-14). The same
 * link also appears in the local nav and the compare section, so this takes
 * the first one inside <main> (the hero).
 */
export class ProductPage extends BasePage {
  buyLink(product: string) {
    return this.page.getByRole('main').getByRole('link', { name: `Buy, ${product}`, exact: true }).first();
  }

  async buy(product: string) {
    await this.buyLink(product).click();
    await this.page.waitForURL(/\/shop\/buy-/);
  }
}
