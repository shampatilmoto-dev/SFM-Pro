const { expect } = require('@playwright/test');
const {
  BasePage,
  BudgetPage,
  CreditCardsPage,
  DashboardPage,
  EmiPage,
  ExpensePage,
  IncomePage,
  InvestmentPage,
  LoansPage,
  LoginPage,
  ReportsPage,
  SettingsPage
} = require('../page-objects');

const shellPages = [
  { key: 'dashboard', label: 'Dashboard', PageClass: DashboardPage, path: '/dashboard.html', title: /Dashboard/i, hero: '#greeting, main h1', shellType: 'enterprise' },
  { key: 'income', label: 'Income', PageClass: IncomePage, path: '/pages/income.html', title: /Income/i, hero: '.income-hero h2, .page-header h1', shellType: 'enterprise' },
  { key: 'expense', label: 'Expenses', PageClass: ExpensePage, path: '/pages/expense.html', title: /Expense/i, hero: '.expense-hero h2, .page-header h1', shellType: 'enterprise' },
  { key: 'budget', label: 'Budget', PageClass: BudgetPage, path: '/pages/budget.html', title: /Budget/i, hero: '.budget-hero h2, .header-copy h1', shellType: 'enterprise' },
  { key: 'loans', label: 'Loans', PageClass: LoansPage, path: '/pages/loans.html', title: /Loans/i, hero: '.loans-hero h2, .header-copy h1', shellType: 'enterprise' },
  { key: 'creditcards', label: 'Credit Cards', PageClass: CreditCardsPage, path: '/pages/creditcards.html', title: /Credit Cards/i, hero: '.creditcards-hero h2, .header-copy h1', shellType: 'enterprise' },
  { key: 'emi', label: 'EMI Tracker', PageClass: EmiPage, path: '/pages/emi.html', title: /EMI/i, hero: 'h1, h2', shellType: 'legacy' },
  { key: 'investments', label: 'Investments', PageClass: InvestmentPage, path: '/pages/investments.html', title: /Investments/i, hero: '.investments-hero h2, .header-copy h1', shellType: 'enterprise' },
  { key: 'reports', label: 'Reports', PageClass: ReportsPage, path: '/pages/reports.html', title: /Reports/i, hero: '.reports-hero h2, .header-copy h1', shellType: 'enterprise' },
  { key: 'settings', label: 'Settings', PageClass: SettingsPage, path: '/pages/settings.html', title: /Settings/i, hero: '.settings-hero h2, .header-copy h1', shellType: 'enterprise' }
];

function createPageObject(page, key) {
  const item = shellPages.find((entry) => entry.key === key);
  if (!item) {
    throw new Error(`Unknown shell page: ${key}`);
  }

  return new item.PageClass(page);
}

async function openShellPage(page, key) {
  const pageObject = createPageObject(page, key);
  await pageObject.openPage();
  return pageObject;
}

async function verifyCommonShell(page) {
  const header = page.locator('header, .top-header, .expense-header, .income-header, .enterprise-header').first();
  const sidebar = page.locator('aside, .sidebar, .expense-sidebar').first();
  const main = page.locator('main, .main-content, .page-container, .loans-main, .expense-main').first();

  await expect(header).toBeVisible();
  await expect(sidebar).toBeVisible();
  await expect(main).toBeVisible();
}

async function verifyOptionalFooter(page) {
  const footer = page.locator('footer, .dashboard-footer, .enterprise-footer, .expense-footer, .settings-footer, .reports-footer, .creditcards-footer, .investments-footer, .loans-footer');
  const count = await footer.count();
  if (count > 0) {
    await expect(footer.first()).toBeVisible();
  }
}

async function verifyNoHorizontalOverflow(page) {
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  expect(hasOverflow).toBeFalsy();
}

async function verifyVisibleHero(page, heroSelector) {
  const hero = page.locator(heroSelector).first();
  await expect(hero).toBeVisible();
}

module.exports = {
  BasePage,
  shellPages,
  createPageObject,
  openShellPage,
  verifyCommonShell,
  verifyNoHorizontalOverflow,
  verifyOptionalFooter,
  verifyVisibleHero
};