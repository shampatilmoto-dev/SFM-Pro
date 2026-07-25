const { getRoute } = require('../config/routes');
const { ModulePage } = require('./module.page');

class LoansPage extends ModulePage {
  constructor(page) {
    super(page);
    this.route = getRoute('loans');
  }

  async openPage() {
    if (!this.route) {
      throw new Error('Route not configured for LoansPage');
    }
    await this.open(this.route.path);
    return this;
  }

  getRoute() {
    return this.route;
  }
}

module.exports = {
  LoansPage
};