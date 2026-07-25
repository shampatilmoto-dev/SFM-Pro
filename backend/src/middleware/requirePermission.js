const { HTTP_STATUS } = require("../constants/http");

function getPermissionSet(request) {
  const permissions = request.auth?.permissions || request.auth?.user?.permissions || [];
  return new Set(Array.isArray(permissions) ? permissions : []);
}

function requirePermission(...permissions) {
  return (request, response, next) => {
    const permissionSet = getPermissionSet(request);

    if (permissions.some(permission => permissionSet.has(permission))) {
      return next();
    }

    return response.status(HTTP_STATUS.FORBIDDEN).json({
      status: "error",
      message: "Missing required permission."
    });
  };
}

module.exports = {
  requirePermission
};
