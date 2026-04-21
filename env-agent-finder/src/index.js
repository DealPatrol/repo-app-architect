const { scanEnvVars } = require("./scanners/env-scanner");
const { scanApiRoutes } = require("./scanners/api-scanner");
const { scanServices } = require("./scanners/service-scanner");
const { scanProjectMeta } = require("./scanners/meta-scanner");

async function scanProject(targetDir) {
  const meta = await scanProjectMeta(targetDir);
  const envVars = await scanEnvVars(targetDir);
  const apiRoutes = await scanApiRoutes(targetDir);
  const services = await scanServices(targetDir, envVars);

  return {
    targetDir,
    scannedAt: new Date().toISOString(),
    meta,
    envVars,
    apiRoutes,
    services,
  };
}

module.exports = { scanProject };
