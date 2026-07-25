const app = require("./app");
const { env } = require("./config/env");
const { logger } = require("./config/logger");
const { connectDatabase, disconnectDatabase } = require("./config/database");

let server;
let shuttingDown = false;

async function closeServer() {
  if (!server) {
    return;
  }

  await new Promise(resolve => {
    server.close(() => resolve());
  });
}

async function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logger.info({ signal }, "Shutting down server");

  await closeServer();
  await disconnectDatabase();
  process.exit(0);
}

async function startServer() {
  await connectDatabase();

  server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, `${env.APP_NAME} is running`);
  });

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);

  return server;
}

if (require.main === module) {
  startServer().catch(error => {
    logger.error({ error: error.message, stack: error.stack }, "Server startup failed");
    process.exit(1);
  });
}

module.exports = {
  startServer
};
