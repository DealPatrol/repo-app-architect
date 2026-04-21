import { DashboardShell } from '@/components/dashboard-shell';
import { requireCurrentUser } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCurrentUser();

  return (
    <DashboardShell
      user={{
        displayName: user.displayName,
        primaryEmail: user.primaryEmail,
      }}
    >
      {children}
    </DashboardShell>
  );
}
