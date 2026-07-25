const { applicationPages, pageMap } = require('../config/pages');
const { getRoute } = require('../config/routes');
const { waitForNetworkIdle } = require('./waits');

async function goToPage(page, pageName) {
  const route = getRoute(pageName) || pageMap[pageName];
  if (!route) {
    throw new Error(`Unknown application page: ${pageName}`);
  }

  await page.goto(route.path, { waitUntil: 'domcontentloaded' });
  await waitForNetworkIdle(page);
}

async function openFirstApplicationPage(page) {
  const firstPage = applicationPages[0];
  await page.goto(firstPage.path, { waitUntil: 'domcontentloaded' });
  await waitForNetworkIdle(page);
}

async function refreshAndWait(page) {
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForNetworkIdle(page);
}

module.exports = {
  goToPage,
  openFirstApplicationPage,
  refreshAndWait
};