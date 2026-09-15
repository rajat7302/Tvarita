import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  comment: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs who liked this reply
}, { timestamps: true });

// Allow recursive nesting for replies inside replies
replySchema.add({
  replies: [replySchema]
});

const reviewSchema = new mongoose.Schema({
  showId: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  comment: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs who liked this top-level comment
  replies: [replySchema] // Nested child replies
}, { timestamps: true });

// Virtual field to support your "Most Popular" sort filter easily
reviewSchema.virtual('popularityScore').get(function() {
  let score = this.likes.length;
  // Recursively count replies and their likes if needed
  const countReplies = (repList) => {
    let subScore = 0;
    for (let r of repList) {
      subScore += 1 + r.likes.length;
      if (r.replies && r.replies.length > 0) {
        subScore += countReplies(r.replies);
      }
    }
    return subScore;
  };
  if (this.replies && this.replies.length > 0) {
    score += countReplies(this.replies);
  }
  return score;
});

export default mongoose.model('Review', reviewSchema);