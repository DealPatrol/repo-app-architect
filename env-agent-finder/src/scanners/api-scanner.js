const fs = require("fs");
const path = require("path");

const SKIP_DIRS = new Set([
  "node_modules", ".next", ".nuxt", "dist", "build", ".git",
  "coverage", "__pycache__", ".venv", "venv", "vendor", "target",
  ".turbo", ".cache", ".output", "stubs",
]);

function walkDirs(dir, results = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(fullPath);
      walkDirs(fullPath, results);
    }
  }
  return results;
}

function scanNextJsRoutes(targetDir) {
  const routes = [];
  const appDir = path.join(targetDir, "app");
  const apiDir = path.join(appDir, "api");

  if (!fs.existsSync(apiDir)) return routes;

  const dirs = walkDirs(apiDir);
  dirs.unshift(apiDir);

  for (const dir of dirs) {
    const routeFile = ["route.ts", "route.js"].find((f) =>
      fs.existsSync(path.join(dir, f))
    );
    if (!routeFile) continue;

    const filePath = path.join(dir, routeFile);
    const relativePath = path.relative(appDir, dir);
    const routePath = "/" + relativePath.replace(/\\/g, "/");

    let content;
    try {
      content = fs.readFileSync(filePath, "utf-8");
    } catch {
      continue;
    }

    const methods = [];
    const httpMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
    for (const method of httpMethods) {
      const pattern = new RegExp(
        `export\\s+(?:async\\s+)?function\\s+${method}\\b`,
      );
      if (pattern.test(content)) {
        methods.push(method);
      }
    }

    if (methods.length > 0) {
      routes.push({
        path: routePath,
        methods,
        file: path.relative(targetDir, filePath),
        framework: "Next.js App Router",
      });
    }
  }

  return routes;
}

function scanExpressRoutes(targetDir) {
  const routes = [];
  const srcDirs = [
    targetDir,
    path.join(targetDir, "src"),
    path.join(targetDir, "routes"),
    path.join(targetDir, "src", "routes"),
    path.join(targetDir, "api"),
    path.join(targetDir, "src", "api"),
  ];

  for (const dir of srcDirs) {
    if (!fs.existsSync(dir)) continue;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name);
      if (![".js", ".ts", ".mjs"].includes(ext)) continue;

      const filePath = path.join(dir, entry.name);
      let content;
      try {
        content = fs.readFileSync(filePath, "utf-8");
      } catch {
        continue;
      }

      const routePattern =
        /(?:app|router|server)\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
      let match;
      while ((match = routePattern.exec(content)) !== null) {
        const method = match[1].toUpperCase();
        const routePath = match[2];
        const existing = routes.find((r) => r.path === routePath);
        if (existing) {
          if (!existing.methods.includes(method)) existing.methods.push(method);
        } else {
          routes.push({
            path: routePath,
            methods: [method],
            file: path.relative(targetDir, filePath),
            framework: "Express/Fastify",
          });
        }
      }
    }
  }

  return routes;
}

function scanPagesApiRoutes(targetDir) {
  const routes = [];
  const pagesApiDir = path.join(targetDir, "pages", "api");
  if (!fs.existsSync(pagesApiDir)) return routes;

  const dirs = walkDirs(pagesApiDir);
  dirs.unshift(pagesApiDir);

  for (const dir of dirs) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name);
      if (![".ts", ".js", ".tsx", ".jsx"].includes(ext)) continue;

      const filePath = path.join(dir, entry.name);
      const relativePath = path.relative(pagesApiDir, filePath);
      const routeName = relativePath
        .replace(/\\/g, "/")
        .replace(/\.(ts|js|tsx|jsx)$/, "")
        .replace(/\/index$/, "");
      const routePath = "/api/" + routeName;

      routes.push({
        path: routePath,
        methods: ["handler"],
        file: path.relative(targetDir, filePath),
        framework: "Next.js Pages Router",
      });
    }
  }

  return routes;
}

function scanFastApiRoutes(targetDir) {
  const routes = [];
  const pyFiles = [];

  function findPyFiles(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) findPyFiles(fullPath);
      else if (entry.isFile() && entry.name.endsWith(".py")) pyFiles.push(fullPath);
    }
  }

  findPyFiles(targetDir);

  for (const filePath of pyFiles) {
    let content;
    try {
      content = fs.readFileSync(filePath, "utf-8");
    } catch {
      continue;
    }

    const pattern =
      /@(?:app|router)\.(get|post|put|patch|delete)\s*\(\s*['"]([^'"]+)['"]/gi;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      routes.push({
        path: match[2],
        methods: [match[1].toUpperCase()],
        file: path.relative(targetDir, filePath),
        framework: "FastAPI/Flask",
      });
    }
  }

  return routes;
}

async function scanApiRoutes(targetDir) {
  const allRoutes = [
    ...scanNextJsRoutes(targetDir),
    ...scanPagesApiRoutes(targetDir),
    ...scanExpressRoutes(targetDir),
    ...scanFastApiRoutes(targetDir),
  ];

  return allRoutes.sort((a, b) => a.path.localeCompare(b.path));
}

module.exports = { scanApiRoutes };
