import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  showId: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticketsBooked: { type: Number, required: true, min: 1 },
  totalPaid: { type: Number, required: true },
  patronContribution: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['completed', 'failed'], default: 'completed' }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);