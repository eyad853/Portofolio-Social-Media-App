import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',        // reference to User model
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,     // e.g., like Twitter, or increase as needed
    },
    media: [
        {
            url: String,         // file URL (image/video/file)
            type: {
                type: String,    // 'image', 'video', 'link', 'file'
                enum: ['image', 'video', 'link', 'file']
            },
            fileName: String,    // optional, e.g., for files: 'report.pdf'
            fileSize: Number     // optional, e.g., for files: 204800 (bytes)
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    },
});

const postModel = mongoose.model('post' , postSchema)

export default postModel 