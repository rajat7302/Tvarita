import ArtForm from '../models/ArtForm.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

export const getPendingArtForms = async (req, res) => {
  try {
    const pendingForms = await ArtForm.find({ isApproved: false, isRejected: { $ne: true } }).sort({ createdAt: 1 });
    res.json(pendingForms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveArtForm = async (req, res) => {
  try {
    const artForm = await ArtForm.findOneAndUpdate(
      { _id: req.params.id, isApproved: false, isRejected: { $ne: true } },
      { isApproved: true, isRejected: false, rejectionReason: '' },
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
    
    const pending = await User.find({
      isVerifiedArtist: false,
      'artistProfile.teamName': { $type: 'string', $ne: '' },
      artistVerificationStatus: { $nin: ['rejected', 'verified'] }
    }).select('-password');

    res.status(200).json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyArtist = async (req, res) => {
  try {
    const artist = await User.findOneAndUpdate(
      { _id: req.params.id, isVerifiedArtist: false, 'artistProfile.teamName': { $type: 'string', $ne: '' }, artistVerificationStatus: { $nin: ['rejected', 'verified'] } },
      { isVerifiedArtist: true, artistVerificationStatus: 'verified', artistVerificationRejectionReason: '' },
      { new: true }
    ).select('-password');

    if (!artist) {
      return res.status(404).json({ message: 'Artist record not found' });
    }
    
    res.status(200).json({ message: 'Artist verified successfully.', artist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const rejectArtForm = async (req, res) => {
  try {
    const rejectionReason = String(req.body.reason || '').trim();
    const artForm = await ArtForm.findOneAndUpdate(
      { _id: req.params.id, isApproved: false },
      { isRejected: true, rejectionReason },
      { new: true, runValidators: true }
    );

    if (!artForm) return res.status(404).json({ message: 'Pending art form proposal not found.' });
    res.json({ message: 'Art form proposal rejected.', artForm });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const rejectArtist = async (req, res) => {
  try {
    const reason = String(req.body.reason || '').trim();
    const artist = await User.findOneAndUpdate(
      { _id: req.params.id, isVerifiedArtist: false, 'artistProfile.teamName': { $type: 'string', $ne: '' }, artistVerificationStatus: { $nin: ['rejected', 'verified'] } },
      { artistVerificationStatus: 'rejected', artistVerificationRejectionReason: reason },
      { new: true }
    ).select('-password');
    if (!artist) return res.status(404).json({ message: 'Pending artist application not found.' });
    res.json({ message: 'Artist application rejected.', artist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};