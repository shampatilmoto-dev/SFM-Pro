const routes = {
  login: { name: "Login", path: "/login.html", dataPage: "login" },
  dashboard: { name: "Dashboard", path: "/dashboard.html", dataPage: "dashboard" },
  income: { name: "Income", path: "/pages/income.html", dataPage: "income" },
  expense: { name: "Expense", path: "/pages/expense.html", dataPage: "expense" },
  budget: { name: "Budget", path: "/pages/budget.html", dataPage: "budget" },
  loans: { name: "Loans", path: "/pages/loans.html", dataPage: "loans" },
  creditcards: { name: "Credit Cards", path: "/pages/creditcards.html", dataPage: "creditcards" },
  emi: { name: "EMI", path: "/pages/emi.html", dataPage: "emi" },
  investments: { name: "Investments", path: "/pages/investments.html", dataPage: "investments" },
  reports: { name: "Reports", path: "/pages/reports.html", dataPage: "reports" },
  settings: { name: "Settings", path: "/pages/settings.html", dataPage: "settings" }
};

const aliases = {
  home: "dashboard",
  main: "dashboard",
  dashboard: "dashboard",
  login: "login",
  signin: "login",
  signinshell: "login",
  income: "income",
  expense: "expense",
  budget: "budget",
  loans: "loans",
  creditcard: "creditcards",
  creditcards: "creditcards",
  creditcardsmodule: "creditcards",
  creditcardsview: "creditcards",
  "credit-cards": "creditcards",
  "credit_cards": "creditcards",
  cards: "creditcards",
  emi: "emi",
  investment: "investments",
  investments: "investments",
  reports: "reports",
  settings: "settings"
};

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function getRoute(key) {
  const normalized = normalizeKey(key);
  const routeKey = aliases[normalized] || normalized;
  return routes[routeKey] || null;
}

function getRouteList() {
  return Object.values(routes);
}

module.exports = {
  aliases,
  getRoute,
  getRouteList,
  normalizeKey,
  routes
};