const { getRoute } = require('../config/routes');
const { ModulePage } = require('./module.page');

class ReportsPage extends ModulePage {
  constructor(page) {
    super(page);
    this.route = getRoute('reports');
  }

  async openPage() {
    if (!this.route) {
      throw new Error('Route not configured for ReportsPage');
    }
    await this.open(this.route.path);
    return this;
  }

  getRoute() {
    return this.route;
  }
}

module.exports = {
  ReportsPage
};