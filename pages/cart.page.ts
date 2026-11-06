import { BasePage } from './base.page';

export class CartPage extends BasePage {
  readonly cartItems = this.locator('.cart_item');

  async getItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async getItemNames(): Promise<string[]> {
    return this.cartItems.locator('.inventory_item_name').allInnerTexts();
  }
}
