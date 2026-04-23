import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getTaskById, updateTask } from '@/lib/queries';

const updatableFields = new Set([
  'title',
  'description',
  'status',
  'priority',
  'assigned_to',
  'due_date',
  'order_index',
]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId, taskId } = await params;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingTask = await getTaskById(taskId);
    if (!existingTask || existingTask.project_id !== projectId) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const updates = Object.fromEntries(
      Object.entries(body).filter(([key]) => updatableFields.has(key))
    );

    const updatedTask = await updateTask(
      taskId,
      updates as Parameters<typeof updateTask>[1]
    );
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
