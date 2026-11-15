import { BasePage } from './base.page';

export class HomePage extends BasePage {
  async open() {
    await this.goto('/');
  }
}
