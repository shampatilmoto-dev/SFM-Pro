const pino = require("pino");
const { env } = require("./env");

const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    app: env.APP_NAME,
    version: env.API_VERSION
  },
  redact: ["req.headers.authorization", "req.headers.cookie", "res.headers.set-cookie"]
});

function createLoggerContext(context = {}) {
  return logger.child(context);
}

module.exports = {
  logger,
  createLoggerContext
};
