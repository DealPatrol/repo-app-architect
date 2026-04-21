'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProfileSettingsFormProps {
  initialProfile: {
    display_name: string | null;
    company_name: string | null;
    job_title: string | null;
    timezone: string;
    billing_email: string | null;
  };
}

export function ProfileSettingsForm({ initialProfile }: ProfileSettingsFormProps) {
  const [form, setForm] = useState({
    display_name: initialProfile.display_name ?? '',
    company_name: initialProfile.company_name ?? '',
    job_title: initialProfile.job_title ?? '',
    timezone: initialProfile.timezone || 'UTC',
    billing_email: initialProfile.billing_email ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    setSaving(true);
    setStatusMessage(null);
    setStatusError(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || 'Failed to save profile');
      }

      setStatusMessage('Profile saved successfully.');
    } catch (error) {
      console.error('Failed to save profile:', error);
      setStatusError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">Profile details</h2>
        <p className="text-sm text-muted-foreground">
          Keep account information up to date for onboarding and billing.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="display_name">Display name</Label>
          <Input
            id="display_name"
            value={form.display_name}
            onChange={(e) => updateField('display_name', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="job_title">Job title</Label>
          <Input
            id="job_title"
            value={form.job_title}
            onChange={(e) => updateField('job_title', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_name">Company</Label>
          <Input
            id="company_name"
            value={form.company_name}
            onChange={(e) => updateField('company_name', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            value={form.timezone}
            onChange={(e) => updateField('timezone', e.target.value)}
            placeholder="UTC"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="billing_email">Billing email</Label>
        <Input
          id="billing_email"
          type="email"
          value={form.billing_email}
          onChange={(e) => updateField('billing_email', e.target.value)}
        />
      </div>

      {statusMessage && <p className="text-sm text-emerald-500">{statusMessage}</p>}
      {statusError && <p className="text-sm text-destructive">{statusError}</p>}

      <Button onClick={onSave} disabled={saving} className="gap-2">
        <Save className="h-4 w-4" />
        {saving ? 'Saving...' : 'Save profile'}
      </Button>
    </div>
  );
}
