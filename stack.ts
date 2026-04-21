import 'server-only';

import { StackServerApp } from '@stackframe/stack';

const stackProjectId =
  process.env.NEXT_PUBLIC_STACK_PROJECT_ID ??
  process.env.STACK_PROJECT_ID ??
  null;

const stackPublishableClientKey =
  process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY ??
  process.env.STACK_PUBLISHED_CLIENT_KEY ??
  process.env.STACK_PUBLISHABLE_CLIENT_KEY ??
  null;

const stackSecretServerKey = process.env.STACK_SECRET_SERVER_KEY ?? null;

// Keep auth routes functional in build/test environments where secrets may be missing.
const fallbackProjectId = '123e4567-e89b-12d3-a456-426614174000';
const fallbackPublishableKey =
  'pck_test_0000000000000000000000000000000000000000';
const fallbackSecretKey =
  'ssk_test_0000000000000000000000000000000000000000';

export const isStackAuthConfigured = Boolean(
  stackProjectId && stackPublishableClientKey && stackSecretServerKey
);

if (!isStackAuthConfigured) {
  console.warn(
    'Stack Auth is not fully configured. Set NEXT_PUBLIC_STACK_PROJECT_ID, NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY, and STACK_SECRET_SERVER_KEY.'
  );
}

export const stackServerApp = new StackServerApp({
  tokenStore: 'nextjs-cookie',
  projectId: stackProjectId ?? fallbackProjectId,
  publishableClientKey: stackPublishableClientKey ?? fallbackPublishableKey,
  secretServerKey: stackSecretServerKey ?? fallbackSecretKey,
  urls: {
    afterSignIn: '/dashboard',
    afterSignUp: '/dashboard',
    afterSignOut: '/',
  },
});
