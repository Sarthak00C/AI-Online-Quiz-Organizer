import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config();


// =======================
// AUTHENTICATE TOKEN
// =======================
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    // No token
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Secret must exist
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not set');
    }

    // Verify token
    const decoded = jwt.verify(token, secret);

    // Fetch user from DB
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();

  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};


// =======================
// ROLE AUTHORIZATION
// =======================
export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};


// =======================
// GENERATE TOKEN
// =======================
export const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;

  // Never allow fallback secret
  if (!secret) {
    throw new Error('JWT_SECRET not set');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    { id: userId },
    secret,
    { expiresIn }
  );
};