import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { name, email, password, preferences, role, artistProfile } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      artistProfile: role === 'artist' ? artistProfile : undefined,
      isVerifiedArtist: false, // Remains false until admin approves
      preferences: preferences || []
    });

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'tvarita_hackathon_secret_key_2026', 
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        isVerifiedArtist: user.isVerifiedArtist,
        preferences: user.preferences 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'tvarita_hackathon_secret_key_2026', 
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        isVerifiedArtist: user.isVerifiedArtist,
        preferences: user.preferences 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

   
    if (req.body.name) user.name = req.body.name;

    if (req.body.artistProfile) {
      const { teamName, teamDescription, members } = req.body.artistProfile;

      if (teamName !== undefined) user.artistProfile.teamName = teamName;
      if (teamDescription !== undefined) user.artistProfile.teamDescription = teamDescription;
      if (Array.isArray(members)) user.artistProfile.members = members;
    }

    const updatedUser = await user.save();


    const { password, ...userData } = updatedUser._doc;
    res.status(200).json({ message: 'Profile updated successfully', user: userData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};