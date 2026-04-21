const mockUser = {
  id: "demo-user-id",
  displayName: "Demo User",
  primaryEmail: "demo@taskflow.dev",
  activeOrganizationId: "demo-org-id",
};

function useUser() {
  return mockUser;
}

async function currentUser() {
  return mockUser;
}

module.exports = { useUser, currentUser };
