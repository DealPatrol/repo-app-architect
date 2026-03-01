function maskValue(val) {
  if (!val || val.length === 0) return "(empty)";
  if (val.length <= 8) return val.substring(0, 2) + "•".repeat(val.length - 2);
  return val.substring(0, 4) + "•".repeat(val.length - 8) + val.substring(val.length - 4);
}

function displayValue(val, source, opts) {
  if (!val) return null;
  if (opts.unmask) return val;
  return maskValue(val);
}

function renderTerminal(report, opts) {
  const lines = [];
  const { meta, envVars, apiRoutes, services } = report;

  lines.push("═".repeat(70));
  lines.push("  ENV AGENT FINDER — Scan Report");
  lines.push("═".repeat(70));
  lines.push("");

  // Project meta
  lines.push("📦 PROJECT INFO");
  lines.push("─".repeat(50));
  if (meta.name) lines.push(`  Name:            ${meta.name}`);
  if (meta.framework) lines.push(`  Framework:       ${meta.framework}`);
  if (meta.language) lines.push(`  Language:        ${meta.language}`);
  if (meta.packageManager) lines.push(`  Package Manager: ${meta.packageManager}`);
  lines.push(`  Docker:          ${meta.hasDocker ? "Yes" : "No"}`);
  lines.push(`  CI/CD:           ${meta.hasCI ? "Yes" : "No"}`);
  lines.push("");

  // Env vars
  lines.push(`🔑 ENVIRONMENT VARIABLES (${envVars.length} found)`);
  lines.push("─".repeat(50));

  if (envVars.length === 0) {
    lines.push("  No environment variables detected.");
  } else if (opts.showValues) {
    for (const v of envVars) {
      const status = v.hasValue ? "✅" : v.required === false ? "⚪" : "❌";
      lines.push("");
      lines.push(`  ${status} ${v.name}`);
      if (v.service) lines.push(`     Service:  ${v.service}`);
      lines.push(`     Refs:     ${v.references.length} reference(s) in code`);

      if (v.values && v.values.length > 0) {
        for (const entry of v.values) {
          const shown = displayValue(entry.value, entry.source, opts);
          lines.push(`     Value:    ${shown}`);
          lines.push(`     Source:   ${entry.source}`);
        }
      } else if (v.hasValue && v.value) {
        const shown = displayValue(v.value, v.valueSource, opts);
        lines.push(`     Value:    ${shown}`);
        if (v.valueSource) lines.push(`     Source:   ${v.valueSource}`);
      } else {
        lines.push(`     Value:    (not set)`);
      }
    }
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
    lines.push("");
    lines.push("  💡 Use --show-values to see values, or --unmask for full values.");
  }
  lines.push("");

  // Services
  lines.push(`🔌 DETECTED SERVICES (${services.length} found)`);
  lines.push("─".repeat(50));
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
  lines.push("─".repeat(50));
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

  // .env template for missing vars
  const missingVars = envVars.filter((v) => !v.hasValue);
  if (missingVars.length > 0) {
    lines.push("📋 SUGGESTED .env.local TEMPLATE");
    lines.push("─".repeat(50));
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

  // Current .env snapshot (when --show-values is used)
  const setVars = envVars.filter((v) => v.hasValue && v.values && v.values.length > 0);
  if (opts.showValues && setVars.length > 0) {
    lines.push("📄 CURRENT .env VALUES");
    lines.push("─".repeat(50));
    lines.push("");
    for (const v of setVars) {
      const val = opts.unmask ? v.values[0].value : maskValue(v.values[0].value);
      lines.push(`  ${v.name}=${val}`);
    }
    lines.push("");
    if (!opts.unmask) {
      lines.push("  🔒 Values are masked. Use --unmask to reveal full values.");
      lines.push("");
    }
  }

  lines.push("═".repeat(70));
  lines.push(`  Scanned: ${report.targetDir}`);
  lines.push(`  Time:    ${report.scannedAt}`);
  lines.push("═".repeat(70));

  return lines.join("\n");
}

function renderJson(report, opts) {
  const output = { ...report };

  if (!opts.showValues) {
    output.envVars = output.envVars.map((v) => {
      const { value, values, ...rest } = v;
      return rest;
    });
  } else if (!opts.unmask) {
    output.envVars = output.envVars.map((v) => ({
      ...v,
      value: v.value ? maskValue(v.value) : null,
      values: (v.values || []).map((entry) => ({
        ...entry,
        value: maskValue(entry.value),
      })),
    }));
  }

  return JSON.stringify(output, null, 2);
}

function renderMarkdown(report, opts) {
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
    if (opts.showValues) {
      lines.push("| Variable | Service | Value | Source | Status |");
      lines.push("|----------|---------|-------|--------|--------|");
      for (const v of envVars) {
        const status = v.hasValue ? "Set" : v.required === false ? "Optional" : "**Missing**";
        let val = "(not set)";
        let source = "—";
        if (v.values && v.values.length > 0) {
          val = opts.unmask ? v.values[0].value : maskValue(v.values[0].value);
          source = v.values[0].source;
        } else if (v.hasValue && v.value) {
          val = opts.unmask ? v.value : maskValue(v.value);
          source = v.valueSource || "—";
        }
        lines.push(
          `| \`${v.name}\` | ${v.service || "—"} | \`${val}\` | ${source} | ${status} |`
        );
      }
    } else {
      lines.push("| Variable | Service | References | Status |");
      lines.push("|----------|---------|------------|--------|");
      for (const v of envVars) {
        const status = v.hasValue ? "Set" : v.required === false ? "Optional" : "**Missing**";
        lines.push(
          `| \`${v.name}\` | ${v.service || "—"} | ${v.references.length} | ${status} |`
        );
      }
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

  // Current .env snapshot
  const setVars = envVars.filter((v) => v.hasValue && v.values && v.values.length > 0);
  if (opts.showValues && setVars.length > 0) {
    lines.push("");
    lines.push("## Current `.env` Values");
    lines.push("");
    lines.push("```bash");
    for (const v of setVars) {
      const val = opts.unmask ? v.values[0].value : maskValue(v.values[0].value);
      lines.push(`${v.name}=${val}`);
    }
    lines.push("```");
    if (!opts.unmask) {
      lines.push("");
      lines.push("> Values are masked. Use `--unmask` to reveal full values.");
    }
  }

  return lines.join("\n");
}

function renderReport(report, format, opts = {}) {
  const options = { showValues: false, unmask: false, ...opts };
  switch (format) {
    case "json":
      return renderJson(report, options);
    case "markdown":
    case "md":
      return renderMarkdown(report, options);
    case "terminal":
    default:
      return renderTerminal(report, options);
  }
}

module.exports = { renderReport };
