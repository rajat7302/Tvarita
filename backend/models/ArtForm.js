import mongoose from 'mongoose';

const artFormSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Art form name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Dance', 'Music', 'Theatre', 'Painting', 'Craft'],
        message: '{VALUE} is not a supported category',
      },
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    region: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    historicalContext: {
      type: String,
      default: '',
    },
    isUnderrepresented: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
   
    images: {
      type: [String],
      default: [],
    },
    artists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ArtForm = mongoose.model('ArtForm', artFormSchema);
export default ArtForm;