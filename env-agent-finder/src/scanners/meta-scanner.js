const fs = require("fs");
const path = require("path");

async function scanProjectMeta(targetDir) {
  const meta = {
    name: null,
    framework: null,
    language: null,
    packageManager: null,
    hasDocker: false,
    hasCI: false,
  };

  const pkgPath = path.join(targetDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      meta.name = pkg.name || null;
      meta.language = "JavaScript/TypeScript";

      if (pkg.dependencies?.next || pkg.devDependencies?.next) {
        meta.framework = `Next.js ${pkg.dependencies?.next || pkg.devDependencies?.next}`;
      } else if (pkg.dependencies?.nuxt || pkg.devDependencies?.nuxt) {
        meta.framework = `Nuxt ${pkg.dependencies?.nuxt || pkg.devDependencies?.nuxt}`;
      } else if (pkg.dependencies?.react || pkg.devDependencies?.react) {
        meta.framework = `React ${pkg.dependencies?.react || pkg.devDependencies?.react}`;
      } else if (pkg.dependencies?.vue || pkg.devDependencies?.vue) {
        meta.framework = `Vue ${pkg.dependencies?.vue || pkg.devDependencies?.vue}`;
      } else if (pkg.dependencies?.express || pkg.devDependencies?.express) {
        meta.framework = `Express ${pkg.dependencies?.express || pkg.devDependencies?.express}`;
      } else if (pkg.dependencies?.fastify || pkg.devDependencies?.fastify) {
        meta.framework = `Fastify ${pkg.dependencies?.fastify || pkg.devDependencies?.fastify}`;
      }
    } catch {}
  }

  if (fs.existsSync(path.join(targetDir, "requirements.txt")) ||
      fs.existsSync(path.join(targetDir, "pyproject.toml")) ||
      fs.existsSync(path.join(targetDir, "setup.py"))) {
    meta.language = "Python";
    if (fs.existsSync(path.join(targetDir, "pyproject.toml"))) {
      try {
        const content = fs.readFileSync(path.join(targetDir, "pyproject.toml"), "utf-8");
        if (content.includes("django")) meta.framework = "Django";
        else if (content.includes("fastapi")) meta.framework = "FastAPI";
        else if (content.includes("flask")) meta.framework = "Flask";
      } catch {}
    }
  }

  if (fs.existsSync(path.join(targetDir, "go.mod"))) {
    meta.language = "Go";
  }

  if (fs.existsSync(path.join(targetDir, "Cargo.toml"))) {
    meta.language = "Rust";
  }

  if (fs.existsSync(path.join(targetDir, "pnpm-lock.yaml"))) meta.packageManager = "pnpm";
  else if (fs.existsSync(path.join(targetDir, "yarn.lock"))) meta.packageManager = "yarn";
  else if (fs.existsSync(path.join(targetDir, "bun.lockb"))) meta.packageManager = "bun";
  else if (fs.existsSync(path.join(targetDir, "package-lock.json"))) meta.packageManager = "npm";

  meta.hasDocker = fs.existsSync(path.join(targetDir, "Dockerfile")) ||
                   fs.existsSync(path.join(targetDir, "docker-compose.yml")) ||
                   fs.existsSync(path.join(targetDir, "docker-compose.yaml"));

  meta.hasCI = fs.existsSync(path.join(targetDir, ".github", "workflows")) ||
               fs.existsSync(path.join(targetDir, ".gitlab-ci.yml")) ||
               fs.existsSync(path.join(targetDir, ".circleci"));

  return meta;
}

module.exports = { scanProjectMeta };
