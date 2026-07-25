const pinoHttp = require("pino-http");
const { logger } = require("../config/logger");

const requestLogger = pinoHttp({
  logger,
  customLogLevel(response, error) {
    if (error || response.statusCode >= 500) {
      return "error";
    }

    if (response.statusCode >= 400) {
      return "warn";
    }

    return "info";
  }
});

module.exports = {
  requestLogger
};
