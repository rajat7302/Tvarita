import mongoose from 'mongoose';

const artFormSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ['Dance', 'Music', 'Theatre', 'Painting', 'Craft']
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    region: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      required: true
    },
    historicalContext: {
      type: String,
      default: ''
    },
    isUnderrepresented: {
      type: Boolean,
      default: true
    },
    isApproved: {
      type: Boolean,
      default: true
    },
    images: [
      {
        type: String
      }
    ],
    artists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist'
      }
    ]
  },
  {
    timestamps: true
  }
);

const ArtForm = mongoose.model('ArtForm', artFormSchema);
export default ArtForm;