const { expect } = require("@playwright/test");
const { routes, getRoute } = require("../config/routes");
const { EnvironmentManager } = require("./environment.manager");

class NavigationManager {
  constructor(page, environmentManager = new EnvironmentManager()) {
    this.page = page;
    this.environmentManager = environmentManager;
  }

  async gotoRoute(routeKey) {
    const route = getRoute(routeKey);
    if (!route) {
      throw new Error(`Unknown enterprise route: ${routeKey}`);
    }
    await this.page.goto(route.path, { waitUntil: "domcontentloaded" });
    return route;
  }

  async gotoDashboard() { return this.gotoRoute("dashboard"); }
  async gotoIncome() { return this.gotoRoute("income"); }
  async gotoExpense() { return this.gotoRoute("expense"); }
  async gotoBudget() { return this.gotoRoute("budget"); }
  async gotoLoans() { return this.gotoRoute("loans"); }
  async gotoCreditCards() { return this.gotoRoute("creditcards"); }
  async gotoEMI() { return this.gotoRoute("emi"); }
  async gotoInvestments() { return this.gotoRoute("investments"); }
  async gotoReports() { return this.gotoRoute("reports"); }
  async gotoSettings() { return this.gotoRoute("settings"); }

  async verifyCurrentPage(expectedRouteKey = null) {
    const currentPath = new URL(this.page.url(), this.environmentManager.getBaseUrl()).pathname;
    if (expectedRouteKey) {
      const route = getRoute(expectedRouteKey);
      expect(route, `Route not found for ${expectedRouteKey}`).not.toBeNull();
      expect(currentPath).toContain(route.path);
      return route;
    }

    const matchedRoute = Object.values(routes).find((route) => currentPath.includes(route.path));
    expect(matchedRoute, "Unable to match the current page route").not.toBeNull();
    return matchedRoute;
  }
}

module.exports = {
  NavigationManager
};