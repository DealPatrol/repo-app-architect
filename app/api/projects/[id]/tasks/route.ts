import { createTask, markOnboardingStepCompleted } from '@/lib/queries';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    const { id: projectId } = await params;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, priority, due_date } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    const task = await createTask({
      project_id: projectId,
      title: title.trim(),
      description: description?.trim() || null,
      status: 'todo',
      priority: priority || 'medium',
      assigned_to: null,
      created_by: user.id,
      due_date: due_date || null,
      order_index: 0,
    });
    await markOnboardingStepCompleted(user.id, 'first_task_created');

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { status, taskId } = body

    // id in this route is the project id; task id must be provided explicitly.
    if (!taskId || typeof taskId !== 'string') {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
    }
    if (!status || typeof status !== 'string') {
      return NextResponse.json({ error: 'status is required' }, { status: 400 })
    }
    const updatedTask = await updateTask(taskId, status)

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
