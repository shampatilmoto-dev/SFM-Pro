const applicationPages = require("../data/pages.json");
const { getRouteList } = require("./routes");

const pageMap = applicationPages.reduce((map, page) => {
  map[page.name] = page;
  return map;
}, {});

const enterprisePages = getRouteList();

module.exports = {
  applicationPages,
  enterprisePages,
  pageMap
};