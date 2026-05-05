import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserAPIKeys, storeEncryptedAPIKey, deleteAPIKey } from '@/lib/queries'
import { encryptAPIKey } from '@/lib/api-key-encryption'
import { validateAPIKey } from '@/lib/ai-providers'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const keys = await getUserAPIKeys(user.id)
    // Return keys without the actual encrypted values (for security)
    return NextResponse.json({
      keys: keys.map((k) => ({
        id: k.id,
        provider: k.provider,
        enabled: k.enabled,
        created_at: k.created_at,
        last_used_at: k.last_used_at,
      })),
    })
  } catch (error) {
    console.error('[v0] Error fetching API keys:', error)
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { provider, apiKey } = await request.json()

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: 'Missing provider or apiKey' },
        { status: 400 }
      )
    }

    // Validate the API key works
    const isValid = await validateAPIKey(provider, apiKey)
    if (!isValid) {
      return NextResponse.json(
        { error: `Invalid API key for ${provider}. Please check your key and try again.` },
        { status: 400 }
      )
    }

    // Encrypt and store the key
    const encryptedKey = encryptAPIKey(apiKey, user.id)
    
    const stored = await storeEncryptedAPIKey(user.id, provider, encryptedKey)

    return NextResponse.json({
      success: true,
      key: {
        id: stored.id,
        provider: stored.provider,
        enabled: stored.enabled,
      },
    })
  } catch (error) {
    console.error('[v0] Error storing API key:', error)
    return NextResponse.json({ error: 'Failed to store API key' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')

    if (!provider) {
      return NextResponse.json({ error: 'Missing provider parameter' }, { status: 400 })
    }

    await deleteAPIKey(user.id, provider)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting API key:', error)
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
  }
}
