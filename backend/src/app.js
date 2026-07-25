const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");

const { env } = require("./config/env");
const { requestLogger } = require("./middleware/requestLogger");
const { notFound } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/errorHandler");
const { registerSwagger } = require("./config/swagger");
const apiRoutes = require("./routes");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(",").map(item => item.trim()),
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);

registerSwagger(app);
app.get("/", (_request, response) => {
  response.json({
    status: "OK",
    service: env.APP_NAME,
    version: env.API_VERSION
  });
});

app.use("/api", apiRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
