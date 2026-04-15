const crypto = require('crypto');

function randomToken(bytes = 24) {
  return crypto.randomBytes(bytes).toString('base64url');
}

function uuid() {
  return crypto.randomUUID();
}

function generateReference() {
  const year = new Date().getFullYear();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CBL-PBR-${year}-${rand}`;
}

module.exports = { randomToken, uuid, generateReference };
