function sendSuccess(response, data, message = "OK", statusCode = 200) {
  return response.status(statusCode).json({
    status: "success",
    message,
    data
  });
}

function sendError(response, message = "Internal Server Error", statusCode = 500, details = null) {
  return response.status(statusCode).json({
    status: "error",
    message,
    ...(details ? { details } : {})
  });
}

module.exports = {
  sendSuccess,
  sendError
};
