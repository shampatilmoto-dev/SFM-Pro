const DEFAULT_TIMEOUT_MS = 45_000;
const ACTION_TIMEOUT_MS = 10_000;
const EXPECT_TIMEOUT_MS = 7_500;
const RETRY_COUNT = 1;
const WORKERS = Math.max(1, Math.min(4, require("os").cpus().length || 2));

module.exports = {
  DEFAULT_TIMEOUT_MS,
  ACTION_TIMEOUT_MS,
  EXPECT_TIMEOUT_MS,
  RETRY_COUNT,
  WORKERS
};
