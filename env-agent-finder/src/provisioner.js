const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const readline = require("readline");

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString("base64url").substring(0, length);
}

const AUTO_GENERATORS = {
  NEXTAUTH_SECRET: () => generateSecret(48),
  AUTH_SECRET: () => generateSecret(48),
  JWT_SECRET: () => generateSecret(48),
  NEXTAUTH_URL: () => "http://localhost:3000", // pragma: allowlist secret
  NEXT_PUBLIC_APP_URL: () => "http://localhost:3000", // pragma: allowlist secret
  APP_URL: () => "http://localhost:3000", // pragma: allowlist secret
  APP_SECRET: () => generateSecret(48),
  ENCRYPTION_KEY: () => generateSecret(32),
  SESSION_SECRET: () => generateSecret(48),
  COOKIE_SECRET: () => generateSecret(48),
  SECRET_KEY: () => generateSecret(48),
  API_SECRET: () => generateSecret(48),
};

const LOCAL_DB_GENERATORS = {
  DATABASE_URL: (ctx) => {
    if (ctx.services.has("PostgreSQL")) return "postgresql://postgres:postgres@localhost:5432/app_dev";
    if (ctx.services.has("MySQL")) return "mysql://root:root@localhost:3306/app_dev";
    if (ctx.services.has("MongoDB")) return "mongodb://localhost:27017/app_dev";
    return "postgresql://postgres:postgres@localhost:5432/app_dev";
  },
  POSTGRES_URL: () => "postgresql://postgres:postgres@localhost:5432/app_dev",
  PG_CONNECTION_STRING: () => "postgresql://postgres:postgres@localhost:5432/app_dev",
  MYSQL_URL: () => "mysql://root:root@localhost:3306/app_dev",
  MYSQL_HOST: () => "localhost",
  MYSQL_DATABASE: () => "app_dev",
  MONGODB_URI: () => "mongodb://localhost:27017/app_dev",
  MONGO_URL: () => "mongodb://localhost:27017/app_dev",
  REDIS_URL: () => "redis://localhost:6379",
};

