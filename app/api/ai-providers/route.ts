import { NextResponse } from 'next/server'
import { AI_PROVIDERS, getAvailableProviders } from '@/lib/ai-providers'

export async function GET() {
  const available = getAvailableProviders()
  const providers = AI_PROVIDERS.map((p) => ({
    ...p,
    available: available.includes(p.id),
  }))
  return NextResponse.json(providers)
}
