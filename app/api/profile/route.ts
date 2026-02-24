import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserProfile, upsertUserProfile } from '@/lib/queries';

function cleanNullableString(value: unknown, maxLength = 255) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getUserProfile(user.id);
    if (profile) {
      return NextResponse.json(profile);
    }

    const created = await upsertUserProfile(user.id, {
      display_name: user.displayName ?? null,
      billing_email: user.primaryEmail ?? null,
      timezone: 'UTC',
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;

    const timezone =
      typeof body.timezone === 'string' && body.timezone.trim().length > 0
        ? body.timezone.trim().slice(0, 100)
        : 'UTC';

    const profile = await upsertUserProfile(user.id, {
      display_name: cleanNullableString(body.display_name, 255),
      company_name: cleanNullableString(body.company_name, 255),
      job_title: cleanNullableString(body.job_title, 255),
      billing_email: cleanNullableString(body.billing_email, 255),
      timezone,
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
