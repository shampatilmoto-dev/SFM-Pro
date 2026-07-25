const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config();

const toBoolean = value => {
  if (typeof value !== "string") {
    return Boolean(value);
  }

  return ["true", "1", "yes", "on"].includes(value.trim().toLowerCase());
};

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  APP_NAME: z.string().default("SFM PRO Enterprise API"),
  API_VERSION: z.string().default("6.2.0"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  CORS_ORIGIN: z.string().default("*"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  COOKIE_SECURE: z.string().default("false"),
  SWAGGER_ENABLED: z.string().default("true"),
  SWAGGER_PATH: z.string().default("/api/docs")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.issues.map(issue => `${issue.path.join(".") || "env"}: ${issue.message}`).join("; ");
  throw new Error(`Invalid environment configuration: ${message}`);
}

const env = {
  ...parsed.data,
  COOKIE_SECURE: toBoolean(parsed.data.COOKIE_SECURE),
  SWAGGER_ENABLED: toBoolean(parsed.data.SWAGGER_ENABLED)
};

module.exports = {
  env
};
