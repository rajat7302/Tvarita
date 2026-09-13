import ArtForm from '../models/ArtForm.js';
import Post from '../models/Post.js';

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
      { isApproved: true }, 
      { new: true }
    );
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