const { getRoute } = require('../config/routes');
const { ModulePage } = require('./module.page');

class IncomePage extends ModulePage {
  constructor(page) {
    super(page);
    this.route = getRoute('income');
  }

  async openPage() {
    if (!this.route) {
      throw new Error('Route not configured for IncomePage');
    }
    await this.open(this.route.path);
    return this;
  }

  getRoute() {
    return this.route;
  }
}

module.exports = {
  IncomePage
};