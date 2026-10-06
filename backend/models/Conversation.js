import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  isGroup: { type: Boolean, default: false },
  name: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  lastActivityAt: { type: Date, default: Date.now }
}, { timestamps: true });

conversationSchema.index({ members: 1, lastActivityAt: -1 });

export default mongoose.model('Conversation', conversationSchema);
