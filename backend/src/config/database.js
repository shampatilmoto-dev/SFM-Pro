const { PrismaClient } = require("@prisma/client");
const { logger } = require("./logger");

const prisma = globalThis.__SFM_PRO_PRISMA__ || new PrismaClient({
  log: [
    { level: "query", emit: "event" },
    { level: "warn", emit: "event" },
    { level: "error", emit: "event" }
  ]
});

globalThis.__SFM_PRO_PRISMA__ = prisma;

prisma.$on("query", event => {
  logger.debug({ query: event.query, duration: event.duration }, "Database query executed");
});

prisma.$on("warn", event => {
  logger.warn({ message: event.message, target: event.target }, "Database warning");
});

prisma.$on("error", event => {
  logger.error({ message: event.message, target: event.target }, "Database error");
});

async function connectDatabase() {
  await prisma.$connect();
  logger.info("Database connected");
  return prisma;
}

async function disconnectDatabase() {
  await prisma.$disconnect();
  logger.info("Database disconnected");
}

async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "Connected";
  } catch (error) {
    logger.error({ error: error.message }, "Database health check failed");
    return "Disconnected";
  }
}

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase,
  checkDatabaseConnection
};
