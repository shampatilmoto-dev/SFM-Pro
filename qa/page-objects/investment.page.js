const { getRoute } = require('../config/routes');
const { ModulePage } = require('./module.page');

class InvestmentPage extends ModulePage {
  constructor(page) {
    super(page);
    this.route = getRoute('investments');
  }

  async openPage() {
    if (!this.route) {
      throw new Error('Route not configured for InvestmentPage');
    }
    await this.open(this.route.path);
    return this;
  }

  getRoute() {
    return this.route;
  }
}

module.exports = {
  InvestmentPage
};