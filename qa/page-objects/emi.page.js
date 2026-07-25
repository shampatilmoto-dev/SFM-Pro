const { getRoute } = require('../config/routes');
const { ModulePage } = require('./module.page');

class EmiPage extends ModulePage {
  constructor(page) {
    super(page);
    this.route = getRoute('emi');
  }

  async openPage() {
    if (!this.route) {
      throw new Error('Route not configured for EmiPage');
    }
    await this.open(this.route.path);
    return this;
  }

  getRoute() {
    return this.route;
  }
}

module.exports = {
  EmiPage
};