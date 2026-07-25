function toIsoTimestamp(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

module.exports = {
  toIsoTimestamp
};
