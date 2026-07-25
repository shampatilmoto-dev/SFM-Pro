const { getRoute } = require('../config/routes');
const { ModulePage } = require('./module.page');

class CreditCardsPage extends ModulePage {
  constructor(page) {
    super(page);
    this.route = getRoute('creditcards');
  }

  async openPage() {
    if (!this.route) {
      throw new Error('Route not configured for CreditCardsPage');
    }
    await this.open(this.route.path);
    return this;
  }

  getRoute() {
    return this.route;
  }
}

module.exports = {
  CreditCardsPage
};