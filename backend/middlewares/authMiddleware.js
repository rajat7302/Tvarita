import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const verified = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'tvarita_hackathon_secret_key_2026'
    );
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Export alias so routes using 'protect' work without throwing errors
export const protect = verifyToken;

// Admin verification middleware required by adminRoutes.js
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

export const requireVerifiedArtist = (req, res, next) => {
  if (req.user.role !== 'artist') {
    return res.status(403).json({ message: 'Only artist accounts can post shows.' });
  }
  if (!req.user.isVerifiedArtist) {
    return res.status(403).json({ message: 'Your artist account is pending admin verification.' });
  }
  next();
};