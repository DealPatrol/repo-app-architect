"use client";

const mockUser = {
  id: "00000000-0000-0000-0000-000000000002",
  displayName: "Dev User",
  primaryEmail: "dev@taskflow.local",
  activeOrganizationId: "00000000-0000-0000-0000-000000000001",
};

function useUser() {
  return mockUser;
}

async function currentUser() {
  return mockUser;
}

module.exports = { useUser, currentUser };
