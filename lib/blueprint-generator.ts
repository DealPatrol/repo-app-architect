import 'server-only';

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { type BlueprintComplexity } from '@/lib/queries';

type BlueprintInput = {
  sourceName: string;
  files: string[];
};

type BlueprintDraft = {
  name: string;
  description: string;
  app_type: string;
  complexity: BlueprintComplexity;
  reuse_percentage: number;
  technologies: string[];
  existing_files: { path: string; purpose: string }[];
  missing_files: { path: string; purpose: string }[];
  estimated_effort: string | null;
  ai_explanation: string | null;
};

const aiBlueprintSchema = z.object({
  blueprints: z
    .array(
      z.object({
        name: z.string().min(3),
        description: z.string().min(10),
        app_type: z.string().min(3),
        complexity: z.enum(['simple', 'moderate', 'complex']),
        reuse_percentage: z.number().min(5).max(95),
        technologies: z.array(z.string()).default([]),
        existing_files: z.array(
          z.object({
            path: z.string(),
            purpose: z.string(),
          })
        ),
        missing_files: z.array(
          z.object({
            path: z.string(),
            purpose: z.string(),
          })
        ),
        estimated_effort: z.string().nullable().optional(),
        ai_explanation: z.string().nullable().optional(),
      })
    )
    .min(1)
    .max(6),
});

const techMatchers: Array<{ tech: string; regex: RegExp }> = [
  { tech: 'Next.js', regex: /next\.config|app\/|pages\/|next\/|route\.ts$/i },
  { tech: 'React', regex: /\.tsx?$|react/i },
  { tech: 'TypeScript', regex: /\.ts$|tsconfig/i },
  { tech: 'Node.js', regex: /package\.json|api\/|server/i },
  { tech: 'PostgreSQL', regex: /sql|migration|schema|postgres|db/i },
  { tech: 'Tailwind CSS', regex: /tailwind|globals\.css|className/i },
  { tech: 'Stripe', regex: /stripe|billing|checkout|subscription/i },
];

function inferTechnologies(files: string[]) {
  const joined = files.join('\n');
  return techMatchers
    .filter(({ regex }) => regex.test(joined))
    .map(({ tech }) => tech);
}

function sampleReusableFiles(files: string[], maxCount: number) {
  return files.slice(0, maxCount).map((filePath) => ({
    path: filePath,
    purpose: 'Candidate reusable module from repository scan.',
  }));
}

function heuristicBlueprints({ sourceName, files }: BlueprintInput): BlueprintDraft[] {
  const technologies = inferTechnologies(files);
  const hasApi = files.some((f) => /\/api\/|route\.ts$/i.test(f));
  const hasDashboard = files.some((f) => /dashboard|admin|analytics/i.test(f));
  const hasPayments = files.some((f) => /billing|checkout|stripe|subscription/i.test(f));
  const hasAuth = files.some((f) => /auth|login|signup|session|user/i.test(f));

  const reusable = sampleReusableFiles(files, 8);

  const base: BlueprintDraft[] = [
    {
      name: `${sourceName} Ops Portal`,
      description:
        'Operational portal that centralizes dashboard metrics, workflow actions, and team-facing controls.',
      app_type: 'web-app',
      complexity: hasApi ? 'moderate' : 'simple',
      reuse_percentage: hasApi ? 72 : 60,
      technologies,
      existing_files: reusable,
      missing_files: [
        { path: 'app/dashboard/ops/page.tsx', purpose: 'Main operations cockpit page.' },
        { path: 'app/api/ops/route.ts', purpose: 'Aggregated API endpoint for ops data.' },
      ],
      estimated_effort: hasApi ? '2-4 days' : '1-2 days',
      ai_explanation:
        'Detected dashboard and API patterns indicate this repository can be extended into an ops-focused control surface.',
    },
  ];

  if (hasAuth || hasDashboard) {
    base.push({
      name: `${sourceName} Customer Workspace`,
      description:
        'Customer-facing workspace with profile management, role-aware sections, and guided onboarding paths.',
      app_type: 'saas-portal',
      complexity: 'moderate',
      reuse_percentage: hasAuth ? 78 : 64,
      technologies,
      existing_files: reusable,
      missing_files: [
        {
          path: 'app/dashboard/workspace/page.tsx',
          purpose: 'Customer workspace landing page.',
        },
        {
          path: 'app/api/workspace/summary/route.ts',
          purpose: 'Workspace summary API endpoint.',
        },
      ],
      estimated_effort: '3-5 days',
      ai_explanation:
        'Authentication and dashboard structures suggest a strong base for a customer workspace experience.',
    });
  }

  if (hasPayments || hasApi) {
    base.push({
      name: `${sourceName} Monetization Engine`,
      description:
        'Subscription and usage monetization module with pricing controls and entitlement-aware APIs.',
      app_type: 'backend-service',
      complexity: hasPayments ? 'moderate' : 'complex',
      reuse_percentage: hasPayments ? 70 : 52,
      technologies,
      existing_files: reusable,
      missing_files: [
        {
          path: 'app/api/entitlements/route.ts',
          purpose: 'Compute feature access based on plan and usage.',
        },
        {
          path: 'app/dashboard/pricing/page.tsx',
          purpose: 'Pricing and upgrade presentation page.',
        },
      ],
      estimated_effort: '4-7 days',
      ai_explanation:
        'Billing/API patterns indicate this codebase can support a dedicated monetization and entitlement layer.',
    });
  }

  return base.slice(0, 6);
}

