import passport from 'passport';
import User from '../schemas/UserSchema.js';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from "dotenv"
import settingsModel from '../schemas/Settings.js';
dotenv.config()

passport.use("google" , new GoogleStrategy(
    {
        clientID:process.env.googleClientID,
        clientSecret:process.env.googleClientSecret,
        callbackURL:process.env.googleCallbackURL
    },
    async (accessToken , refreshToken , profile , done)=>{
       try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) return done(null, user);

        const newUser = new User({
            googleId: profile.id,
            firstname: profile.name?.givenName || '',
            lastname: profile.name?.familyName || '',
            email: profile.emails?.[0]?.value,
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

