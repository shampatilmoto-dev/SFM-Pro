const { getRoute } = require('../config/routes');
const { ModulePage } = require('./module.page');

class ExpensePage extends ModulePage {
  constructor(page) {
    super(page);
    this.route = getRoute('expense');
  }

  async openPage() {
    if (!this.route) {
      throw new Error('Route not configured for ExpensePage');
    }
    await this.open(this.route.path);
    return this;
  }

  getRoute() {
    return this.route;
  }
}

module.exports = {
  ExpensePage
};