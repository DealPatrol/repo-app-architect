import 'server-only';

import { redirect } from 'next/navigation';
import { isStackAuthConfigured, stackServerApp } from '@/stack';

export async function getCurrentUser() {
  if (!isStackAuthConfigured) {
    return null;
  }

  return stackServerApp.getUser({ or: 'return-null' });
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  return user;
}

export function getCurrentOrganizationId(
  user: { selectedTeam: { id: string } | null } | null
) {
  return user?.selectedTeam?.id ?? null;
}
