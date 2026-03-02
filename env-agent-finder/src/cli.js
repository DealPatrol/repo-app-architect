#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const { scanProject } = require("./index");
const { renderReport } = require("./reporter");
const { provisionEnv } = require("./provisioner");
const { isLicensed, activateLicense, deactivateLicense, getLicenseInfo, generateLicenseKey } = require("./license");

const args = process.argv.slice(2);

let targetDir = process.cwd();
let outputFormat = "terminal";
let outputFile = null;
let showValues = false;
let unmask = false;
let setupMode = false;
let autoOnly = false;
let grabMode = false;
let licenseCmd = null;
let licenseKey = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--target" && args[i + 1]) {
    targetDir = path.resolve(args[i + 1]); i++;
  } else if (args[i] === "--format" && args[i + 1]) {
    outputFormat = args[i + 1]; i++;
  } else if (args[i] === "--output" && args[i + 1]) {
    outputFile = path.resolve(args[i + 1]); i++;
  } else if (args[i] === "--show-values" || args[i] === "-v") {
    showValues = true;
  } else if (args[i] === "--unmask") {
    showValues = true; unmask = true;
  } else if (args[i] === "--setup" || args[i] === "-s") {
    setupMode = true;
  } else if (args[i] === "--auto") {
    setupMode = true; autoOnly = true;
  } else if (args[i] === "--grab" || args[i] === "-g") {
    grabMode = true;
  } else if (args[i] === "--activate" && args[i + 1]) {
    licenseCmd = "activate"; licenseKey = args[i + 1]; i++;
  } else if (args[i] === "--deactivate") {
    licenseCmd = "deactivate";
  } else if (args[i] === "--license") {
    licenseCmd = "info";
  } else if (args[i] === "--generate-key") {
    licenseCmd = "generate";
  } else if (args[i] === "--help" || args[i] === "-h") {
    console.log(`
env-agent-finder — Scan, setup, and grab env vars for any project.

SCAN MODE (default — free):
  --target <dir>      Directory to scan (default: current directory)
  --format <type>     Output: terminal, json, markdown
  --output <file>     Write to file
  --show-values, -v   Show values (masked)
  --unmask            Show full values

SETUP MODE (free):
  --setup, -s         Interactive setup + auto-generate secrets
  --auto              Non-interactive auto-generate only

GRAB MODE (Pro — requires license):
  --grab, -g          Open browser, log into services, grab API keys automatically
                      Scans project → identifies services → opens each dashboard →
                      extracts or guides you through getting each API key

LICENSE:
  --activate <key>    Activate a license key
  --deactivate        Remove license
  --license           Show license info

Examples:
  env-agent-finder --target ./my-project                    # Free scan
  env-agent-finder --target ./my-project --setup            # Free interactive setup
  env-agent-finder --target ./my-project --grab             # Pro: browser grab
  env-agent-finder --activate EAF-XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX
`);
    process.exit(0);
  } else if (!args[i].startsWith("--")) {
    targetDir = path.resolve(args[i]);
  }
}

async function handleLicense() {
  if (licenseCmd === "activate") {
    const result = activateLicense(licenseKey);
    if (result.success) {
      console.log("\n  ✅ License activated! You now have access to --grab mode.\n");
    } else {
      console.log(`\n  ❌ ${result.error}\n`);
    }
    process.exit(0);
  }

  if (licenseCmd === "deactivate") {
    deactivateLicense();
    console.log("\n  ✅ License deactivated.\n");
    process.exit(0);
  }

  if (licenseCmd === "info") {
    const info = getLicenseInfo();
    if (info) {
      console.log(`\n  🔑 License: ${info.key}`);
      console.log(`  📅 Activated: ${info.activated}\n`);
    } else {
      console.log("\n  No license activated. Use --activate <key> to activate.\n");
    }
    process.exit(0);
  }

  if (licenseCmd === "generate") {
    const key = generateLicenseKey();
    console.log(`\n  🔑 Generated license key: ${key}\n`);
    console.log("  Give this key to your customer. They activate it with:");
    console.log(`  env-agent-finder --activate ${key}\n`);
    process.exit(0);
  }
}

