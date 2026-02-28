#!/usr/bin/env node

const path = require("path");
const { scanProject } = require("./index");
const { renderReport } = require("./reporter");

const args = process.argv.slice(2);

let targetDir = process.cwd();
let outputFormat = "terminal";
let outputFile = null;

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
  } else if (args[i] === "--help" || args[i] === "-h") {
    console.log(`
env-agent-finder — Scan a codebase for env vars, APIs, and service dependencies.

Usage:
  env-agent-finder [options]

Options:
  --target <dir>      Directory to scan (default: current directory)
  --format <type>     Output format: terminal, json, markdown (default: terminal)
  --output <file>     Write output to file instead of stdout
  -h, --help          Show this help message

Examples:
  env-agent-finder --target ./my-project
  env-agent-finder --target ./my-project --format markdown --output report.md
  env-agent-finder --format json
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
    const output = renderReport(report, outputFormat);

    if (outputFile) {
      const fs = require("fs");
      fs.writeFileSync(outputFile, output, "utf-8");
      console.log(`\n✅ Report written to: ${outputFile}`);
    } else {
      console.log(output);
    }
  } catch (err) {
    console.error(`\n❌ Error scanning project: ${err.message}`);
    process.exit(1);
  }
}

main();
