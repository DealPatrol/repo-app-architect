function renderTerminal(report) {
  const lines = [];
  const { meta, envVars, apiRoutes, services } = report;

  lines.push("═".repeat(60));
  lines.push("  ENV AGENT FINDER — Scan Report");
  lines.push("═".repeat(60));
  lines.push("");

  // Project meta
  lines.push("📦 PROJECT INFO");
  lines.push("─".repeat(40));
  if (meta.name) lines.push(`  Name:            ${meta.name}`);
  if (meta.framework) lines.push(`  Framework:       ${meta.framework}`);
  if (meta.language) lines.push(`  Language:        ${meta.language}`);
  if (meta.packageManager) lines.push(`  Package Manager: ${meta.packageManager}`);
  lines.push(`  Docker:          ${meta.hasDocker ? "Yes" : "No"}`);
  lines.push(`  CI/CD:           ${meta.hasCI ? "Yes" : "No"}`);
  lines.push("");

  // Env vars
  lines.push(`🔑 ENVIRONMENT VARIABLES (${envVars.length} found)`);
  lines.push("─".repeat(40));
  if (envVars.length === 0) {
    lines.push("  No environment variables detected.");
  } else {
    const maxName = Math.max(...envVars.map((v) => v.name.length), 10);
    lines.push(
      `  ${"Variable".padEnd(maxName)}  ${"Service".padEnd(25)}  ${"Refs".padEnd(4)}  Status`
    );
    lines.push(`  ${"─".repeat(maxName)}  ${"─".repeat(25)}  ${"─".repeat(4)}  ──────`);
    for (const v of envVars) {
      const status = v.hasValue ? "✅ Set" : v.required === false ? "⚪ Optional" : "❌ Missing";
      const service = (v.service || "—").substring(0, 25);
      lines.push(
        `  ${v.name.padEnd(maxName)}  ${service.padEnd(25)}  ${String(v.references.length).padEnd(4)}  ${status}`
      );
    }
  }
  lines.push("");

  // Services
  lines.push(`🔌 DETECTED SERVICES (${services.length} found)`);
  lines.push("─".repeat(40));
  if (services.length === 0) {
    lines.push("  No external services detected.");
  } else {
    for (const svc of services) {
      const bar = "█".repeat(Math.round(svc.confidence / 10)) +
                  "░".repeat(10 - Math.round(svc.confidence / 10));
      lines.push(`  ${svc.name}`);
      lines.push(`    Category:   ${svc.category}`);
      lines.push(`    Confidence: ${bar} ${svc.confidence}%`);
      if (svc.matchedPackages.length > 0) {
        lines.push(`    Packages:   ${svc.matchedPackages.join(", ")}`);
      }
      if (svc.matchedEnvVars.length > 0) {
        lines.push(`    Env Vars:   ${svc.matchedEnvVars.join(", ")}`);
      }
      if (svc.matchedFiles.length > 0) {
        lines.push(`    Files:      ${svc.matchedFiles.join(", ")}`);
      }
      lines.push(`    Docs:       ${svc.docs}`);
      lines.push("");
    }
  }

  // API routes
  lines.push(`🌐 API ROUTES (${apiRoutes.length} found)`);
  lines.push("─".repeat(40));
  if (apiRoutes.length === 0) {
    lines.push("  No API routes detected.");
  } else {
    const maxPath = Math.max(...apiRoutes.map((r) => r.path.length), 10);
    for (const route of apiRoutes) {
      const methods = route.methods.join(", ");
      lines.push(`  ${route.path.padEnd(maxPath)}  [${methods}]`);
    }
  }
  lines.push("");

  // .env template
  const missingVars = envVars.filter((v) => !v.hasValue);
  if (missingVars.length > 0) {
    lines.push("📋 SUGGESTED .env.local TEMPLATE");
    lines.push("─".repeat(40));
    lines.push("");
    let currentService = null;
    for (const v of missingVars) {
      const svc = v.service || "Other";
      if (svc !== currentService) {
        if (currentService !== null) lines.push("");
        lines.push(`  # ${svc}`);
        currentService = svc;
      }
      lines.push(`  ${v.name}=`);
    }
    lines.push("");
  }

  lines.push("═".repeat(60));
  lines.push(`  Scanned: ${report.targetDir}`);
  lines.push(`  Time:    ${report.scannedAt}`);
  lines.push("═".repeat(60));

  return lines.join("\n");
}

