const DEFAULT_BASE_URL = "http://127.0.0.1:5500";

class EnvironmentManager {
  constructor(env = process.env) {
    this.env = env;
  }

  getEnvironmentName() {
    return String(this.env.APP_ENV || this.env.NODE_ENV || "development").toLowerCase();
  }

  getBaseUrl() {
    return this.env.BASE_URL || this.env[`${this.getEnvironmentName().toUpperCase()}_BASE_URL`] || DEFAULT_BASE_URL;
  }

  getProfile() {
    const name = this.getEnvironmentName();
    return {
      name,
      baseUrl: this.getBaseUrl(),
      ci: Boolean(this.env.CI),
      headless: Boolean(this.env.HEADLESS)
    };
  }

  resolveUrl(pathname = "/") {
    return new URL(pathname, this.getBaseUrl()).toString();
  }
}

module.exports = {
  EnvironmentManager,
  DEFAULT_BASE_URL
};