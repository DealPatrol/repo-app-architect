interface StackUser {
  id: string;
  displayName: string;
  primaryEmail: string;
  activeOrganizationId: string;
}

export function useUser(): StackUser;
export function currentUser(): Promise<StackUser>;
