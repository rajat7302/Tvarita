import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['individual', 'group'],
      default: 'individual'
    },
    bio: {
      type: String,
      default: ''
    },
    artFormId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArtForm',
      required: true
    },
    images: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true
  }
);

const Artist = mongoose.model('Artist', artistSchema);
export default Artist;