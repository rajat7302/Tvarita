import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const verified = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'tvarita_hackathon_secret_key_2026'
    );

    // 💡 Fetch full user document from MongoDB (excluding password)
    const userId = verified.id || verified._id || verified.userId;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User non-existent or account removed.' });
    }

    req.user = user; // 👈 Now req.user._id and req.user.role are guaranteed!
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token.' });
  }
};

// Export alias so routes using 'protect' work seamlessly
export const protect = verifyToken;

// Admin verification middleware
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Artist verification middleware
export const requireVerifiedArtist = (req, res, next) => {
  if (!req.user || (req.user.role !== 'artist' && req.user.role !== 'admin')) {
    return res.status(403).json({ message: 'Only artist accounts can post shows.' });
  }
  if (req.user.role === 'artist' && !req.user.isVerifiedArtist) {
    return res.status(403).json({ message: 'Your artist account is pending admin verification.' });
  }
  next();
};