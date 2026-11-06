import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly usernameInput = this.locator('#user-name');
  readonly passwordInput = this.locator('#password');
  readonly loginButton = this.locator('#login-button');
  readonly errorMessage = this.locator('[data-test="error"]');

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
