const { asyncHandler } = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const { getHealthService } = require("../services/health.service");

const getHealth = asyncHandler(async (_request, response) => {
  const health = await getHealthService();
  return sendSuccess(response, health, "Health check OK");
});

module.exports = {
  getHealth
};
