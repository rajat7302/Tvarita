import mongoose from 'mongoose';

const contentReportSchema = new mongoose.Schema({
  targetType: { type: String, enum: ['communityComment', 'showReview'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reporterName: { type: String, default: 'User' },
  reason: { type: String, required: true, trim: true, maxlength: 500 },
  contentExcerpt: { type: String, default: '' },
  status: { type: String, enum: ['open', 'dismissed', 'hidden'], default: 'open' },
  reviewedAt: { type: Date, default: null }
}, { timestamps: true });

contentReportSchema.index({ targetType: 1, targetId: 1, reporterId: 1, status: 1 });

export default mongoose.model('ContentReport', contentReportSchema);
