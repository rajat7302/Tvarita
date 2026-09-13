import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    artFormId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArtForm',
      required: true
    },
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artist'
    },
    venue: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    ticketPrice: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Show = mongoose.model('Show', showSchema);
export default Show;