'use client';

import { useState } from 'react';
import { Plus, Search, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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

interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  visibility: 'private' | 'public';
  slug: string;
}

interface ProjectsPageProps {
  projects: Project[];
}

export function ProjectsList({ projects }: ProjectsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;

    try {
      // This will be connected to the API route
      // For now, just reset the form
      setNewProject({ name: '', description: '' });
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and collaborate with your team</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Add a new project to your workspace</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="Enter project name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Enter project description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
          <h3 className="text-base font-semibold text-foreground mb-1">
            {projects.length === 0 ? 'No projects yet' : 'No matching projects'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {projects.length === 0
              ? 'Create your first project to get started.'
              : 'Try adjusting your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="group relative rounded-lg border border-border bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all duration-200"
            >
              {/* Project Color Indicator */}
              <div className="absolute top-0 left-0 h-1 w-full rounded-t-lg" style={{ backgroundColor: project.color }} />

              <div className="flex items-start justify-between mb-4">
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: project.color }}
                >
                  {project.icon || project.name.charAt(0).toUpperCase()}
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              </div>

              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                {project.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {project.description || 'No description'}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {project.visibility === 'public' ? 'Public' : 'Private'}
                </span>
                <span className="text-xs text-muted-foreground">0 tasks</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
