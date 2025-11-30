'use client';

import { Button } from '@/libs/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/libs/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/libs/components/ui/input-otp';
import { authClient } from '@/libs/utils/auth-client';
import { Loader, MailIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

export default function VerifyRequestPage() {
  const [otp, setOtp] = useState('');
  const [emailPending, startEmailPending] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const isOtpCompleted = otp.length === 6;

  const handleVerifyEmail = () => {
    if (!email) {
      toast.error('Email is required');
      return;
    }

    startEmailPending(async () => {
      await authClient.signIn.emailOtp({
        email,
        otp,
        fetchOptions: {
          onSuccess: () => {
            toast.success('Email verified successfully');
            router.push('/');
          },
          onError: (error) => {
            toast.error(error.error.message);
          }
        }
      });
    });
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Verify your email</CardTitle>
        <CardDescription>
          We've sent a verification code to your email. Please enter it below to verify your email.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-col items-center gap-2">
          <InputOTP textAlign="center" maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>

            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <p className="text-sm text-muted-foreground">Enter the code sent to your email</p>
        </div>
        <Button disabled={emailPending || !isOtpCompleted} onClick={handleVerifyEmail} className="w-full">
          {emailPending ? <Loader className="size-4 mr-1 animate-spin" /> : <MailIcon className="size-4 mr-1" />}
          Verify
        </Button>
      </CardContent>
    </Card>
  );
}
