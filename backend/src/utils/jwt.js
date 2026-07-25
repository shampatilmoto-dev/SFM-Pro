const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

function signAccessToken(payload, options = {}) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    ...options
  });
}

function signRefreshToken(payload, options = {}) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    ...options
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
