import { buttonVariants } from '@/libs/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center flex-col">
      <Link href="/" className={buttonVariants({ variant: 'outline', className: 'absolute top-4 left-4' })}>
        <ArrowLeftIcon className="size-4 mr-1" />
        Back
      </Link>

      <div className="flex w-full max-w-sm flex-col gap-6">{children}</div>
    </div>
  );
}
