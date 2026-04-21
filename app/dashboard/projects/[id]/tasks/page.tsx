import { getProjectById, getTasksByProject } from '@/lib/queries';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { KanbanBoard } from '@/components/kanban-board';

interface TasksPageProps {
  params: Promise<{ id: string }>;
}

const DEMO_PROJECTS = {
  '1': { id: '1', name: 'Website Redesign' },
  '2': { id: '2', name: 'Mobile App' },
  '3': { id: '3', name: 'API Development' },
} as const

export default async function TasksPage({ params }: TasksPageProps) {
  const { id } = await params;
  let project = null
  let tasks = []

  try {
    ;[project, tasks] = await Promise.all([getProjectById(id), getTasksByProject(id)])
  } catch (error) {
    console.error('[v0] Database connection error - showing demo task board:', error)
    project = DEMO_PROJECTS[id as keyof typeof DEMO_PROJECTS] ?? null
  }

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Back button */}
      <Link href={`/dashboard/projects/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Project
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tasks - {project.name}</h1>
        <p className="text-muted-foreground">Manage your tasks using the Kanban board</p>
      </div>

      {/* Kanban Board */}
      <KanbanBoard projectId={id} tasks={tasks} />
    </div>
  );
}
