import { BasePage } from './base.page';

export interface ProductSummary {
  name: string;
  price: string;
}

export class InventoryPage extends BasePage {
  readonly items = this.locator('.inventory_item');
  readonly cartBadge = this.locator('.shopping_cart_badge');

  /**
   * Scrapes every product card on the page. This is the content-validation
   * building block: swap the selectors and you have the same shape of check
   * used to compare product content across platforms.
   */
  async getAllProducts(): Promise<ProductSummary[]> {
    const count = await this.items.count();
    const products: ProductSummary[] = [];
    for (let i = 0; i < count; i++) {
      const item = this.items.nth(i);
      const name = await item.locator('.inventory_item_name').innerText();
      const price = await item.locator('.inventory_item_price').innerText();
      products.push({ name, price });
    }
    return products;
  }

  async addToCartByName(name: string) {
    const item = this.items.filter({ hasText: name });
    await item.getByRole('button', { name: 'Add to cart' }).click();
  }
}
