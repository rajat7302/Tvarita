import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  comment: { type: String, required: true, trim: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: []
}, { timestamps: true });

replySchema.add({ replies: [replySchema] });

const communityCommentSchema = new mongoose.Schema({
  targetType: { type: String, enum: ['post', 'experience'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  comment: { type: String, required: true, trim: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [replySchema]
}, { timestamps: true });

communityCommentSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export default mongoose.model('CommunityComment', communityCommentSchema);
