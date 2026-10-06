import CommunityPost from '../models/Post.js';
import { getMediaType } from '../utils/media.js';

export const getPostsByArtForm = async (req, res) => {
  try {
    const posts = await CommunityPost.find({ 
      artFormId: req.params.artFormId, 
      status: { $in: ['published', null] }
    }).populate('userId', 'name bio profilePhotoUrl').sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const { artFormId, artFormNameSubmitted, title, content, imageUrl, mediaType } = req.body;
    
    const post = await CommunityPost.create({
      userId: req.user.id,
      artFormId: artFormId || null,
      artFormNameSubmitted: artFormNameSubmitted || null,
      title,
      content,
      imageUrl: imageUrl || '',
      mediaUrl: req.file?.path || req.file?.secure_url || '',
      mediaType: req.file
        ? getMediaType(req.file)
        : mediaType || '',
      mediaFileName: req.file?.originalname || '',
      status: artFormId ? 'published' : 'pending_verification'
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};