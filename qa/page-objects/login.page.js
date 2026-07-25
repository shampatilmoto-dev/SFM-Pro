const { BasePage } = require("./base.page");

class LoginPage extends BasePage {
  async openPage() {
    await this.open("/login.html");
    return this;
  }

  logo() {
    return this.page.locator('img[alt*="logo" i], .brand-mark__logo').first();
  }

  usernameInput() {
    return this.page.locator('#username, input[autocomplete="username"]').first();
  }

  passwordInput() {
    return this.page.locator('#password, input[autocomplete="current-password"]').first();
  }

  loginButton() {
    return this.page.locator('.login-button, button:has-text("SIGN IN"), button:has-text("Login")').first();
  }

  forgotPasswordLink() {
    return this.page.locator('.text-link, text=Forgot Password?, text=Forgot password').first();
  }
}

module.exports = {
  LoginPage
};