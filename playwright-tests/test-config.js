/**
 * Shared configuration for all test capture scripts.
 *
 * SETUP REQUIRED:
 *  1. Run `node capture.js` once (TC-001) to register a test user via yopmail.
 *     The resulting email is auto-saved to last-run.json and picked up below.
 *  2. Fill in ADMIN credentials with your actual admin account.
 */

const fs   = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173';
const DEFAULT_PASSWORD = 'SecurePass@123';

// Auto-load stable user from TC-001's last run
let STABLE_USER = { email: 'mayurika.testuser@yopmail.com', password: DEFAULT_PASSWORD, name: 'Test User' };
try {
  const saved = JSON.parse(fs.readFileSync(path.join(__dirname, 'last-run.json'), 'utf8'));
  if (saved.email) STABLE_USER.email = saved.email;
} catch {}
// If TC-004 reset the password, use the updated one
try {
  const tc4 = JSON.parse(fs.readFileSync(path.join(__dirname, 'tc004-run.json'), 'utf8'));
  if (tc4.newPassword && tc4.email === STABLE_USER.email) STABLE_USER.password = tc4.newPassword;
} catch {}

// ── TODO: update with your actual admin credentials ───────────────────────
const ADMIN = {
  email:    'sangamsunar@yopmail.com',
  password: '123123',
};

module.exports = { BASE_URL, STABLE_USER, ADMIN, DEFAULT_PASSWORD };
