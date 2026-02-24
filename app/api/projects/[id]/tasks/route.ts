import { createTask, updateTask } from '@/lib/queries'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // TODO: Replace with real auth when auth is integrated
    const userId = 'demo-user'
    const { id: projectId } = await params

    const body = await request.json()
    const { title, description, priority, due_date } = body

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 })
    }

    const task = await createTask({
      project_id: projectId,
      title: title.trim(),
      description: description?.trim() || null,
      status: 'todo',
      priority: priority || 'medium',
      assigned_to: null,
      created_by: userId,
      due_date: due_date || null,
      order_index: 0,
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params

    const body = await request.json()
    const { status } = body
    const updatedTask = await updateTask(taskId, status)

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
