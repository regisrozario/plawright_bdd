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

  // Search lives in the global nav: a button opens a flyout with a textbox,
  // Enter navigates to /us/search/<term> (verified live 2026-11-14).
  readonly searchButton = this.globalNav.getByRole('button', { name: 'Search apple.com' });
  readonly searchInput = this.globalNav.getByRole('textbox', { name: 'Search apple.com' });

  async search(term: string) {
    await this.searchButton.click();
    await this.searchInput.fill(term);
    await this.searchInput.press('Enter');
    await this.page.waitForURL(/\/search\//);
  }
}
