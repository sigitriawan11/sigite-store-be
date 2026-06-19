import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const googleClientId = process.env.AUTH_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID;
const googleClientSecret =
  process.env.AUTH_CLIENT_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error(
    "Google OAuth env is missing. Set AUTH_CLIENT_ID/AUTH_CLIENT_SECRET (or GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET)."
  );
}

const callbackURL =
  process.env.AUTH_CALLBACK_URL ??
  (process.env.URL_BE
    ? `${process.env.URL_BE.replace(/\/$/, "")}/v1/auth/google/callback`
    : "/v1/auth/google/callback");

passport.use(
  new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL,
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