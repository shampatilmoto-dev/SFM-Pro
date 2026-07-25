const swaggerUi = require("swagger-ui-express");
const { env } = require("./env");
const { API_BASE_PATH, HEALTH_PATH } = require("../constants/api");

const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "SFM PRO Enterprise API",
    version: env.API_VERSION,
    description: "Enterprise backend foundation for SFM PRO Enterprise v6.2"
  },
  servers: [
    {
      url: API_BASE_PATH,
      description: "Versioned API root"
    }
  ],
  tags: [
    { name: "Health", description: "Health and readiness checks" },
    { name: "Auth", description: "Authentication foundation" },
    { name: "Users", description: "User management foundation" }
  ],
  paths: {
    [`${HEALTH_PATH}`]: {
      get: {
        tags: ["Health"],
        summary: "Check API health",
        responses: {
          200: {
            description: "Service is healthy"
          }
        }
      }
    }
  }
};

function registerSwagger(app) {
  if (!env.SWAGGER_ENABLED) {
    return;
  }

  app.use(env.SWAGGER_PATH, swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
}

module.exports = {
  swaggerSpec,
  registerSwagger
};
