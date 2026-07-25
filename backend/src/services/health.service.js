const { env } = require("../config/env");
const { checkDatabaseConnection } = require("../config/database");

async function getHealthService() {
  const database = await checkDatabaseConnection();

  return {
    status: "OK",
    version: env.API_VERSION,
    database,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  getHealthService
};
