import ArtForm from '../models/ArtForm.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

export const getPendingArtForms = async (req, res) => {
  try {
    const pendingForms = await ArtForm.find({ isApproved: false });
    res.json(pendingForms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveArtForm = async (req, res) => {
  try {
    const artForm = await ArtForm.findByIdAndUpdate(
      req.params.id, 
      { isApproved: true, status: 'verified' }, 
      { returnDocument: 'after' }
    );
    
    if (!artForm) return res.status(404).json({ message: 'Art Form not found' });

    res.json({ message: 'Art Form approved successfully', artForm });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCommunityPost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post removed by administrator' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingArtists = async (req, res) => {
  try {
    const pending = await User.find({ role: 'artist', isVerifiedArtist: false }).select('-password');
    res.status(200).json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyArtist = async (req, res) => {
  try {
    const artist = await User.findByIdAndUpdate(
      req.params.id,
      { isVerifiedArtist: true },
      { returnDocument: 'after' } // <-- Replaced { new: true }
    ).select('-password');
    
    res.status(200).json({ message: 'Artist verified successfully.', artist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};