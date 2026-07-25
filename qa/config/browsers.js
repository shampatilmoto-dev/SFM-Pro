const { devices } = require("@playwright/test");

function buildBrowserProjects() {
  return [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "edge",
      use: { ...devices["Desktop Edge"], channel: "msedge" }
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] }
    }
  ];
}

module.exports = {
  buildBrowserProjects
};
