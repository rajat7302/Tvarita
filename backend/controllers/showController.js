import Show from '../models/Show.js';

export const getShowsByArtForm = async (req, res) => {
  try {
    const shows = await Show.find({ artFormId: req.params.artFormId })
      .populate('artistId', 'name type images')
      .sort({ date: 1 });
    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('artFormId')
      .populate('artistId');
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }
    res.json(show);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { showId, tickets } = req.body;
    res.status(201).json({
      success: true,
      message: `Successfully booked ${tickets} ticket(s) for the show!`,
      bookingId: `TVR-${Math.floor(100000 + Math.random() * 900000)}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};