import { getProjectsByOrganization } from '@/lib/queries'
import { ProjectsList } from '@/components/projects-list'

export default async function ProjectsPage() {
  let projects: Awaited<ReturnType<typeof getProjectsByOrganization>> = []

  try {
    // TODO: Replace with real org ID from auth when auth is integrated
    projects = await getProjectsByOrganization('demo-org')
  } catch {
    // Database may not be ready yet
  }

  return <ProjectsList projects={projects} />
}
