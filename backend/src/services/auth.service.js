const { hashPassword, comparePassword } = require("../utils/password");
const { signAccessToken, signRefreshToken } = require("../utils/jwt");

function buildAuthPayload(user) {
  return {
    sub: user.id,
    email: user.email,
    role: user.role || null,
    permissions: user.permissions || []
  };
}

async function createTokenPair(user) {
  const payload = buildAuthPayload(user);

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
  };
}

module.exports = {
  buildAuthPayload,
  createTokenPair,
  hashPassword,
  comparePassword
};
