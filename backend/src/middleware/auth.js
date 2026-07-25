const { verifyAccessToken } = require("../utils/jwt");
const { HTTP_STATUS } = require("../constants/http");

function extractBearerToken(request) {
  const header = request.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }

  return request.cookies?.accessToken || "";
}

function authenticate(request, response, next) {
  const token = extractBearerToken(request);

  if (!token) {
    return response.status(HTTP_STATUS.UNAUTHORIZED).json({
      status: "error",
      message: "Authentication required."
    });
  }

  try {
    request.auth = verifyAccessToken(token);
    return next();
  } catch (_error) {
    return response.status(HTTP_STATUS.UNAUTHORIZED).json({
      status: "error",
      message: "Invalid or expired token."
    });
  }
}

module.exports = {
  authenticate,
  extractBearerToken
};
