import Show from '../models/Show.js';

// Get all upcoming shows
export const getShows = async (req, res) => {
  try {
    const shows = await Show.find()
      .populate('artistTeamId', 'name email')
      .sort({ date: 1 });
    res.status(200).json(shows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new show
export const createShow = async (req, res) => {
  try {
    const { artFormId, artFormName, title, description, venue, date, ticketPrice, totalTickets } = req.body;

    const newShow = new Show({
      artFormId: artFormId || null,
      artFormName: artFormName || '',
      artistTeamId: req.user?._id || req.user?.id,
      title,
      description,
      venue,
      date,
      ticketPrice: Number(ticketPrice) || 0,
      totalTickets: Number(totalTickets) || 0,
      availableTickets: Number(totalTickets) || 0
    });

    await newShow.save();
    res.status(201).json({ message: 'Show created successfully.', show: newShow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Book show tickets
export const bookShowTickets = async (req, res) => {
  try {
    const { ticketsCount = 1 } = req.body;
    const show = await Show.findById(req.params.id);

    if (!show) {
      return res.status(404).json({ message: 'Show not found.' });
    }

    if (show.availableTickets < ticketsCount) {
      return res.status(400).json({ message: 'Not enough tickets available.' });
    }

    show.availableTickets -= ticketsCount;
    if (show.availableTickets === 0) {
      show.isSoldOut = true;
    }

    await show.save();
    res.status(200).json({ message: 'Tickets booked successfully.', show });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add show review
export const addShowReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const show = await Show.findById(req.params.id);

    if (!show) {
      return res.status(404).json({ message: 'Show not found.' });
    }

    if (!show.reviews) {
      show.reviews = [];
    }

    show.reviews.push({
      userId: req.user?._id || req.user?.id,
      rating,
      comment,
      createdAt: new Date()
    });

    await show.save();
    res.status(200).json({ message: 'Review added successfully.', show });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};