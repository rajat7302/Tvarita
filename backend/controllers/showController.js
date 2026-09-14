import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

// Create a Show (Verified Artists Only)
export const createShow = async (req, res) => {
  try {
    const { artFormId, title, description, venue, date, ticketPrice, totalTickets } = req.body;
    
    const newShow = new Show({
      artFormId,
      artistTeamId: req.user.id,
      title,
      description,
      venue,
      date,
      ticketPrice,
      totalTickets,
      availableTickets: totalTickets
    });

    await newShow.save();
    res.status(201).json({ message: 'Show created successfully.', show: newShow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Book Tickets (Registered Users / Artists)
export const bookShowTickets = async (req, res) => {
  try {
    const { ticketsBooked, patronContribution = 0 } = req.body;
    const show = await Show.findById(req.params.id);

    if (!show) return res.status(404).json({ message: 'Show not found.' });
    if (show.isSoldOut || show.availableTickets < ticketsBooked) {
      return res.status(400).json({ message: 'Not enough tickets available or show is sold out.' });
    }

    // Deduct ticket count
    show.availableTickets -= ticketsBooked;
    if (show.availableTickets === 0) {
      show.isSoldOut = true;
    }
    await show.save();

    const totalPaid = (ticketsBooked * show.ticketPrice) + Number(patronContribution);

    const booking = new Booking({
      showId: show._id,
      userId: req.user.id,
      ticketsBooked,
      totalPaid,
      patronContribution
    });

    await booking.save();
    res.status(200).json({ message: 'Booking successful!', booking, show });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Review / Comment on a Show
export const addShowReview = async (req, res) => {
  try {
    const { rating, comment, userName } = req.body;
    const review = new Review({
      showId: req.params.id,
      userId: req.user.id,
      userName: userName || req.user.name,
      rating,
      comment
    });

    await review.save();
    res.status(201).json({ message: 'Review posted successfully.', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};