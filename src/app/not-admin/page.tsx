import { buttonVariants } from '@/libs/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/libs/components/ui/card';
import { ArrowLeftIcon, ShieldX } from 'lucide-react';
import Link from 'next/link';

export default function NotAdminPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="bg-destructive/10 rounded-full p-4 w-fit mx-auto">
            <ShieldX className="size-16 text-destructive" />
          </div>

          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>Please contact the administrator to get access.</CardDescription>
        </CardHeader>

        <CardContent>
          <Link href="/" className={buttonVariants({ className: 'w-full' })}>
            <ArrowLeftIcon />
            Back to home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
