const fs = require("fs");
const path = require("path");

const SERVICE_SIGNATURES = [
  {
    name: "PostgreSQL",
    category: "database",
    indicators: {
      packages: ["pg", "@neondatabase/serverless", "postgres", "knex", "prisma", "drizzle-orm", "typeorm", "sequelize"],
      envVars: ["DATABASE_URL", "POSTGRES_URL", "PG_CONNECTION_STRING", "PGHOST"],
      files: ["prisma/schema.prisma", "drizzle.config.ts", "drizzle.config.js"],
    },
    docs: "https://www.postgresql.org/docs/",
  },
  {
    name: "MySQL",
    category: "database",
    indicators: {
      packages: ["mysql2", "mysql"],
      envVars: ["MYSQL_URL", "MYSQL_HOST", "MYSQL_DATABASE"],
    },
    docs: "https://dev.mysql.com/doc/",
  },
  {
    name: "MongoDB",
    category: "database",
    indicators: {
      packages: ["mongodb", "mongoose"],
      envVars: ["MONGODB_URI", "MONGO_URL"],
    },
    docs: "https://www.mongodb.com/docs/",
  },
  {
    name: "Redis",
    category: "cache",
    indicators: {
      packages: ["redis", "ioredis", "@upstash/redis"],
      envVars: ["REDIS_URL", "UPSTASH_REDIS_REST_URL"],
    },
    docs: "https://redis.io/docs/",
  },
  {
    name: "Supabase",
    category: "baas",
    indicators: {
      packages: ["@supabase/supabase-js", "@supabase/ssr"],
      envVars: ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
    },
    docs: "https://supabase.com/docs",
  },
  {
    name: "Firebase",
    category: "baas",
    indicators: {
      packages: ["firebase", "firebase-admin"],
      envVars: ["FIREBASE_API_KEY", "FIREBASE_PROJECT_ID"],
      files: ["firebase.json", ".firebaserc"],
    },
    docs: "https://firebase.google.com/docs",
  },
  {
    name: "Stripe",
    category: "payments",
    indicators: {
      packages: ["stripe", "@stripe/stripe-js"],
      envVars: ["STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY"],
    },
    docs: "https://stripe.com/docs",
  },
  {
    name: "Auth.js / NextAuth",
    category: "auth",
    indicators: {
      packages: ["next-auth", "@auth/core"],
      envVars: ["NEXTAUTH_SECRET", "AUTH_SECRET", "NEXTAUTH_URL"],
    },
    docs: "https://authjs.dev/",
  },
  {
    name: "Clerk",
    category: "auth",
    indicators: {
      packages: ["@clerk/nextjs", "@clerk/clerk-sdk-node"],
      envVars: ["CLERK_SECRET_KEY", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"],
    },
    docs: "https://clerk.com/docs",
  },
  {
    name: "Stack Auth",
    category: "auth",
    indicators: {
      packages: ["@stackframe/stack", "@stack-auth/nextjs"],
      envVars: ["STACK_PROJECT_ID", "STACK_SECRET_SERVER_KEY"],
    },
    docs: "https://docs.stack-auth.com/",
  },
  {
    name: "Vercel Blob",
    category: "storage",
    indicators: {
      packages: ["@vercel/blob"],
      envVars: ["BLOB_READ_WRITE_TOKEN"],
    },
    docs: "https://vercel.com/docs/storage/vercel-blob",
  },
  {
    name: "AWS S3",
    category: "storage",
    indicators: {
      packages: ["@aws-sdk/client-s3", "aws-sdk"],
      envVars: ["AWS_ACCESS_KEY_ID", "S3_BUCKET"],
    },
    docs: "https://docs.aws.amazon.com/s3/",
  },
  {
    name: "Cloudinary",
    category: "storage",
    indicators: {
      packages: ["cloudinary"],
      envVars: ["CLOUDINARY_URL", "CLOUDINARY_API_KEY"],
    },
    docs: "https://cloudinary.com/documentation",
  },
  {
    name: "OpenAI",
    category: "ai",
    indicators: {
      packages: ["openai", "@langchain/openai"],
      envVars: ["OPENAI_API_KEY"],
    },
    docs: "https://platform.openai.com/docs",
  },
  {
    name: "Anthropic",
    category: "ai",
    indicators: {
      packages: ["@anthropic-ai/sdk"],
      envVars: ["ANTHROPIC_API_KEY"],
    },
    docs: "https://docs.anthropic.com/",
  },
  {
    name: "SendGrid",
    category: "email",
    indicators: {
      packages: ["@sendgrid/mail"],
      envVars: ["SENDGRID_API_KEY"],
    },
    docs: "https://docs.sendgrid.com/",
  },
  {
    name: "Resend",
    category: "email",
    indicators: {
      packages: ["resend"],
      envVars: ["RESEND_API_KEY"],
    },
    docs: "https://resend.com/docs",
  },
  {
    name: "Sentry",
    category: "monitoring",
    indicators: {
      packages: ["@sentry/nextjs", "@sentry/node", "@sentry/browser"],
      envVars: ["SENTRY_DSN"],
    },
    docs: "https://docs.sentry.io/",
  },
  {
    name: "Twilio",
    category: "messaging",
    indicators: {
      packages: ["twilio"],
      envVars: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"],
    },
    docs: "https://www.twilio.com/docs",
  },
  {
    name: "Vercel Analytics",
    category: "analytics",
    indicators: {
      packages: ["@vercel/analytics"],
      envVars: [],
    },
    docs: "https://vercel.com/docs/analytics",
  },
  {
    name: "Docker",
    category: "infrastructure",
    indicators: {
      packages: [],
      envVars: [],
      files: ["Dockerfile", "docker-compose.yml", "docker-compose.yaml", ".dockerignore"],
    },
    docs: "https://docs.docker.com/",
  },
];

async function scanServices(targetDir, envVars) {
  const detectedServices = [];

  let packageDeps = new Set();
  const pkgPath = path.join(targetDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
        ...pkg.peerDependencies,
      };
      packageDeps = new Set(Object.keys(allDeps));
    } catch {}
  }

  const reqPath = path.join(targetDir, "requirements.txt");
  if (fs.existsSync(reqPath)) {
    try {
      const content = fs.readFileSync(reqPath, "utf-8");
      content.split("\n").forEach((line) => {
        const pkg = line.trim().split(/[>=<!\[]/)[0].trim();
        if (pkg) packageDeps.add(pkg);
      });
    } catch {}
  }

  const envVarNames = new Set(envVars.map((v) => v.name));

  for (const sig of SERVICE_SIGNATURES) {
    const matchedPackages = sig.indicators.packages?.filter((p) =>
      packageDeps.has(p)
    ) || [];
    const matchedEnvVars = sig.indicators.envVars?.filter((v) =>
      envVarNames.has(v)
    ) || [];
    const matchedFiles = sig.indicators.files?.filter((f) =>
      fs.existsSync(path.join(targetDir, f))
    ) || [];

    const confidence =
      matchedPackages.length * 40 +
      matchedEnvVars.length * 30 +
      matchedFiles.length * 30;

    if (confidence > 0) {
      detectedServices.push({
        name: sig.name,
        category: sig.category,
        confidence: Math.min(confidence, 100),
        matchedPackages,
        matchedEnvVars,
        matchedFiles,
        docs: sig.docs,
        requiredEnvVars: sig.indicators.envVars || [],
      });
    }
  }

  return detectedServices.sort((a, b) => b.confidence - a.confidence);
}

module.exports = { scanServices };
