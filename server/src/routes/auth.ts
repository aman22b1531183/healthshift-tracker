// File: backend/src/routes/auth.ts

import { Router, Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.post('/profile', authMiddleware, async (req: Request, res: Response) => {
  if (!req.user || !req.user.sub) {
    return res.status(401).json({ error: 'Authentication failed.' });
  }

  const { sub, email, name } = req.user;

  if (!email) {
    console.error(`Auth0 token for sub ${sub} is missing the required email claim.`);
    return res.status(400).json({ error: 'Email is missing from token. Cannot create or verify user.' });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (user) {
      if (user.auth0Id !== sub) {
        user = await prisma.user.update({
          where: { email: email },
          data: { auth0Id: sub },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          auth0Id: sub,
          email: email,
          name: name || 'New User',
          role: 'CAREWORKER',
        },
      });
    }
    res.json(user);
  } catch (error) {
    console.error('Error in /profile endpoint:', error);
    res.status(500).json({ error: 'Failed to get or create user profile.' });
  }
});

router.get('/users', authMiddleware, async (req: Request, res: Response) => {
  const requestingUser = await prisma.user.findUnique({ where: { auth0Id: req.user?.sub } });
  if (requestingUser?.role !== 'MANAGER') {
    return res.status(403).json({ error: 'Access denied.' });
  }
  const allUsers = await prisma.user.findMany({
    orderBy: { name: 'asc' }
  });
  res.json(allUsers);
});

router.patch('/users/:userId/role', authMiddleware, async (req: Request, res: Response) => {
  const requestingUser = await prisma.user.findUnique({ where: { auth0Id: req.user?.sub } });
  if (requestingUser?.role !== 'MANAGER') {
    return res.status(403).json({ error: 'Access denied.' });
  }
  const { userId } = req.params;
  const { role } = req.body;
  if (role !== 'MANAGER' && role !== 'CAREWORKER') {
    return res.status(400).json({ error: 'Invalid role specified.' });
  }
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as Role }
    });
    res.json(updatedUser);
  } catch (error) {
    console.error(`Failed to update role for user ${userId}:`, error);
    res.status(500).json({ error: 'Failed to update user role.' });
  }
});

export { router as authRoutes };
