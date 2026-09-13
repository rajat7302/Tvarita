import Experience from '../models/Experience.js';

export const getExperiencesByArtForm = async (req, res) => {
  try {
    const experiences = await Experience.find({ artFormId: req.params.artFormId })
      .populate('userId', 'name')
      .populate('artistId', 'name')
      .sort({ createdAt: -1 });
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExperiencesByArtist = async (req, res) => {
  try {
    const experiences = await Experience.find({ artistId: req.params.artistId })
      .populate('userId', 'name')
      .populate('artFormId', 'name')
      .sort({ createdAt: -1 });
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createExperience = async (req, res) => {
  try {
    const { artFormId, artistId, showId, content, imageUrl } = req.body;
    const experience = await Experience.create({
      userId: req.user.id,
      artFormId,
      artistId: artistId || null,
      showId: showId || null,
      content,
      imageUrl: imageUrl || ''
    });
    res.status(201).json(experience);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};