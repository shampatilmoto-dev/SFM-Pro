const { getRoute } = require('../config/routes');
const { ModulePage } = require('./module.page');

class BudgetPage extends ModulePage {
  constructor(page) {
    super(page);
    this.route = getRoute('budget');
  }

  async openPage() {
    if (!this.route) {
      throw new Error('Route not configured for BudgetPage');
    }
    await this.open(this.route.path);
    return this;
  }

  getRoute() {
    return this.route;
  }
}

module.exports = {
  BudgetPage
};