async function runGrab() {
  if (!isLicensed()) {
    console.log("");
    console.log("  ═══════════════════════════════════════════════════");
    console.log("  ⚡ GRAB MODE requires a Pro license");
    console.log("  ═══════════════════════════════════════════════════");
    console.log("");
    console.log("  Grab mode opens a real browser, logs into each service,");
    console.log("  and extracts API keys directly from the dashboards.");
    console.log("");
    console.log("  🛒 Get a license at: https://your-store-url.com");
    console.log("");
    console.log("  Already have a key? Activate it:");
    console.log("  env-agent-finder --activate EAF-XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX");
    console.log("");
    process.exit(1);
  }

  const { findGrabbersForServices } = require("./grabbers");
  const { closeBrowser } = require("./grabbers/browser");

  console.log(`\n🔍 Scanning: ${targetDir}\n`);
  const report = await scanProject(targetDir);

  const missingVars = report.envVars.filter((v) => !v.hasValue && v.required !== false);
  const neededGrabbers = findGrabbersForServices(report.services, missingVars);

  if (neededGrabbers.length === 0) {
    console.log("  ✅ No missing env vars that require browser automation.");
    console.log("  All required variables are already set or can be auto-generated.");
    console.log("  Run --setup to auto-fill the rest.\n");
    return;
  }

  console.log("═".repeat(60));
  console.log("  ENV AGENT FINDER — Grab Mode (Pro)");
  console.log("═".repeat(60));
  console.log("");
  console.log(`  Found ${missingVars.length} missing variable(s) across ${neededGrabbers.length} service(s):`);
  for (const { grabber, relevantVars } of neededGrabbers) {
    console.log(`    • ${grabber.name}: ${relevantVars.join(", ")}`);
  }
  console.log("");
  console.log("  A browser will open for each service. Log in, and the tool");
  console.log("  will navigate to the right page and help you grab the keys.");
  console.log("");

  const allGrabbed = {};

  for (const { grabber } of neededGrabbers) {
    console.log(`\n${"─".repeat(50)}`);
    console.log(`  🔌 ${grabber.name.toUpperCase()}`);
    console.log(`${"─".repeat(50)}`);

    try {
      const grabbed = await grabber.grab();
      Object.assign(allGrabbed, grabbed);
    } catch (err) {
      console.log(`  ❌ Error with ${grabber.name}: ${err.message}`);
    }
  }

  await closeBrowser();

  // Merge grabbed values with existing
  const existingEnv = {};
  for (const v of report.envVars) {
    if (v.value) existingEnv[v.name] = v.value;
  }

  const finalValues = { ...existingEnv, ...allGrabbed };

  // Run the provisioner with grabbed values pre-filled
  console.log("");
  console.log("═".repeat(60));
  console.log("  WRITING .env.local");
  console.log("═".repeat(60));

  // Inject grabbed values into the report
  for (const v of report.envVars) {
    if (allGrabbed[v.name]) {
      v.value = allGrabbed[v.name];
      v.hasValue = true;
    }
  }

  await provisionEnv(targetDir, report, { interactive: false, autoOnly: true });

  // Overwrite with the grabbed values
  const envPath = path.join(targetDir, ".env.local");
  if (fs.existsSync(envPath)) {
    let content = fs.readFileSync(envPath, "utf-8");
    for (const [key, val] of Object.entries(allGrabbed)) {
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (regex.test(content)) {
        content = content.replace(regex, `${key}=${val}`);
      } else {
        content += `\n${key}=${val}`;
      }
    }
    fs.writeFileSync(envPath, content, "utf-8");
  }

  const grabbedCount = Object.keys(allGrabbed).length;
  console.log("");
  console.log(`  🎯 Grabbed ${grabbedCount} value(s) from browser sessions.`);
  console.log(`  📄 Saved to: ${envPath}`);
  console.log("");
}

async function main() {
  if (licenseCmd) {
    await handleLicense();
    return;
  }

  if (grabMode) {
    await runGrab();
    return;
  }

  console.log(`\n🔍 Scanning: ${targetDir}\n`);

  try {
    const report = await scanProject(targetDir);

    if (setupMode) {
      await provisionEnv(targetDir, report, { interactive: !autoOnly, autoOnly });
    } else {
      const output = renderReport(report, outputFormat, { showValues, unmask });

      if (outputFile) {
        fs.writeFileSync(outputFile, output, "utf-8");
        console.log(`\n✅ Report written to: ${outputFile}`);
      } else {
        console.log(output);
      }
    }
  } catch (err) {
    console.error(`\n❌ Error scanning project: ${err.message}`);
    process.exit(1);
  }
}

main();