async function aiBlueprints({
  sourceName,
  files,
}: BlueprintInput): Promise<BlueprintDraft[] | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const model =
      process.env.ANTHROPIC_ANALYSIS_MODEL ?? 'claude-3-5-sonnet-20241022';
    const client = new Anthropic({ apiKey });
    const fileSummary = files.map((path) => `- ${path}`).join('\n').slice(0, 12000);

    const response = await client.messages.create({
      model,
      max_tokens: 1400,
      messages: [
        {
          role: 'user',
          content: `Analyze this repository index from "${sourceName}" and propose up to 6 app blueprints.

Repository files:
${fileSummary}

Return strict JSON with shape:
{
  "blueprints": [
    {
      "name": "string",
      "description": "string",
      "app_type": "web-app|saas-portal|backend-service|automation-tool|mobile-app",
      "complexity": "simple|moderate|complex",
      "reuse_percentage": number,
      "technologies": ["string"],
      "existing_files": [{"path":"string","purpose":"string"}],
      "missing_files": [{"path":"string","purpose":"string"}],
      "estimated_effort": "string or null",
      "ai_explanation": "string or null"
    }
  ]
}`,
        },
      ],
    });

    const text = response.content
      .filter((part): part is Extract<(typeof response.content)[number], { type: 'text' }> => part.type === 'text')
      .map((part) => part.text)
      .join('\n')
      .trim();

    if (!text) return null;

    const parsedJson = JSON.parse(text);
    const parsed = aiBlueprintSchema.safeParse(parsedJson);
    if (!parsed.success) return null;

    return parsed.data.blueprints.map((bp) => ({
      ...bp,
      estimated_effort: bp.estimated_effort ?? null,
      ai_explanation: bp.ai_explanation ?? null,
    }));
  } catch (error) {
    console.warn('AI blueprint generation failed, using heuristic fallback.', error);
    return null;
  }
}

export async function generateBlueprints(input: BlueprintInput): Promise<BlueprintDraft[]> {
  const normalizedFiles = input.files
    .map((file) => file.trim())
    .filter(Boolean)
    .slice(0, 300);

  if (normalizedFiles.length === 0) {
    return [];
  }

  const ai = await aiBlueprints({
    sourceName: input.sourceName,
    files: normalizedFiles,
  });
  if (ai && ai.length > 0) {
    return ai;
  }

  return heuristicBlueprints({
    sourceName: input.sourceName,
    files: normalizedFiles,
  });
}
