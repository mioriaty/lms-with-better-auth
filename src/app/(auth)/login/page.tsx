import { auth } from '@/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { LoginForm } from '@/app/(auth)/login/_components/login-form';

export default async function LoginPage() {
  const headerStore = await headers();
  const session = await auth.api.getSession({
    headers: headerStore
  });

  if (session) {
    return redirect('/');
  }

  return <LoginForm />;
}
