const bcrypt = require("bcrypt");

const SALT_ROUNDS = 12;

async function hashPassword(password) {
  return bcrypt.hash(String(password), SALT_ROUNDS);
}

async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(String(password), String(hashedPassword));
}

module.exports = {
  SALT_ROUNDS,
  hashPassword,
  comparePassword
};
