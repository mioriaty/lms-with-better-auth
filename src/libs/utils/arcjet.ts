import 'server-only';

import { envConfig } from '@/config';
import arcjet, { detectBot, fixedWindow, protectSignup, sensitiveInfo, shield, slidingWindow } from '@arcjet/next';

export { detectBot, fixedWindow, protectSignup, sensitiveInfo, shield, slidingWindow };

export default arcjet({
  key: envConfig.ARCJET_KEY,
  // fingerprint is a unique identifier for the user's device
  characteristics: ['fingerprint'],

  // define base rules here, can also be empty if you don't want to use any rules
  rules: [
    shield({
      mode: 'LIVE'
    })
  ]
});
