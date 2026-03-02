import { NextRequest, NextResponse } from 'next/server'
import { deleteRepository, getRepositoryById } from '@/lib/queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const repository = await getRepositoryById(id)
    
    if (!repository) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 })
    }
    
    return NextResponse.json(repository)
  } catch (error) {
    console.error('Error fetching repository:', error)
    return NextResponse.json({ error: 'Failed to fetch repository' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteRepository(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting repository:', error)
    return NextResponse.json({ error: 'Failed to delete repository' }, { status: 500 })
  }
}
