import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from '@superfaceai/passport-twitter-oauth2';
import { authConfig } from '../auth.config';

@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {
  constructor() {
    super({
      clientType: 'confidential',
      authorizationURL: 'https://x.com/i/oauth2/authorize',
      clientID: authConfig().twitterClientID ?? '',
      clientSecret: authConfig().twitterClientSecret ?? '',
      callbackURL: authConfig().twitterCallbackURL ?? '',
      pkce: true,
      state: false,
      scope: ['tweet.read', 'users.read', 'offline.access'],
    });
  }

  async validate(token: string, tokenSecret: string, profile: any) {
    return {
      twitterId: profile.id,
      name: profile.displayName,
      email: profile.emails?.[0]?.value,
      provider: profile.provider,
    };
  }
}
