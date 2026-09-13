import Artist from '../models/Artist.js';

export const getArtistById = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).populate('artFormId');
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    res.json(artist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getArtistsByArtForm = async (req, res) => {
  try {
    const artists = await Artist.find({ artFormId: req.params.artFormId });
    res.json(artists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};