const { LayoutPage } = require("./layout.page");
const { selectors } = require("../utils/selectors");

class ModulePage extends LayoutPage {
  kpiCards() {
    return this.page.locator(selectors.kpi.card);
  }

  charts() {
    return this.page.locator(selectors.charts.root);
  }

  table() {
    return this.page.locator(selectors.table.root).first();
  }

  tableRows() {
    return this.page.locator('tbody tr');
  }

  form() {
    return this.page.locator(selectors.form.root).first();
  }

  modal() {
    return this.page.locator(selectors.modal.root).first();
  }

  toast() {
    return this.page.locator(selectors.toast.root).first();
  }

  search() {
    return this.page.locator(selectors.search.root).first();
  }

  filters() {
    return this.page.locator(selectors.filters.root).first();
  }

  pagination() {
    return this.page.locator(selectors.pagination.root).first();
  }

  quickActions() {
    return this.page.locator('[data-qa="quick-actions"], .quick-actions').first();
  }
}

module.exports = {
  ModulePage
};