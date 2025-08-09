import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // receiver
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // sender
    type: { type: String, enum: ['friend_request', 'friend_accepted' , 'friend_rejected', 'post', 'comment', 'like'] },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'post' }, // optional for post-related notifications
    message: { type: String },
    seen: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const notificationModel = mongoose.model("Notification", notificationSchema);
export default notificationModel;