import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema(
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
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artist',
      default: null
    },
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      default: null
    },
    content: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      default: ''
    },
    mediaUrl: {
      type: String,
      default: ''
    },
    mediaType: {
      type: String,
      enum: ['image', 'video', 'audio', ''],
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Experience = mongoose.model('Experience', experienceSchema);
export default Experience;