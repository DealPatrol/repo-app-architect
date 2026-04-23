const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const os = require("os");

const LICENSE_FILE = path.join(os.homedir(), ".env-agent-finder-license");
const PUBLIC_PREFIX = "EAF";

function generateLicenseKey() {
  const seg = () => crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${PUBLIC_PREFIX}-${seg()}-${seg()}-${seg()}-${seg()}`;
}

function validateKeyFormat(key) {
  return /^EAF-[A-F0-9]{8}-[A-F0-9]{8}-[A-F0-9]{8}-[A-F0-9]{8}$/.test(key);
}

function hashKey(key) {
  return crypto.createHash("sha256").update(key + "env-agent-finder-salt-2026").digest("hex");
}

function saveLicense(key) {
  fs.writeFileSync(LICENSE_FILE, JSON.stringify({ key, hash: hashKey(key), activated: new Date().toISOString() }), "utf-8");
}

function loadLicense() {
  try {
    if (fs.existsSync(LICENSE_FILE)) {
      const data = JSON.parse(fs.readFileSync(LICENSE_FILE, "utf-8"));
      if (data.key && validateKeyFormat(data.key) && data.hash === hashKey(data.key)) {
        return data;
      }
    }
  } catch {}
  return null;
}

function isLicensed() {
  return !!loadLicense();
}

function activateLicense(key) {
  if (!validateKeyFormat(key)) {
    return { success: false, error: "Invalid license key format. Expected: EAF-XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX" };
  }
  saveLicense(key);
  return { success: true };
}

function deactivateLicense() {
  try {
    if (fs.existsSync(LICENSE_FILE)) fs.unlinkSync(LICENSE_FILE);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function getLicenseInfo() {
  const lic = loadLicense();
  if (!lic) return null;
  return {
    key: lic.key.substring(0, 12) + "..." + lic.key.substring(lic.key.length - 8),
    activated: lic.activated,
  };
}

module.exports = {
  generateLicenseKey,
  validateKeyFormat,
  isLicensed,
  activateLicense,
  deactivateLicense,
  getLicenseInfo,
};
