import { envConfig } from '@/config';
import { prisma } from '@/libs/utils/db';
import { resend } from '@/libs/utils/resend';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP } from 'better-auth/plugins';
import { admin } from 'better-auth/plugins';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  socialProviders: {
    github: {
      clientId: envConfig.GITHUB_CLIENT_ID,
      clientSecret: envConfig.GITHUB_CLIENT_SECRET
    }
  },
  plugins: [
    emailOTP({
      sendVerificationOTP: async ({ email, otp }) => {
        await resend.emails.send({
          from: 'LMS - <onboarding@resend.dev>',
          to: [email],
          subject: 'Verify your email',
          html: `<p>Your verification code is ${otp}</p>`
        });
      }
    }),
    admin()
  ]
});