function renderJson(report) {
  return JSON.stringify(report, null, 2);
}

function renderMarkdown(report) {
  const lines = [];
  const { meta, envVars, apiRoutes, services } = report;

  lines.push("# Environment & API Scan Report");
  lines.push("");
  lines.push(`> Scanned: \`${report.targetDir}\`  `);
  lines.push(`> Time: ${report.scannedAt}`);
  lines.push("");

  // Meta
  lines.push("## Project Info");
  lines.push("");
  lines.push("| Property | Value |");
  lines.push("|----------|-------|");
  if (meta.name) lines.push(`| Name | ${meta.name} |`);
  if (meta.framework) lines.push(`| Framework | ${meta.framework} |`);
  if (meta.language) lines.push(`| Language | ${meta.language} |`);
  if (meta.packageManager) lines.push(`| Package Manager | ${meta.packageManager} |`);
  lines.push(`| Docker | ${meta.hasDocker ? "Yes" : "No"} |`);
  lines.push(`| CI/CD | ${meta.hasCI ? "Yes" : "No"} |`);
  lines.push("");

  // Env vars
  lines.push(`## Environment Variables (${envVars.length})`);
  lines.push("");
  if (envVars.length > 0) {
    lines.push("| Variable | Service | References | Status |");
    lines.push("|----------|---------|------------|--------|");
    for (const v of envVars) {
      const status = v.hasValue ? "Set" : v.required === false ? "Optional" : "**Missing**";
      lines.push(
        `| \`${v.name}\` | ${v.service || "—"} | ${v.references.length} | ${status} |`
      );
    }
  } else {
    lines.push("No environment variables detected.");
  }
  lines.push("");

  // Services
  lines.push(`## Detected Services (${services.length})`);
  lines.push("");
  if (services.length > 0) {
    for (const svc of services) {
      lines.push(`### ${svc.name} (${svc.category})`);
      lines.push(`- **Confidence:** ${svc.confidence}%`);
      if (svc.matchedPackages.length > 0) {
        lines.push(`- **Packages:** ${svc.matchedPackages.map((p) => "`" + p + "`").join(", ")}`);
      }
      if (svc.matchedEnvVars.length > 0) {
        lines.push(`- **Env Vars:** ${svc.matchedEnvVars.map((v) => "`" + v + "`").join(", ")}`);
      }
      if (svc.requiredEnvVars.length > 0) {
        lines.push(`- **Required Env Vars:** ${svc.requiredEnvVars.map((v) => "`" + v + "`").join(", ")}`);
      }
      lines.push(`- **Docs:** ${svc.docs}`);
      lines.push("");
    }
  } else {
    lines.push("No external services detected.");
    lines.push("");
  }

  // API routes
  lines.push(`## API Routes (${apiRoutes.length})`);
  lines.push("");
  if (apiRoutes.length > 0) {
    lines.push("| Path | Methods | Framework | File |");
    lines.push("|------|---------|-----------|------|");
    for (const route of apiRoutes) {
      lines.push(
        `| \`${route.path}\` | ${route.methods.join(", ")} | ${route.framework} | \`${route.file}\` |`
      );
    }
  } else {
    lines.push("No API routes detected.");
  }
  lines.push("");

  // .env template
  const missingVars = envVars.filter((v) => !v.hasValue);
  if (missingVars.length > 0) {
    lines.push("## Suggested `.env.local` Template");
    lines.push("");
    lines.push("```bash");
    let currentService = null;
    for (const v of missingVars) {
      const svc = v.service || "Other";
      if (svc !== currentService) {
        if (currentService !== null) lines.push("");
        lines.push(`# ${svc}`);
        currentService = svc;
      }
      lines.push(`${v.name}=`);
    }
    lines.push("```");
  }

  return lines.join("\n");
}

function renderReport(report, format) {
  switch (format) {
    case "json":
      return renderJson(report);
    case "markdown":
    case "md":
      return renderMarkdown(report);
    case "terminal":
    default:
      return renderTerminal(report);
  }
}

module.exports = { renderReport };
