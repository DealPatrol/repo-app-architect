import { NextResponse } from "next/server";
import { getEnvStatus } from "@/lib/env";

/**
 * Health check for uptime monitoring and deployment verification.
 * Returns 200 when the app is reachable; body indicates service status.
 * Use in UptimeRobot, Better Uptime, Vercel Health Checks, etc.
 */
export async function GET() {
  const status = getEnvStatus();
  const ready = status.openai && status.auth;

  return NextResponse.json({
    status: ready ? "ok" : "degraded",
    services: {
      openai: status.openai,
      auth: status.auth,
      oauth: status.oauth,
      share: status.share,
    },
  });
}
