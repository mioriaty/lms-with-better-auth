import { auth } from '@/auth';
import { ThemeToggle } from '@/libs/components/theme-toggle/theme-toggle';
import { Button } from '@/libs/components/ui/button';
import { headers } from 'next/headers';

const HomePage = async () => {
  const session = await auth.api.getSession({
    headers: headers()
  });

  return (
    <main className="p-24">
      <ThemeToggle />

      {session ? <div>Logged in {session.user.name}</div> : <Button>Logged out</Button>}
    </main>
  );
};

export default HomePage;
