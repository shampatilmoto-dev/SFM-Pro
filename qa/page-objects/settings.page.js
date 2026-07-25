const { getRoute } = require('../config/routes');
const { ModulePage } = require('./module.page');

class SettingsPage extends ModulePage {
  constructor(page) {
    super(page);
    this.route = getRoute('settings');
  }

  async openPage() {
    if (!this.route) {
      throw new Error('Route not configured for SettingsPage');
    }
    await this.open(this.route.path);
    return this;
  }

  getRoute() {
    return this.route;
  }
}

module.exports = {
  SettingsPage
};