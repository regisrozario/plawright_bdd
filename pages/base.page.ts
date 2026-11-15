import { Page } from '@playwright/test';

/**
 * Every apple.com page shares the same global nav bar (#globalnav), so the nav
 * lives here on the base class rather than being duplicated per page object.
 */
export class BasePage {
  constructor(protected readonly page: Page) {}

  readonly globalNav = this.page.locator('#globalnav');

  locator(selector: string) {
    return this.page.locator(selector);
  }

  async goto(path: string = '/') {
    await this.page.goto(path);
  }

  /** Top-level nav link by its accessible name, e.g. "Mac", "iPhone". */
  navLink(name: string) {
    return this.globalNav.getByRole('link', { name, exact: true });
  }

  async clickNavLink(name: string) {
    await this.navLink(name).click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
