const fs = require('fs');
const path = require('path');
const { artifactPaths } = require('../config/paths');

function ensureLogDir() {
  fs.mkdirSync(artifactPaths.logs, { recursive: true });
}

function serializeMeta(meta) {
  return Object.keys(meta || {}).length ? ` ${JSON.stringify(meta)}` : '';
}

function write(level, title, message, meta = {}) {
  ensureLogDir();
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] [${title}] ${message}${serializeMeta(meta)}\n`;
  fs.appendFileSync(path.join(artifactPaths.logs, 'qa.log'), line, 'utf8');
}

function logStep(level, title, message, meta = {}) {
  write(level, title, message, meta);
}

module.exports = {
  logStep
};
