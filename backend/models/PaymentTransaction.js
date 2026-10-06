import mongoose from 'mongoose';

const paymentTransactionSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  paymentId: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  purpose: { type: String, enum: ['ticket', 'donation'], required: true },
  showId: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', default: null },
  ticketsCount: { type: Number, default: 0 },
  amountPaise: { type: Number, required: true },
  status: { type: String, enum: ['created', 'verifying', 'completed', 'failed', 'expired', 'refunded'], default: 'created' },
  expiresAt: { type: Date, required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null }
}, { timestamps: true });

paymentTransactionSchema.index({ paymentId: 1 }, { unique: true, sparse: true });

export default mongoose.model('PaymentTransaction', paymentTransactionSchema);
