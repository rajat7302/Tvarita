import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'artist', 'admin'], 
    default: 'user' 
  },
  isVerifiedArtist: { 
    type: Boolean, 
    default: false 
  },
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