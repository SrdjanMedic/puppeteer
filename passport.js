const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Replace with your client ID and client secret
const GOOGLE_CLIENT_ID = "your-client-id";
const GOOGLE_CLIENT_SECRET = "your-client-secret";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // Handle the user profile data after successful authentication
      // You can save the user's information to a database or perform any other actions
      // In this example, we'll simply pass the user profile to the callback function
      return done(null, profile);
    }
  )
);

// Serialize the user profile
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize the user profile
passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
