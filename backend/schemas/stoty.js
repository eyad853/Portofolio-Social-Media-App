import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mediaUrl: {
    type: String,
  },
  mediaType: {
    type: String,
    enum: ['image', 'video' , 'text'],
  },
  caption: {
    type: String,
    maxlength: 300
  },
  viewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Auto-delete after 24 hours (24 * 60 * 60)
  }
});

const Story = mongoose.model('Story'  , storySchema)
export default Story
