import AuthService from '@/services/auth.service';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import {
  Strategy as GithubStrategy,
  Profile as GithubProfile,
} from 'passport-github2';
import { VerifyCallback } from 'passport-oauth2';
import { constants } from './constants';

passport.use(
  new GoogleStrategy(
    {
      clientID: constants.googleOAuth.client_id,
      clientSecret: constants.googleOAuth.client_secret,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { user, token } = await AuthService.oauthLogin(profile, 'GOOGLE');
        done(null, { user, token });
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  new GithubStrategy(
    {
      clientID: constants.githubOAuth.client_id,
      clientSecret: constants.githubOAuth.client_secret,
      callbackURL: '/auth/github/callback',
    },
    // TS doesn't infer types for Github Strategy callback
    async (
      accessToken: string,
      refreshToken: string,
      profile: GithubProfile,
      done: VerifyCallback
    ) => {
      try {
        const { user, token } = await AuthService.oauthLogin(profile, 'GITHUB');
        done(null, { user, token });
      } catch (error) {
        done(error);
      }
    }
  )
);
