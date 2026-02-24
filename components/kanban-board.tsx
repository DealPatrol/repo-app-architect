'use client';

import { useState } from 'react';
import { Plus, GripVertical, MoreVertical, Trash2, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string | null;
  due_date: string | null;
  order_index: number;
}

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => Promise<void>;
}

const STATUSES = [
  { value: 'todo', label: 'To Do', icon: AlertCircle },
  { value: 'in_progress', label: 'In Progress', icon: Clock },
  { value: 'in_review', label: 'In Review', icon: Zap },
  { value: 'done', label: 'Done', icon: CheckCircle },
] as const;

const PRIORITY_COLORS = {
  low: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  medium: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' },
  high: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
  urgent: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
};

export function KanbanBoard({ projectId, tasks, onTaskUpdate }: KanbanBoardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
  const [selectedColumn, setSelectedColumn] = useState('todo');

  const tasksByStatus = STATUSES.reduce(
    (acc, status) => {
      acc[status.value] = tasks.filter((t) => t.status === status.value);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: string) => {
    if (!draggedTask) return;

    if (onTaskUpdate) {
      await onTaskUpdate(draggedTask.id, { status: status as Task['status'] });
    }
    setDraggedTask(null);
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description || null,
          priority: newTask.priority,
        }),
      });

      if (response.ok) {
        setNewTask({ title: '', description: '', priority: 'medium' });
        setIsOpen(false);
        // Trigger refresh by calling onTaskUpdate or similar mechanism
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Task Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2 w-full md:w-auto">
            <Plus className="h-4 w-4" />
            Add New Task
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a new task to your project</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                placeholder="Enter task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="task-description">Description (Optional)</Label>
              <Input
                id="task-description"
                placeholder="Enter task description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="task-priority">Priority</Label>
              <select
                id="task-priority"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 min-h-96">
        {STATUSES.map((status) => {
          const StatusIcon = status.icon;
          const columnTasks = tasksByStatus[status.value] || [];

          return (
            <div
              key={status.value}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(status.value)}
              className="rounded-lg border border-border bg-card/50 p-4 space-y-3 min-h-96"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusIcon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground text-sm">{status.label}</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-2">
                {columnTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No tasks</p>
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const priorityColor = PRIORITY_COLORS[task.priority];
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task)}
                        className="rounded-lg border border-border bg-background p-3 space-y-2 cursor-move hover:shadow-md transition-all hover:border-primary/50"
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground break-words">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{task.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Priority Badge */}
                        <div className={`flex items-center gap-2 text-xs font-medium w-fit ${priorityColor.text}`}>
                          <div className={`h-2 w-2 rounded-full ${priorityColor.dot}`} />
                          <span className="capitalize">{task.priority}</span>
                        </div>

                        {/* Due Date */}
                        {task.due_date && (
                          <div className="text-xs text-muted-foreground">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
