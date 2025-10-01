import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';

export const authConfig = registerAs('guard', () => ({
  jwtSecret: process.env.JWT_SECRET,
  apiKey: process.env.API_KEY,
  twitterClientID: process.env.TWITTER_CLIENT_ID,
  twitterClientSecret: process.env.TWITTER_CLIENT_SECRET,
  twitterCallbackURL: process.env.TWITTER_CALLBACK_URL,
  cookieDomain: process.env.COOKIE_DOMAIN,
  frontendUrl: process.env.FRONTEND_URL,
  isEnableRegister: process.env.ENABLE_REGISTER !== "false", 
}));

export type AuthConfig = ConfigType<typeof authConfig>;
export const InjectGuardConfig = () => Inject(authConfig.KEY);
