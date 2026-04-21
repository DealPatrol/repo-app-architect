interface User {
  id: string;
  displayName: string;
  primaryEmail: string;
  activeOrganizationId: string;
}

export function useUser(): User;
export function currentUser(): Promise<User>;
