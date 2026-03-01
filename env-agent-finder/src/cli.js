#!/usr/bin/env node

const path = require("path");
const { scanProject } = require("./index");
const { renderReport } = require("./reporter");
const { provisionEnv } = require("./provisioner");

const args = process.argv.slice(2);

let targetDir = process.cwd();
let outputFormat = "terminal";
let outputFile = null;
let showValues = false;
let unmask = false;
let setupMode = false;
let autoOnly = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--target" && args[i + 1]) {
    targetDir = path.resolve(args[i + 1]);
    i++;
  } else if (args[i] === "--format" && args[i + 1]) {
    outputFormat = args[i + 1];
    i++;
  } else if (args[i] === "--output" && args[i + 1]) {
    outputFile = path.resolve(args[i + 1]);
    i++;
  } else if (args[i] === "--show-values" || args[i] === "-v") {
    showValues = true;
  } else if (args[i] === "--unmask") {
    showValues = true;
    unmask = true;
  } else if (args[i] === "--setup" || args[i] === "-s") {
    setupMode = true;
  } else if (args[i] === "--auto") {
    setupMode = true;
    autoOnly = true;
  } else if (args[i] === "--help" || args[i] === "-h") {
    console.log(`
env-agent-finder — Scan a codebase for env vars, APIs, and service dependencies.

Usage:
  env-agent-finder [options]

SCAN MODE (default):
  --target <dir>      Directory to scan (default: current directory)
  --format <type>     Output format: terminal, json, markdown (default: terminal)
  --output <file>     Write output to file instead of stdout
  --show-values, -v   Show env variable values (masked by default)
  --unmask            Show full unmasked values (implies --show-values)

SETUP MODE (writes .env.local):
  --setup, -s         Interactive setup: auto-generates what it can, prompts for the rest
  --auto              Non-interactive: only auto-generate secrets and DB URLs, skip prompts

OTHER:
  -h, --help          Show this help message

Examples:
  env-agent-finder --target ./my-project                           # Scan only
  env-agent-finder --target ./my-project --show-values             # Scan with values
  env-agent-finder --target ./my-project --setup                   # Interactive setup
  env-agent-finder --target ./my-project --auto                    # Auto-generate only
  env-agent-finder --target ./my-project --format markdown -v      # Markdown with values
`);
    process.exit(0);
  } else if (!args[i].startsWith("--")) {
    targetDir = path.resolve(args[i]);
  }
}

async function main() {
  console.log(`\n🔍 Scanning: ${targetDir}\n`);

  try {
    const report = await scanProject(targetDir);

    if (setupMode) {
      await provisionEnv(targetDir, report, { interactive: !autoOnly, autoOnly });
    } else {
      const output = renderReport(report, outputFormat, { showValues, unmask });

      if (outputFile) {
        const fs = require("fs");
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