const SERVICE_SIGNUP_INFO = {
  "Stripe": {
    vars: ["STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY", "STRIPE_WEBHOOK_SECRET"],
    signupUrl: "https://dashboard.stripe.com/register",
    keysUrl: "https://dashboard.stripe.com/apikeys",
    steps: [
      "1. Go to https://dashboard.stripe.com/register and create an account",
      "2. Go to https://dashboard.stripe.com/apikeys",
      "3. Copy your Publishable key → STRIPE_PUBLISHABLE_KEY",
      "4. Copy your Secret key → STRIPE_SECRET_KEY",
      "5. For webhooks: go to Developers > Webhooks > Add endpoint",
      "6. Copy the Signing secret → STRIPE_WEBHOOK_SECRET",
    ],
  },
  "OpenAI": {
    vars: ["OPENAI_API_KEY"],
    signupUrl: "https://platform.openai.com/signup",
    keysUrl: "https://platform.openai.com/api-keys",
    steps: [
      "1. Go to https://platform.openai.com/signup and create an account",
      "2. Go to https://platform.openai.com/api-keys",
      "3. Click 'Create new secret key'",
      "4. Copy the key → OPENAI_API_KEY",
    ],
  },
  "Anthropic": {
    vars: ["ANTHROPIC_API_KEY"],
    signupUrl: "https://console.anthropic.com/",
    keysUrl: "https://console.anthropic.com/settings/keys",
    steps: [
      "1. Go to https://console.anthropic.com/ and create an account",
      "2. Go to https://console.anthropic.com/settings/keys",
      "3. Click 'Create Key'",
      "4. Copy the key → ANTHROPIC_API_KEY",
    ],
  },
  "Clerk": {
    vars: ["CLERK_SECRET_KEY", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"],
    signupUrl: "https://dashboard.clerk.com/sign-up",
    keysUrl: "https://dashboard.clerk.com/ → your app → API Keys",
    steps: [
      "1. Go to https://dashboard.clerk.com/sign-up and create an account",
      "2. Create an application",
      "3. Go to API Keys in the sidebar",
      "4. Copy Publishable key → NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      "5. Copy Secret key → CLERK_SECRET_KEY",
    ],
  },
  "Stack Auth": {
    vars: ["STACK_PROJECT_ID", "STACK_PUBLISHED_CLIENT_KEY", "STACK_SECRET_SERVER_KEY"],
    signupUrl: "https://app.stack-auth.com/",
    keysUrl: "https://app.stack-auth.com/ → your project → Settings",
    steps: [
      "1. Go to https://app.stack-auth.com/ and create an account",
      "2. Create a project",
      "3. Go to project Settings → API Keys",
      "4. Copy Project ID → STACK_PROJECT_ID",
      "5. Copy Publishable Client Key → STACK_PUBLISHED_CLIENT_KEY",
      "6. Copy Secret Server Key → STACK_SECRET_SERVER_KEY",
    ],
  },
  "Supabase": {
    vars: ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    signupUrl: "https://supabase.com/dashboard",
    keysUrl: "https://supabase.com/dashboard → your project → Settings → API",
    steps: [
      "1. Go to https://supabase.com/dashboard and create an account",
      "2. Create a new project",
      "3. Go to Settings → API",
      "4. Copy Project URL → SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL",
      "5. Copy anon/public key → SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "6. Copy service_role key → SUPABASE_SERVICE_ROLE_KEY",
    ],
  },
  "Firebase": {
    vars: ["FIREBASE_API_KEY", "FIREBASE_PROJECT_ID", "FIREBASE_AUTH_DOMAIN", "FIREBASE_STORAGE_BUCKET"],
    signupUrl: "https://console.firebase.google.com/",
    keysUrl: "https://console.firebase.google.com/ → Project settings",
    steps: [
      "1. Go to https://console.firebase.google.com/ and create a project",
      "2. Go to Project settings (gear icon)",
      "3. Scroll to 'Your apps' → Add a web app",
      "4. Copy the config values into your env vars",
    ],
  },
  "Vercel Blob": {
    vars: ["BLOB_READ_WRITE_TOKEN"],
    signupUrl: "https://vercel.com/signup",
    keysUrl: "https://vercel.com/dashboard/stores",
    steps: [
      "1. Go to https://vercel.com/signup and create an account",
      "2. Go to Storage → Create a Blob Store",
      "3. Copy the BLOB_READ_WRITE_TOKEN from the store settings",
    ],
  },
  "AWS S3": {
    vars: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION", "S3_BUCKET"],
    signupUrl: "https://aws.amazon.com/",
    keysUrl: "https://console.aws.amazon.com/iam/home#/security_credentials",
    steps: [
      "1. Go to https://aws.amazon.com/ and create an account",
      "2. Go to IAM → Security credentials → Create access key",
      "3. Copy Access key ID → AWS_ACCESS_KEY_ID",
      "4. Copy Secret access key → AWS_SECRET_ACCESS_KEY",
      "5. Set AWS_REGION (e.g. us-east-1)",
      "6. Create an S3 bucket and set S3_BUCKET to its name",
    ],
  },
  "SendGrid": {
    vars: ["SENDGRID_API_KEY"],
    signupUrl: "https://signup.sendgrid.com/",
    keysUrl: "https://app.sendgrid.com/settings/api_keys",
    steps: [
      "1. Go to https://signup.sendgrid.com/ and create an account",
      "2. Go to Settings → API Keys → Create API Key",
      "3. Copy the key → SENDGRID_API_KEY",
    ],
  },
  "Resend": {
    vars: ["RESEND_API_KEY"],
    signupUrl: "https://resend.com/signup",
    keysUrl: "https://resend.com/api-keys",
    steps: [
      "1. Go to https://resend.com/signup and create an account",
      "2. Go to API Keys → Create API Key",
      "3. Copy the key → RESEND_API_KEY",
    ],
  },
  "Sentry": {
    vars: ["SENTRY_DSN", "SENTRY_AUTH_TOKEN"],
    signupUrl: "https://sentry.io/signup/",
    keysUrl: "https://sentry.io → your project → Settings → Client Keys (DSN)",
    steps: [
      "1. Go to https://sentry.io/signup/ and create an account",
      "2. Create a project for your platform",
      "3. Copy the DSN → SENTRY_DSN",
    ],
  },
  "Google OAuth": {
    vars: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    signupUrl: "https://console.cloud.google.com/",
    keysUrl: "https://console.cloud.google.com/apis/credentials",
    steps: [
      "1. Go to https://console.cloud.google.com/ and create a project",
      "2. Go to APIs & Services → Credentials → Create OAuth 2.0 Client",
      "3. Set authorized redirect URIs",
      "4. Copy Client ID → GOOGLE_CLIENT_ID",
      "5. Copy Client Secret → GOOGLE_CLIENT_SECRET",
    ],
  },
  "GitHub OAuth": {
    vars: ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
    signupUrl: "https://github.com/settings/developers",
    keysUrl: "https://github.com/settings/developers",
    steps: [
      "1. Go to https://github.com/settings/developers",
      "2. Click 'New OAuth App'",
      "3. Set the callback URL (e.g. http://localhost:PORT/api/auth/callback/github)", // pragma: allowlist secret
      "4. Copy Client ID → GITHUB_CLIENT_ID",
      "5. Copy Client Secret → GITHUB_CLIENT_SECRET",
    ],
  },
  "Twilio": {
    vars: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"],
    signupUrl: "https://www.twilio.com/try-twilio",
    keysUrl: "https://console.twilio.com/",
    steps: [
      "1. Go to https://www.twilio.com/try-twilio and create an account",
      "2. Your Account SID and Auth Token are on the Console dashboard",
      "3. Copy Account SID → TWILIO_ACCOUNT_SID",
      "4. Copy Auth Token → TWILIO_AUTH_TOKEN",
    ],
  },
  "Cloudinary": {
    vars: ["CLOUDINARY_URL", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "CLOUDINARY_CLOUD_NAME"],
    signupUrl: "https://cloudinary.com/users/register_free",
    keysUrl: "https://console.cloudinary.com/settings/api-keys",
    steps: [
      "1. Go to https://cloudinary.com/users/register_free and create an account",
      "2. Go to Settings → API Keys",
      "3. Copy your credentials into the env vars",
    ],
  },
  "Upstash Redis": {
    vars: ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
    signupUrl: "https://console.upstash.com/",
    keysUrl: "https://console.upstash.com/ → your database → REST API",
    steps: [
      "1. Go to https://console.upstash.com/ and create an account",
      "2. Create a Redis database",
      "3. Go to the REST API tab",
      "4. Copy URL → UPSTASH_REDIS_REST_URL",
      "5. Copy Token → UPSTASH_REDIS_REST_TOKEN",
    ],
  },
};

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stderr,
  });
}

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function provisionEnv(targetDir, scanReport, options = {}) {
  const { interactive = true, autoOnly = false } = options;
  const { envVars, services } = scanReport;

  const serviceNames = new Set(services.map((s) => s.name));
  const ctx = { services: serviceNames };

  const result = {
    generated: [],
    prompted: [],
    skipped: [],
    written: false,
    envFilePath: null,
  };

  const finalEnv = {};
  const existingValues = {};

  for (const v of envVars) {
    if (v.hasValue && v.value) {
      existingValues[v.name] = v.value;
    }
  }

  const allNeededVars = new Set();

  for (const v of envVars) {
    allNeededVars.add(v.name);
  }
  for (const svc of services) {
    for (const envVar of svc.requiredEnvVars || []) {
      allNeededVars.add(envVar);
    }
  }

  const NODE_INTERNALS = new Set([
    "NODE_ENV", "PORT", "HOST", "HOSTNAME", "HOME", "PATH", "PWD",
    "LANG", "TERM", "SHELL", "USER", "TZ", "CI", "DEBUG",
    "VERCEL", "VERCEL_ENV", "VERCEL_URL",
  ]);

  const varsToProvision = Array.from(allNeededVars).filter(
    (name) => !NODE_INTERNALS.has(name)
  );

  console.log("");
  console.log("═".repeat(60));
  console.log("  ENV AGENT FINDER — Setup Mode");
  console.log("═".repeat(60));
  console.log("");
  console.log(`  Found ${varsToProvision.length} environment variable(s) needed.`);
  console.log(`  Detected ${services.length} service(s): ${services.map((s) => s.name).join(", ") || "none"}`);
  console.log("");

  // Phase 1: Keep existing values
  for (const name of varsToProvision) {
    if (existingValues[name]) {
      finalEnv[name] = existingValues[name];
      result.generated.push({ name, value: existingValues[name], source: "existing" });
    }
  }

  // Phase 2: Auto-generate secrets and local DB URLs
  console.log("⚡ AUTO-GENERATING values...");
  console.log("─".repeat(40));

  for (const name of varsToProvision) {
    if (finalEnv[name]) continue;

    if (AUTO_GENERATORS[name]) {
      const value = AUTO_GENERATORS[name]();
      finalEnv[name] = value;
      result.generated.push({ name, value, source: "auto-generated" });
      console.log(`  ✅ ${name} = ${value.substring(0, 30)}${value.length > 30 ? "..." : ""}`);
    } else if (LOCAL_DB_GENERATORS[name]) {
      const value = LOCAL_DB_GENERATORS[name](ctx);
      finalEnv[name] = value;
      result.generated.push({ name, value, source: "local-dev-default" });
      console.log(`  ✅ ${name} = ${value}`);
    }
  }
  console.log("");

  // Phase 3: Interactive prompts for external services
  const remainingVars = varsToProvision.filter((name) => !finalEnv[name]);

  if (remainingVars.length > 0 && interactive && !autoOnly) {
    const serviceVarMap = new Map();

    for (const name of remainingVars) {
      let matched = false;
      for (const [serviceName, info] of Object.entries(SERVICE_SIGNUP_INFO)) {
        if (info.vars.includes(name)) {
          if (!serviceVarMap.has(serviceName)) {
            serviceVarMap.set(serviceName, { info, vars: [] });
          }
          serviceVarMap.get(serviceName).vars.push(name);
          matched = true;
          break;
        }
      }
      if (!matched) {
        if (!serviceVarMap.has("__unknown__")) {
          serviceVarMap.set("__unknown__", { info: null, vars: [] });
        }
        serviceVarMap.get("__unknown__").vars.push(name);
      }
    }

    const rl = createReadlineInterface();

    for (const [serviceName, { info, vars }] of serviceVarMap) {
      if (serviceName === "__unknown__") continue;

      console.log(`🔑 ${serviceName.toUpperCase()}`);
      console.log("─".repeat(40));
      if (info) {
        console.log("  How to get your keys:");
        for (const step of info.steps) {
          console.log(`  ${step}`);
        }
        console.log("");
      }

      for (const name of vars) {
        const answer = await ask(rl, `  Enter ${name} (or press Enter to skip): `);
        if (answer) {
          finalEnv[name] = answer;
          result.prompted.push({ name, source: serviceName });
          console.log(`  ✅ ${name} saved`);
        } else {
          result.skipped.push({ name, service: serviceName, signupUrl: info?.signupUrl });
          console.log(`  ⏭️  ${name} skipped`);
        }
      }
      console.log("");
    }

    const unknownEntry = serviceVarMap.get("__unknown__");
    if (unknownEntry && unknownEntry.vars.length > 0) {
      console.log("❓ OTHER VARIABLES");
      console.log("─".repeat(40));

      for (const name of unknownEntry.vars) {
        const answer = await ask(rl, `  Enter ${name} (or press Enter to skip): `);
        if (answer) {
          finalEnv[name] = answer;
          result.prompted.push({ name, source: "manual" });
          console.log(`  ✅ ${name} saved`);
        } else {
          result.skipped.push({ name, service: null, signupUrl: null });
          console.log(`  ⏭️  ${name} skipped`);
        }
      }
      console.log("");
    }

    rl.close();
  } else if (remainingVars.length > 0) {
    for (const name of remainingVars) {
      let serviceName = null;
      let signupUrl = null;
      for (const [svcName, info] of Object.entries(SERVICE_SIGNUP_INFO)) {
        if (info.vars.includes(name)) {
          serviceName = svcName;
          signupUrl = info.signupUrl;
          break;
        }
      }
      result.skipped.push({ name, service: serviceName, signupUrl });
    }
  }

  // Phase 4: Write .env.local
  const envFilePath = path.join(targetDir, ".env.local");
  const envLines = [];

  envLines.push("# Generated by env-agent-finder --setup");
  envLines.push(`# ${new Date().toISOString()}`);
  envLines.push("");

  const groupedByService = new Map();
  const varServiceMap = {};

  for (const svc of services) {
    for (const envVar of svc.requiredEnvVars || []) {
      varServiceMap[envVar] = svc.name;
    }
  }
  for (const [serviceName, info] of Object.entries(SERVICE_SIGNUP_INFO)) {
    for (const v of info.vars) {
      if (!varServiceMap[v]) varServiceMap[v] = serviceName;
    }
  }

  for (const name of varsToProvision) {
    const svc = varServiceMap[name] || "Other";
    if (!groupedByService.has(svc)) groupedByService.set(svc, []);
    groupedByService.get(svc).push(name);
  }

  for (const [service, vars] of groupedByService) {
    envLines.push(`# ${service}`);
    for (const name of vars) {
      const value = finalEnv[name] || "";
      envLines.push(`${name}=${value}`);
    }
    envLines.push("");
  }

  fs.writeFileSync(envFilePath, envLines.join("\n"), "utf-8");
  result.written = true;
  result.envFilePath = envFilePath;

  // Summary
  console.log("═".repeat(60));
  console.log("  SETUP COMPLETE");
  console.log("═".repeat(60));
  console.log("");
  console.log(`  📄 Written to: ${envFilePath}`);
  console.log("");

  const existingCount = result.generated.filter((g) => g.source === "existing").length;
  const autoCount = result.generated.filter((g) => g.source !== "existing").length;

  if (existingCount > 0) console.log(`  ♻️  ${existingCount} value(s) kept from existing .env`);
  if (autoCount > 0) console.log(`  ⚡ ${autoCount} value(s) auto-generated (secrets, DB URLs)`);
  if (result.prompted.length > 0) console.log(`  🔑 ${result.prompted.length} value(s) provided by you`);

  if (result.skipped.length > 0) {
    console.log(`  ⏭️  ${result.skipped.length} value(s) still need to be filled in:`);
    console.log("");
    for (const skip of result.skipped) {
      const where = skip.signupUrl ? ` → ${skip.signupUrl}` : "";
      console.log(`     ❌ ${skip.name}${skip.service ? ` (${skip.service})` : ""}${where}`);
    }
  } else {
    console.log("");
    console.log("  🎉 All environment variables are configured!");
  }

  console.log("");
  console.log("═".repeat(60));

  return result;
}

module.exports = { provisionEnv };
