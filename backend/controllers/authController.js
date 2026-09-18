import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Resend } from 'resend';
import { OAuth2Client } from 'google-auth-library';

const PASSWORD_MIN_LENGTH = 8;
const googleClient = new OAuth2Client();

const isStrongPassword = (password) => (
  typeof password === 'string'
  && password.length >= PASSWORD_MIN_LENGTH
  && /[a-z]/.test(password)
  && /[A-Z]/.test(password)
  && /\d/.test(password)
);

const passwordPolicyMessage = 'Use at least 8 characters, including an uppercase letter, lowercase letter, and number.';

const createResetUrl = (token) => {
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  return `${clientUrl}/reset-password?token=${encodeURIComponent(token)}`;
};

export const register = async (req, res) => {
  try {
    const { name, email, password, preferences, role, artistProfile } = req.body;
    // Roles supplied by an unauthenticated client must never grant admin access.
    // Admin promotion is restricted to the protected admin workflow.
    const registrationRole = role === 'artist' ? 'artist' : 'user';
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: passwordPolicyMessage });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: registrationRole,
      artistProfile: registrationRole === 'artist' ? artistProfile : undefined,
      isVerifiedArtist: false, // Remains false until admin approves
      preferences: preferences || []
    });

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'tvarita_hackathon_secret_key_2026', 
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        artistProfile: user.artistProfile,
        isVerifiedArtist: user.isVerifiedArtist,
        preferences: user.preferences 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'tvarita_hackathon_secret_key_2026', 
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        artistProfile: user.artistProfile,
        isVerifiedArtist: user.isVerifiedArtist,
        preferences: user.preferences 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

   
    if (req.body.name) user.name = req.body.name;

    if (req.body.artistProfile) {
      if (user.role !== 'artist' && user.role !== 'admin') {
        return res.status(403).json({ message: 'Only artist accounts can manage group members.' });
      }

      const { teamName, teamDescription, members } = req.body.artistProfile;

      if (!user.artistProfile) {
        user.artistProfile = {
          teamName: '',
          teamDescription: '',
          members: []
        };
      }

      if (teamName !== undefined) user.artistProfile.teamName = teamName;
      if (teamDescription !== undefined) user.artistProfile.teamDescription = teamDescription;
      if (Array.isArray(members)) user.artistProfile.members = members;
    }

    const updatedUser = await user.save();


    const { password, ...userData } = updatedUser._doc;
    res.status(200).json({ message: 'Profile updated successfully', user: userData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginWithGoogle = async (req, res) => {
  try {
    const credential = String(req.body.credential || '');
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!credential) return res.status(400).json({ message: 'Google credential is required.' });
    if (!googleClientId) return res.status(503).json({ message: 'Google sign-in is not configured yet.' });

    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: googleClientId });
    const payload = ticket.getPayload();
    const email = payload?.email?.toLowerCase();
    if (!email || !payload.email_verified) {
      return res.status(401).json({ message: 'Google could not verify this email address.' });
    }

    // This endpoint deliberately never creates an account. Google login is for
    // people who have already registered with this exact email address.
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(403).json({ message: 'No Tvarita account exists for this Google email. Please register first.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'tvarita_hackathon_secret_key_2026',
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: {
        id: user._id, name: user.name, email: user.email, role: user.role,
        artistProfile: user.artistProfile, isVerifiedArtist: user.isVerifiedArtist,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Google sign-in failed:', error.message);
    res.status(401).json({ message: 'Google sign-in could not be verified. Please try again.' });
  }
};

export const requestPasswordReset = async (req, res) => {
  const genericMessage = 'If an account exists for this email, a password-reset link has been sent.';

  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email address is required.' });

    const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires');
    if (!user) return res.status(200).json({ message: genericMessage });

    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
      console.error('Password reset email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.');
      return res.status(503).json({ message: 'Password reset is temporarily unavailable. Please try again later.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    const resend = new Resend(process.env.RESEND_API_KEY);
    const resetUrl = createResetUrl(resetToken);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: user.email,
      subject: 'Reset your Tvarita password',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#292524">
          <h1 style="color:#E65100">Reset your password</h1>
          <p>We received a request to reset the password for your Tvarita account.</p>
          <p><a href="${resetUrl}" style="display:inline-block;background:#E65100;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Reset password</a></p>
          <p>This link expires in 30 minutes and can be used once. If you did not request it, you can safely ignore this email.</p>
        </div>`
    });

    if (error) throw new Error(error.message || 'Resend rejected the email request.');

    res.status(200).json({ message: genericMessage });
  } catch (error) {
    console.error('Password reset request failed:', error.message);
    res.status(500).json({ message: 'Unable to send the reset email. Please try again later.' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const token = String(req.body.token || '');
    const password = req.body.password;

    if (!token) return res.status(400).json({ message: 'Reset token is required.' });
    if (!isStrongPassword(password)) return res.status(400).json({ message: passwordPolicyMessage });

    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: new Date() }
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) return res.status(400).json({ message: 'This reset link is invalid or has expired.' });

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password updated. You can now sign in.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to reset password. Please try again later.' });
  }
};
