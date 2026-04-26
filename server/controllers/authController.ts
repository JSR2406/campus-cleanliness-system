import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { User } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const safeUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar_url: user.avatar_url ?? null,
  bio: user.bio ?? null,
  phone: user.phone ?? null,
});

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student'
    });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, user: safeUser(user) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: safeUser(user) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    let user = await User.findOne({ where: { email } });
    if (!user) {
      const placeholder = await bcrypt.hash(Math.random().toString(36), 10);
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: placeholder,
        role: 'student'
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: safeUser(user) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/profile — fetch own profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    // Guest user — return mock profile
    if (req.user!.id === 999) {
      return res.json({
        id: 999, name: 'Guest User', email: 'guest@campusclean.edu',
        role: 'student', avatar_url: null, bio: 'Exploring the Campus Clean platform.', phone: null,
      });
    }
    const user = await User.findByPk(req.user!.id, {
      attributes: ['id', 'name', 'email', 'role', 'avatar_url', 'bio', 'phone']
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(safeUser(user));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/auth/profile — update own profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    // Guest users cannot update profile
    if (req.user!.id === 999) {
      return res.status(403).json({ message: 'Guest users cannot edit their profile. Please create an account.' });
    }

    const user = await User.findByPk(req.user!.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, bio, phone, avatar_url, currentPassword, newPassword } = req.body;

    // Password change flow
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new one.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (avatar_url !== undefined) user.avatar_url = avatar_url;

    await user.save();
    res.json(safeUser(user));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
