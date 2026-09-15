import Show from '../models/Show.js';
import Review from '../models/Review.js';


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


export const createShow = async (req, res) => {
  try {
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

// 2. Fetch all reviews/comments for a show (Public)
export const getShowReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await Review.find({ showId: id }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const addShowReview = async (req, res) => {
  try {
    const { rating, comment, imageUrl } = req.body;
    const userId = req.user?._id || req.user?.id;
    const userName = req.user?.name || 'Anonymous';

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User authentication required.' });
    }

    if (!comment && !imageUrl) {
      return res.status(400).json({ message: 'Comment or image is required.' });
    }

    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({ message: 'Show not found.' });
    }

    const newReview = await Review.create({
      showId: req.params.id,
      userId,
      userName,
      rating: rating ? Number(rating) : undefined,
      comment: comment || '',
      imageUrl: imageUrl || ''
    });

    res.status(201).json({ message: 'Review added successfully.', review: newReview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleLikeReview = async (req, res) => {
  try {
    const { reviewId, replyId } = req.params; // replyId is optional if liking a top-level comment
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Comment not found' });

    if (!replyId) {
      // Liking top-level comment
      const index = review.likes.indexOf(userId);
      if (index > -1) {
        review.likes.splice(index, 1); // Unlike
      } else {
        review.likes.push(userId); // Like
      }
      await review.save();
      return res.status(200).json(review);
    } else {
    
      const toggleReplyLike = (replies) => {
        for (let rep of replies) {
          if (rep._id.toString() === replyId) {
            const rIndex = rep.likes.indexOf(userId);
            if (rIndex > -1) rep.likes.splice(rIndex, 1);
            else rep.likes.push(userId);
            return true;
          }
          if (rep.replies && rep.replies.length > 0) {
            if (toggleReplyLike(rep.replies)) return true;
          }
        }
        return false;
      };

      toggleReplyLike(review.replies);
      await review.save();
      return res.status(200).json(review);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addNestedReply = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment, imageUrl, parentReplyId } = req.body; // parentReplyId tells us where to nest it
    const userId = req.user._id;
    const userName = req.user.name;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const newReply = {
      userId,
      userName,
      comment,
      imageUrl: imageUrl || '',
      likes: [],
      replies: []
    };

    if (!parentReplyId) {
      review.replies.push(newReply);
    } else {
     
      const insertRecursive = (repliesList) => {
        for (let rep of repliesList) {
          if (rep._id.toString() === parentReplyId) {
            rep.replies.push(newReply);
            return true;
          }
          if (rep.replies && rep.replies.length > 0) {
            if (insertRecursive(rep.replies)) return true;
          }
        }
        return false;
      };
      insertRecursive(review.replies);
    }

    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};