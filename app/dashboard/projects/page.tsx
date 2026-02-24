import { getProjectsByOrganization } from '@/lib/queries';
import { getCurrentOrganizationId, requireCurrentUser } from '@/lib/auth';
import { ProjectsList } from '@/components/projects-list';

export default async function ProjectsPage() {
  const user = await requireCurrentUser();

  const orgId = getCurrentOrganizationId(user);
  const projects = orgId ? await getProjectsByOrganization(orgId) : [];

  return <ProjectsList projects={projects} />;
}
