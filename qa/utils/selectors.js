const selectors = {
  header: {
    root: '[data-qa="app-header"], header',
    title: '[data-qa="page-title"], h1, .page-title',
    subtitle: '[data-qa="page-subtitle"], .page-subtitle, .subtitle',
    searchInput: 'input[type="search"], input[placeholder*="Search"], [data-qa="global-search"]',
    notificationButton: '[data-qa="notification-button"], button[aria-label*="notification" i]',
    themeToggle: '[data-qa="theme-toggle"], button[aria-label*="theme" i]',
    profileTrigger: '[data-qa="profile-trigger"], button[aria-label*="profile" i]'
  },
  sidebar: {
    root: '[data-qa="sidebar"], aside, nav'
  },
  breadcrumb: {
    root: '[aria-label*="breadcrumb" i], nav[aria-label*="breadcrumbs" i]'
  },
  hero: {
    root: '[data-qa="hero"], .hero, .page-hero, .dashboard-hero'
  },
  search: {
    root: 'input[type="search"], [data-qa="search-input"], .search-input'
  },
  filters: {
    root: '[data-qa="filters"], .filters, .table-filters'
  },
  pagination: {
    root: '[data-qa="pagination"], nav[aria-label*="pagination" i], .pagination'
  },
  kpi: {
    card: '[data-qa*="kpi"], .kpi-card, .dashboard-card, .metric-card'
  },
  charts: {
    root: 'canvas, svg, [data-chart], [role="img"][aria-label*="chart" i]'
  },
  table: {
    root: 'table, [role="table"], .data-table'
  },
  form: {
    root: 'form, [data-qa="form"], .form-card'
  },
  modal: {
    root: '[role="dialog"], .modal, .dialog'
  },
  toast: {
    root: '[role="status"], .toast, .notification'
  },
  loader: {
    root: '[data-qa="loader"], .loader, .loading'
  },
  spinner: {
    root: '[data-qa="spinner"], .spinner, .loading-indicator'
  },
  buttons: {
    action: 'button, [role="button"]'
  }
};

module.exports = {
  selectors
};