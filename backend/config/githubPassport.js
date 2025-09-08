import dotenv from "dotenv"
dotenv.config()
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../schemas/UserSchema.js';
import settingsModel from '../schemas/Settings.js';

passport.use( new GitHubStrategy(
    {
        clientID:process.env.githubClientID,
        clientSecret:process.env.githubClientSecret,
        callbackURL:process.env.githubCallbackURL
    },
    async (accessToken , refreshToken , profile , done)=>{
        try {
        let user = await User.findOne({ githubId: profile.id });

        if (user) return done(null, user);

        const newUser = new User({
            githubId: profile.id,
            username: profile.username,
            email:profile.emails?.[0]?.value ||`noemail-${profile.id}-${Date.now()}@github.local`,
            avatar: profile.photos?.[0]?.value || null,
        });

        await newUser.save();

        const newSettings = new settingsModel({
          user:newUser._id
        })

        await newSettings.save()

        return done(null, newUser); // ✅ Moved here
      } catch (error) {
        return done(error);
      }
    }))