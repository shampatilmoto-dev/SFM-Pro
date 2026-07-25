const { getRoute } = require('../config/routes');
const { ModulePage } = require('./module.page');

class DashboardPage extends ModulePage {
  constructor(page) {
    super(page);
    this.route = getRoute('dashboard');
  }

  async openPage() {
    if (!this.route) {
      throw new Error('Route not configured for DashboardPage');
    }
    await this.open(this.route.path);
    return this;
  }

  getRoute() {
    return this.route;
  }
}

module.exports = {
  DashboardPage
};