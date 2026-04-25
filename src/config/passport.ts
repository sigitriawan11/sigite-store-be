import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.AUTH_CLIENT_ID!,
      clientSecret: process.env.AUTH_CLIENT_SECRET!,
      callbackURL: "/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {

      try {
        const user = {
          provider_user_id: profile.id,
          provider: profile.provider,
          name: profile.displayName,
          email: profile.emails?.[0]?.value || "",
          raw: profile._json,
          access_token: accessToken,
          refresh_token: refreshToken
        };

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

export default passport;