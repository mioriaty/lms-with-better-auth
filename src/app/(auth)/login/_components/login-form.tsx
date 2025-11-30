'use client';

import { Button } from '@/libs/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/libs/components/ui/card';
import { Input } from '@/libs/components/ui/input';
import { Label } from '@/libs/components/ui/label';
import { authClient } from '@/libs/utils/auth-client';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { Loader, MailIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

export const LoginForm = () => {
  const [githubPending, startGithubSignInTransition] = useTransition();
  const [emailPending, startEmailSignInTransition] = useTransition();

  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSignInWithGithub = () => {
    startGithubSignInTransition(async () => {
      await authClient.signIn.social({
        provider: 'github',
        callbackURL: '/',
        fetchOptions: {
          onSuccess: () => {
            toast.success('You are now logged in');
          },
          onError: (error) => {
            toast.error(error.error.message);
          }
        }
      });
    });
  };

  const handleSignInWithEmail = () => {
    startEmailSignInTransition(async () => {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
        fetchOptions: {
          onSuccess: () => {
            toast.success('Verification email sent');
            router.push(`/verify-request?email=${email}`);
            setEmail('');
          },
          onError: (error) => {
            toast.error(error.error.message);
          }
        }
      });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome back!</CardTitle>
        <CardDescription>Please enter your details.</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        <Button disabled={githubPending} className="w-full" variant="outline" onClick={handleSignInWithGithub}>
          {githubPending ? <Loader className="size-4 mr-1 animate-spin" /> : <GitHubLogoIcon className="size-4 mr-1" />}
          Sign in with Github
        </Button>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button disabled={emailPending} onClick={handleSignInWithEmail}>
            {emailPending ? <Loader className="size-4 mr-1 animate-spin" /> : <MailIcon className="size-4 mr-1" />}
            Continue with Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
