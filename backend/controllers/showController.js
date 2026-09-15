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
    // 💡 Extract User ID safely from req.user
    const artistTeamId = req.user?._id || req.user?.id || req.user?.userId;

    if (!artistTeamId) {
      return res.status(401).json({ message: 'Unauthorized: User authentication required.' });
    }

    const { 
      artFormId, 
      artFormName, 
      title, 
      description, 
      venue, 
      date, 
      ticketPrice, 
      totalTickets, 
      availableTickets,
      imageUrl,
      bannerUrl
    } = req.body;

    const ticketCount = Number(totalTickets || availableTickets) || 100;
    const finalImageUrl = imageUrl || bannerUrl || '';

    const newShow = await Show.create({
      artistTeamId,
      artFormId: artFormId || null,
      artFormName: artFormName || '',
      title,
      description: description || '',
      venue,
      date,
      ticketPrice: Number(ticketPrice) || 0,
      totalTickets: ticketCount,
      availableTickets: ticketCount,
      imageUrl: finalImageUrl
    });

    res.status(201).json({ success: true, data: newShow });
  } catch (error) {
    console.error('Error creating show:', error);
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