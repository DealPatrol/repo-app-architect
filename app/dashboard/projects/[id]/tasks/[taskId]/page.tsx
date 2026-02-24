import { getProjectById, getTaskById, getTaskComments } from '@/lib/queries';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { TaskComments } from '@/components/task-comments';

interface TaskDetailPageProps {
  params: Promise<{ id: string; taskId: string }>;
}

const PRIORITY_COLORS = {
  low: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
  high: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  urgent: 'text-red-600 bg-red-50 dark:bg-red-900/20',
};

const STATUS_COLORS = {
  todo: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20',
  in_progress: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  in_review: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  done: 'text-green-600 bg-green-50 dark:bg-green-900/20',
};

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id: projectId, taskId } = await params;

  const [project, task, comments] = await Promise.all([
    getProjectById(projectId),
    getTaskById(taskId),
    getTaskComments(taskId),
  ]);

  if (!project || !task) {
    notFound();
  }

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href={`/dashboard/projects/${projectId}/tasks`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tasks
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Header */}
          <div className="space-y-4 border-b border-border pb-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">{task.title}</h1>
              <p className="text-muted-foreground">{task.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[task.status]}`}>
                {task.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
                {task.priority.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Task Comments */}
          <TaskComments projectId={projectId} taskId={taskId} comments={comments} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="rounded-lg border border-border bg-card p-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Status</label>
            <select className="w-full mt-2 px-3 py-2 border border-border rounded-md bg-background text-foreground">
              <option value="todo">To Do</option>
              <option value="in_progress" selected={task.status === 'in_progress'}>
                In Progress
              </option>
              <option value="in_review" selected={task.status === 'in_review'}>
                In Review
              </option>
              <option value="done" selected={task.status === 'done'}>
                Done
              </option>
            </select>
          </div>

          {/* Priority */}
          <div className="rounded-lg border border-border bg-card p-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Priority</label>
            <select className="w-full mt-2 px-3 py-2 border border-border rounded-md bg-background text-foreground">
              <option value="low" selected={task.priority === 'low'}>
                Low
              </option>
              <option value="medium" selected={task.priority === 'medium'}>
                Medium
              </option>
              <option value="high" selected={task.priority === 'high'}>
                High
              </option>
              <option value="urgent" selected={task.priority === 'urgent'}>
                Urgent
              </option>
            </select>
          </div>

          {/* Assignee */}
          <div className="rounded-lg border border-border bg-card p-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Assignee</label>
            <div className="mt-2 flex items-center gap-2 p-2 border border-dashed border-border rounded">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Unassigned</span>
            </div>
          </div>

          {/* Due Date */}
          {task.due_date && (
            <div className="rounded-lg border border-border bg-card p-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Due Date</label>
              <div className="mt-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
