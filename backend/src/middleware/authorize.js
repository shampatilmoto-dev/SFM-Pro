const { HTTP_STATUS } = require("../constants/http");

function requireRole(...roles) {
  return (request, response, next) => {
    const role = request.auth?.role || request.auth?.user?.role;

    if (!roles.length || roles.includes(role)) {
      return next();
    }

    return response.status(HTTP_STATUS.FORBIDDEN).json({
      status: "error",
      message: "You do not have permission to access this resource."
    });
  };
}

module.exports = {
  requireRole
};
