import { getProjectsByOrganization } from '@/lib/queries';
import { currentUser } from '@stack-auth/nextjs';
import { ProjectsList } from '@/components/projects-list';

export default async function ProjectsPage() {
  const user = await currentUser();
  if (!user) return null;

  const orgId = user.activeOrganizationId;
  const projects = orgId ? await getProjectsByOrganization(orgId) : [];

  return <ProjectsList projects={projects} />;
}
