const fs = require("fs");
const path = require("path");

const SKIP_DIRS = new Set([
  "node_modules", ".next", ".nuxt", "dist", "build", ".git",
  "coverage", "__pycache__", ".venv", "venv", "vendor", "target",
  ".turbo", ".cache", ".output", "stubs",
]);

const CODE_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".py", ".go", ".rs", ".rb", ".java", ".kt",
  ".env", ".env.local", ".env.example", ".env.development",
  ".env.production", ".env.test",
  ".yml", ".yaml", ".toml", ".json", ".tf",
]);

const WELL_KNOWN_SERVICES = {
  DATABASE_URL: { service: "Database (PostgreSQL/MySQL)", required: true },
  POSTGRES_URL: { service: "PostgreSQL", required: true },
  MYSQL_URL: { service: "MySQL", required: true },
  MONGODB_URI: { service: "MongoDB", required: true },
  REDIS_URL: { service: "Redis", required: false },
  BLOB_READ_WRITE_TOKEN: { service: "Vercel Blob Storage", required: false },
  NEXT_PUBLIC_SUPABASE_URL: { service: "Supabase", required: true },
  SUPABASE_URL: { service: "Supabase", required: true },
  SUPABASE_SERVICE_ROLE_KEY: { service: "Supabase", required: true },
  STRIPE_SECRET_KEY: { service: "Stripe", required: true },
  STRIPE_PUBLISHABLE_KEY: { service: "Stripe", required: true },
  STRIPE_WEBHOOK_SECRET: { service: "Stripe Webhooks", required: false },
  OPENAI_API_KEY: { service: "OpenAI", required: true },
  ANTHROPIC_API_KEY: { service: "Anthropic", required: true },
  AWS_ACCESS_KEY_ID: { service: "AWS", required: true },
  AWS_SECRET_ACCESS_KEY: { service: "AWS", required: true },
  AWS_REGION: { service: "AWS", required: false },
  S3_BUCKET: { service: "AWS S3", required: false },
  GOOGLE_CLIENT_ID: { service: "Google OAuth", required: false },
  GOOGLE_CLIENT_SECRET: { service: "Google OAuth", required: false },
  GITHUB_CLIENT_ID: { service: "GitHub OAuth", required: false },
  GITHUB_CLIENT_SECRET: { service: "GitHub OAuth", required: false },
  NEXTAUTH_SECRET: { service: "NextAuth.js", required: true },
  NEXTAUTH_URL: { service: "NextAuth.js", required: false },
  AUTH_SECRET: { service: "Auth.js", required: true },
  JWT_SECRET: { service: "JWT Auth", required: true },
  SENDGRID_API_KEY: { service: "SendGrid Email", required: false },
  RESEND_API_KEY: { service: "Resend Email", required: false },
  SMTP_HOST: { service: "SMTP Email", required: false },
  SENTRY_DSN: { service: "Sentry Error Tracking", required: false },
  VERCEL_URL: { service: "Vercel Platform", required: false },
  CLERK_SECRET_KEY: { service: "Clerk Auth", required: true },
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: { service: "Clerk Auth", required: true },
  STACK_PROJECT_ID: { service: "Stack Auth", required: true },
  STACK_PUBLISHED_CLIENT_KEY: { service: "Stack Auth", required: true },
  STACK_SECRET_SERVER_KEY: { service: "Stack Auth", required: true },
  TWILIO_ACCOUNT_SID: { service: "Twilio", required: false },
  TWILIO_AUTH_TOKEN: { service: "Twilio", required: false },
  CLOUDINARY_URL: { service: "Cloudinary", required: false },
  UPSTASH_REDIS_REST_URL: { service: "Upstash Redis", required: false },
  UPSTASH_REDIS_REST_TOKEN: { service: "Upstash Redis", required: false },
  FIREBASE_API_KEY: { service: "Firebase", required: true },
  FIREBASE_PROJECT_ID: { service: "Firebase", required: true },
};

