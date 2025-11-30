'use client';

import { ThemeToggle } from '@/libs/components/theme-toggle/theme-toggle';
import { buttonVariants } from '@/libs/components/ui/button';
import { authClient } from '@/libs/utils/auth-client';
import Image from 'next/image';
import Link from 'next/link';

import UserDropdown from '@/app/(public)/_components/user-dropdown';

const navigationItems = [
  { name: 'Home', href: '/' },
  { name: 'Courses', href: '/courses' },
  { name: 'Dashboard', href: '/dashboard' }
];

export default function Navbar() {
  const { data: session, isPending } = authClient.useSession();

  const renderAuthButtons = () => {
    if (isPending) return null;

    if (session)
      return <UserDropdown name={session.user.name} email={session.user.email} image={session.user.image ?? ''} />;

    return (
      <>
        <Link href="/login" className={buttonVariants({ variant: 'secondary' })}>
          Login
        </Link>

        <Link href="/login" className={buttonVariants({ variant: 'default' })}>
          Get Started
        </Link>
      </>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-[backdrop-filter]:bg-background/60">
      <div className="container flex min-h-16 items-center mx-auto px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 mr-8">
          <Image src="/icon.png" alt="Logo" width={40} height={40} className="size-9" />
          <span className="text-2xl font-bold">LMS</span>
        </Link>

        {/* Desktop Navigation Menu */}
        <nav className="hidden md:flex md:flex-1 md:items-center md:justify-between w-full">
          <div className="flex items-center space-x-2">
            {navigationItems.map((item) => (
              <Link
                href={item.href}
                key={item.name}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />

            {renderAuthButtons()}
          </div>
        </nav>
      </div>
    </header>
  );
}
