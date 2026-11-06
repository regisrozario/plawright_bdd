import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  locator(selector: string) {
    return this.page.locator(selector);
  }

  async goto(path: string = '/') {
    await this.page.goto(path);
  }
}
