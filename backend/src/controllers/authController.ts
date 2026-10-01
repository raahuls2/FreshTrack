import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'freshtrack_jwt_super_secret_key_2026';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, householdName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and their primary household in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase().trim(),
          passwordHash,
        }
      });

      const household = await tx.household.create({
        data: {
          name: householdName || `${name}'s Household`,
          ownerId: user.id
        }
      });

      return { user, household };
    });

    const token = jwt.sign(
      {
        userId: newUser.user.id,
        email: newUser.user.email,
        householdId: newUser.household.id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Exclude passwordHash from response
    const { passwordHash: _, ...userWithoutPassword } = newUser.user;

    return res.status(201).json({
      user: userWithoutPassword,
      household: newUser.household,
      token
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { household: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        householdId: user.household?.id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;

    return res.json({
      user: userWithoutPassword,
      household: user.household,
      token
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { household: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;

    return res.json({
      user: userWithoutPassword,
      household: user.household
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
};
