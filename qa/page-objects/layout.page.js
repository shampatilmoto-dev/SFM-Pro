const { BasePage } = require("./base.page");
const { selectors } = require("../utils/selectors");

class LayoutPage extends BasePage {
  header() {
    return this.page.locator(selectors.header.root).first();
  }

  sidebar() {
    return this.page.locator(selectors.sidebar.root).first();
  }

  breadcrumb() {
    return this.page.locator(selectors.breadcrumb.root).first();
  }

  hero() {
    return this.page.locator(selectors.hero.root).first();
  }

  main() {
    return this.page.locator('main, [role="main"], .main-content').first();
  }

  search() {
    return this.page.locator(selectors.search.root).first();
  }

  async verifyShell() {
    await this.waitForVisible(selectors.header.root);
    await this.waitForVisible(selectors.sidebar.root);
    await this.waitForVisible('main, [role="main"], .main-content');
  }
}

module.exports = {
  LayoutPage
};