import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  profilePhotoUrl: { type: String, default: '' },
  bio: { type: String, trim: true, maxlength: 500, default: '' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  role: { 
    type: String, 
    enum: ['user', 'artist', 'admin'], 
    default: 'user' 
  },
  isVerifiedArtist: { 
    type: Boolean, 
    default: false 
  },
  artistVerificationStatus: {
    type: String,
    enum: ['none', 'pending', 'verified', 'rejected'],
    default: 'none'
  },
  artistVerificationRejectionReason: { type: String, default: '' },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  artistProfile: {
    teamName: { type: String, default: '' },
    teamDescription: { type: String, default: '' },
    members: [{
      memberName: { type: String, default: '' },
      roleInTeam: { type: String, default: '' }
    }]
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
