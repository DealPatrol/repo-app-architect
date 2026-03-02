import { getAllProjects } from '@/lib/queries'
import { ProjectsList } from '@/components/projects-list'

export default async function ProjectsPage() {
  let projects: any[] = []

  try {
    projects = await getAllProjects()
  } catch {
    // Database connection error - show empty state
    projects = []
  }

  return <ProjectsList projects={projects} />
}

