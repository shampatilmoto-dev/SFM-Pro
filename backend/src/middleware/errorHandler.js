const { ZodError } = require("zod");
const { logger } = require("../config/logger");
const { HTTP_STATUS } = require("../constants/http");

function errorHandler(error, request, response, _next) {
  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const payload = {
    status: "error",
    message: error.message || "Internal Server Error"
  };

  if (error instanceof ZodError) {
    payload.message = "Validation failed";
    payload.details = error.issues;
    return response.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json(payload);
  }

  if (error.code === "P2002") {
    payload.message = "A record with the same unique value already exists.";
    return response.status(HTTP_STATUS.CONFLICT).json(payload);
  }

  if (error.code === "P2025") {
    payload.message = "Requested record was not found.";
    return response.status(HTTP_STATUS.NOT_FOUND).json(payload);
  }

  logger.error(
    {
      error: error.message,
      stack: error.stack,
      method: request?.method,
      path: request?.originalUrl
    },
    "Unhandled application error"
  );

  return response.status(statusCode).json(payload);
}

module.exports = {
  errorHandler
};
