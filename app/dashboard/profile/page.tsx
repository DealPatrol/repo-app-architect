import { ProfileSettingsForm } from '@/components/profile-settings-form';
import { getUserProfile } from '@/lib/queries';
import { requireCurrentUser } from '@/lib/auth';

export default async function ProfilePage() {
  const user = await requireCurrentUser();
  const profile = await getUserProfile(user.id);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Update your identity and billing contact details.
        </p>
      </div>

      <ProfileSettingsForm
        initialProfile={{
          display_name: profile?.display_name ?? user.displayName ?? null,
          company_name: profile?.company_name ?? null,
          job_title: profile?.job_title ?? null,
          timezone: profile?.timezone ?? 'UTC',
          billing_email: profile?.billing_email ?? user.primaryEmail ?? null,
        }}
      />
    </div>
  );
}
