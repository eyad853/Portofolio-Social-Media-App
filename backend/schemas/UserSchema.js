import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    username: String,
    email: { 
        type: String, 
        unique: true 
        },
    password: String, // only for local users

    googleId: String, // only for Google users
    githubId: String, // only for GitHub users

    avatar: String,
    coverPhoto:{ type: String, default: "" },
    bio:{ type: String, default: "" },
    socialLinks: {
        X: { type: String, default: "" },
        instagram: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        facebook: { type: String, default: "" },
        youtube: { type: String, default: "" },
        website: { type: String, default: "" },
    },
    friends: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
],
}, { timestamps: true });

userSchema.pre("save", function (next) {
    if (!this.username || this.username==='' && this.firstname && this.lastname) {
        this.username = `${this.firstname} ${this.lastname}`;
    }
    next();
});

const User = mongoose.model("User", userSchema);

export default User;