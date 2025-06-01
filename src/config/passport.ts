import AuthService from '@/services/auth.service';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import {
  Strategy as GithubStrategy,
  Profile as GithubProfile,
} from 'passport-github2';
import { VerifyCallback } from 'passport-oauth2';
import { constants } from './constants';


/* 
  Người dùng truy cập /auth/google → redirect đến Google và đăng nhập
  Google redirect về /auth/google/callback?code=...
  Middleware: Passport dùng code để lấy access token + thông tin profile
  Sau khi lấy thành công, password gọi service với profile để lấy thông tin user và tạo jwt token
  Gán user và token vào req.user, tiếp tục đến controller OAuth callback để gán token và return về app
*/

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
        done(null, { ...user, token });
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
        done(null, { ...user, token });
      } catch (error) {
        done(error);
      }
    }
  )
);
