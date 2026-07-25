process.env.NODE_ENV = "test";
process.env.PORT = "4000";
process.env.APP_NAME = "SFM PRO Enterprise API";
process.env.API_VERSION = "6.2.0";
process.env.DATABASE_URL = "postgresql://postgres:password@localhost:5432/sfm_pro_enterprise";
process.env.CORS_ORIGIN = "*";
process.env.JWT_SECRET = "change-this-secret-at-least-32-characters-long";
process.env.JWT_REFRESH_SECRET = "change-this-refresh-secret-at-least-32-characters-long";
process.env.JWT_ACCESS_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_EXPIRES_IN = "30d";
process.env.LOG_LEVEL = "silent";
process.env.COOKIE_SECURE = "false";
process.env.SWAGGER_ENABLED = "false";
process.env.SWAGGER_PATH = "/api/docs";

const request = require("supertest");

jest.mock("../src/services/health.service", () => ({
  getHealthService: jest.fn(async () => ({
    status: "OK",
    version: "6.2.0",
    database: "Connected",
    timestamp: "2026-07-25T00:00:00.000Z"
  }))
}));

const app = require("../src/app");

describe("Health API", () => {
  it("returns the enterprise health payload", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: "success",
      message: "Health check OK",
      data: {
        status: "OK",
        version: "6.2.0",
        database: "Connected"
      }
    });
  });
});