function walkFiles(dir, files = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, files);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      const basename = entry.name.toLowerCase();
      if (CODE_EXTENSIONS.has(ext) || basename.startsWith(".env")) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function extractEnvReferences(content, filePath) {
  const refs = [];

  const patterns = [
    /process\.env\.([A-Z_][A-Z0-9_]*)/g,
    /process\.env\[['"]([A-Z_][A-Z0-9_]*)['"]\]/g,
    /os\.environ(?:\.get)?\(?['"]([A-Z_][A-Z0-9_]*)['"]/g,
    /os\.getenv\(['"]([A-Z_][A-Z0-9_]*)['"]\)/g,
    /env(?:ironment)?\.([A-Z_][A-Z0-9_]*)/g,
    /\$\{([A-Z_][A-Z0-9_]*)\}/g,
    /import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      refs.push({
        name: match[1],
        file: filePath,
        line: content.substring(0, match.index).split("\n").length,
      });
    }
  }

  return refs;
}

function stripQuotes(val) {
  if ((val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }
  return val;
}

function parseEnvFile(filePath) {
  const vars = [];
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith("#")) continue;
      const eqIdx = line.indexOf("=");
      if (eqIdx > 0) {
        const name = line.substring(0, eqIdx).trim();
        const rawValue = line.substring(eqIdx + 1).trim();
        const value = stripQuotes(rawValue);
        if (/^[A-Z_][A-Z0-9_]*$/.test(name)) {
          vars.push({
            name,
            value: value || null,
            hasValue: value.length > 0,
            file: filePath,
            line: i + 1,
          });
        }
      }
    }
  } catch {}
  return vars;
}

async function scanEnvVars(targetDir) {
  const files = walkFiles(targetDir);
  const allRefs = [];
  const envFileVars = [];

  for (const filePath of files) {
    const basename = path.basename(filePath).toLowerCase();

    if (basename.startsWith(".env")) {
      envFileVars.push(...parseEnvFile(filePath));
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const relativePath = path.relative(targetDir, filePath);
      const refs = extractEnvReferences(content, relativePath);
      allRefs.push(...refs);
    } catch {}
  }

  const varMap = new Map();

  for (const ref of allRefs) {
    if (!varMap.has(ref.name)) {
      const known = WELL_KNOWN_SERVICES[ref.name];
      varMap.set(ref.name, {
        name: ref.name,
        references: [],
        service: known?.service || null,
        required: known?.required ?? null,
        hasValue: false,
        value: null,
        valueSource: null,
        values: [],
      });
    }
    varMap.get(ref.name).references.push({ file: ref.file, line: ref.line });
  }

  for (const envVar of envFileVars) {
    const relFile = path.relative(targetDir, envVar.file);
    if (!varMap.has(envVar.name)) {
      const known = WELL_KNOWN_SERVICES[envVar.name];
      varMap.set(envVar.name, {
        name: envVar.name,
        references: [{ file: relFile, line: envVar.line }],
        service: known?.service || null,
        required: known?.required ?? null,
        hasValue: envVar.hasValue,
        value: envVar.value,
        valueSource: envVar.hasValue ? relFile : null,
        values: envVar.hasValue
          ? [{ value: envVar.value, source: relFile }]
          : [],
      });
    } else {
      const existing = varMap.get(envVar.name);
      existing.references.push({ file: relFile, line: envVar.line });
      if (envVar.hasValue) {
        existing.values.push({ value: envVar.value, source: relFile });
        if (!existing.hasValue) {
          existing.hasValue = true;
          existing.value = envVar.value;
          existing.valueSource = relFile;
        }
      }
    }
  }

  // Also check live process.env for any vars we found in code
  for (const [name, entry] of varMap) {
    const liveValue = process.env[name];
    if (liveValue !== undefined && liveValue.length > 0) {
      entry.values.push({ value: liveValue, source: "process.env (runtime)" });
      if (!entry.hasValue) {
        entry.hasValue = true;
        entry.value = liveValue;
        entry.valueSource = "process.env (runtime)";
      }
    }
  }

  const NODE_INTERNALS = new Set([
    "NODE_ENV", "PORT", "HOST", "HOSTNAME", "HOME", "PATH", "PWD",
    "LANG", "TERM", "SHELL", "USER", "TZ", "CI", "DEBUG",
    "VERCEL", "VERCEL_ENV", "VERCEL_URL",
  ]);

  const results = Array.from(varMap.values())
    .filter((v) => !NODE_INTERNALS.has(v.name))
    .sort((a, b) => {
      if (a.required && !b.required) return -1;
      if (!a.required && b.required) return 1;
      return a.name.localeCompare(b.name);
    });

  return results;
}

module.exports = { scanEnvVars };
