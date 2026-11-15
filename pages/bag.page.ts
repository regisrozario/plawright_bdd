import { BasePage } from './base.page';

/**
 * Shopping bag. Read-only by design: this framework never adds items to the
 * real apple.com bag, it only checks the bag page renders for a new visitor.
 */
export class BagPage extends BasePage {
  readonly heading = this.locator('h1');

  async open() {
    await this.goto('/us/shop/goto/bag'); // redirects to /shop/bag
  }
}
