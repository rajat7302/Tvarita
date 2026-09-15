import mongoose from 'mongoose';

const showSchema = new mongoose.Schema({
  artFormId: { type: mongoose.Schema.Types.ObjectId, ref: 'ArtForm', required: false },
  artFormName: { type: String, default: '' },
  artistTeamId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  venue: { type: String, required: true },
  date: { type: Date, required: true },
  ticketPrice: { type: Number, default: 0 },
  totalTickets: { type: Number, required: true },
  availableTickets: { type: Number, required: true },
  isSoldOut: { type: Boolean, default: false },
  imageUrl: { type: String, default: '' } 
}, { timestamps: true });

const Show = mongoose.models.Show || mongoose.model('Show', showSchema);
export default Show;