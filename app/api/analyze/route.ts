import { NextRequest, NextResponse } from 'next/server'
import { scanCrossPlatformCode } from '@/lib/cross-platform-scanner'
import { discoverApps } from '@/lib/app-discovery'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Starting cross-platform analysis...')

    // Scan code from all connected platforms
    const scannedFiles = await scanCrossPlatformCode()
    console.log(`[v0] Scanned ${scannedFiles.length} files`)

    if (scannedFiles.length === 0) {
      return NextResponse.json({ error: 'No code files found to analyze' }, { status: 400 })
    }

    // Use AI to discover buildable apps
    const discoveredApps = await discoverApps(scannedFiles)
    console.log(`[v0] Discovered ${discoveredApps.length} apps`)

    return NextResponse.json({
      success: true,
      filesScanned: scannedFiles.length,
      appsDiscovered: discoveredApps.length,
      apps: discoveredApps,
      files: scannedFiles,
    })
  } catch (error) {
    console.error('[v0] Analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}
