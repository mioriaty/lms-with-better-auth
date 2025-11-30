import { envConfig } from '@/config';
import { Resend } from 'resend';

export const resend = new Resend(envConfig.RESEND_API_KEY);
