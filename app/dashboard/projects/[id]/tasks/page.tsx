import { getProjectById, getTasksByProject } from '@/lib/queries';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { KanbanBoard } from '@/components/kanban-board';

interface TasksPageProps {
  params: Promise<{ id: string }>;
}

export default async function TasksPage({ params }: TasksPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  const tasks = await getTasksByProject(id);

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
