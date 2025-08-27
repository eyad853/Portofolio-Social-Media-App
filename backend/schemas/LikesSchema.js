import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const likeModel = mongoose.model('Like', likeSchema)

export default likeModel