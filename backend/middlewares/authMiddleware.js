import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('FATAL: JWT_SECRET environment variable is missing.');
    return res.status(500).json({ message: 'Internal server security configuration error.' });
  }

  try {
    const verified = jwt.verify(token, jwtSecret);

    const userId = verified.id || verified._id || verified.userId;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User non-existent or account removed.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }
};


export const protect = verifyToken;


export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};


export const requireVerifiedArtist = (req, res, next) => {
  if (!req.user || (req.user.role !== 'artist' && req.user.role !== 'admin')) {
    return res.status(403).json({ message: 'Only artist accounts can post shows.' });
  }
  if (req.user.role === 'artist' && !req.user.isVerifiedArtist) {
    return res.status(403).json({ message: 'Your artist account is pending admin verification.' });
  }
  next();
};