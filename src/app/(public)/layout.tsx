import { ReactNode } from 'react';

import Navbar from '@/app/(public)/_components/navbar';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Navbar />

      <main className="container mx-auto px-4 md:px-6 lg:px-8">{children}</main>
    </div>
  );
}
