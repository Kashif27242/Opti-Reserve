import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import UserRepository from "#repositories/UserRepository.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                const googleId = profile.id;

                // 1. Check if user exists by email
                let user = await UserRepository.findByEmail(email);

                if (user) {
                    // If user exists but no googleId, update it
                    if (!user.googleId) {
                        user = await UserRepository.updateGoogleId(user.id, googleId);
                    }
                    return done(null, user);
                }

                // 2. If user doesn't exist, create one
                const randomPassword = Math.random().toString(36).slice(-8);
                const hashedPassword = await bcrypt.hash(randomPassword, 10);

                const newUser = await UserRepository.create({
                    name: profile.displayName,
                    email: email,
                    password: hashedPassword,
                    googleId: googleId,
                    dob: new Date(), // Default DOB as it's required
                    role: "FACULTY",
                    approved: false,
                });

                return done(null, newUser);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

// Serialize user into the sessions
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserRepository.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport;
