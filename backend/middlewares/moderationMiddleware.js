const BANNED_WORDS = ['abuse', 'spam', 'hate', 'fake', 'scam'];

export const moderateContent = (req, res, next) => {
  const { title, content } = req.body;
  const textToCheck = `${title || ''} ${content || ''}`.toLowerCase();

  const containsBanned = BANNED_WORDS.some(word => textToCheck.includes(word));

  if (containsBanned) {
    return res.status(400).json({
      message: 'Content contains inappropriate language or prohibited terms.'
    });
  }

  next();
};