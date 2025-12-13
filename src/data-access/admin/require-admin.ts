'use server';

import { auth } from '@/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function requireAdmin() {
  const headerStore = await headers();
  const session = await auth.api.getSession({
    headers: headerStore
  });

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/not-admin');
  }

  return session;
}
