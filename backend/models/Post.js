import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    artFormId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArtForm',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Post = mongoose.model('Post', postSchema);
export default Post;