class PerformanceManager {
  constructor(page) {
    this.page = page;
  }

  async measurePageLoad() {
    return this.page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0];
      return navigation ? Math.round(navigation.loadEventEnd - navigation.startTime) : null;
    });
  }

  async measureDomReady() {
    return this.page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0];
      return navigation ? Math.round(navigation.domContentLoadedEventEnd - navigation.startTime) : null;
    });
  }

  async measureNavigationTime() {
    return this.page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0];
      return navigation ? Math.round(navigation.duration) : null;
    });
  }

  async measureLargestContentfulPaint() {
    return this.page.evaluate(() => {
      const lcpEntries = performance.getEntriesByType("largest-contentful-paint");
      if (lcpEntries.length) {
        return Math.round(lcpEntries[lcpEntries.length - 1].startTime);
      }
      const paintEntries = performance.getEntriesByType("paint");
      const fallback = paintEntries.find((entry) => entry.name === "first-contentful-paint");
      return fallback ? Math.round(fallback.startTime) : null;
    });
  }

  async countTotalResources() {
    return this.page.evaluate(() => performance.getEntriesByType("resource").length);
  }

  async collect() {
    const [pageLoad, domReady, navigationTime, largestContentfulPaint, totalResources] = await Promise.all([
      this.measurePageLoad(),
      this.measureDomReady(),
      this.measureNavigationTime(),
      this.measureLargestContentfulPaint(),
      this.countTotalResources()
    ]);

    return {
      pageLoad,
      domReady,
      navigationTime,
      largestContentfulPaint,
      totalResources
    };
  }
}

module.exports = {
  PerformanceManager
};