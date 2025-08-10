// File: backend/src/routes/dashboard.ts
// FINAL CORRECTED VERSION

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/stats', async (req: Request, res: Response) => {
  try {
    // --- THIS CHECK IS NOW MORE EXPLICIT ---
    if (!req.user || !req.user.sub) {
      return res.status(401).json({ error: 'Authentication failed.' });
    }
    const user = await prisma.user.findUnique({
      where: { auth0Id: req.user.sub } // TypeScript is now certain req.user exists
    });

    if (!user || user.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const completedShifts = await prisma.shiftRecord.findMany({
      where: {
        status: 'COMPLETED',
        clockInTime: { gte: oneWeekAgo }
      },
      include: { user: true }
    });

    const totalHours = completedShifts.reduce((sum, shift) => sum + (shift.durationMinutes || 0), 0) / 60;
    const avgHoursPerDay = completedShifts.length > 0 ? totalHours / 7 : 0;
    const todayShifts = await prisma.shiftRecord.count({ where: { clockInTime: { gte: today } } });
    const activeShiftsCount = await prisma.shiftRecord.count({ where: { status: 'ACTIVE' } });
    const totalStaff = await prisma.user.count({ where: { role: 'CAREWORKER' } });

    const weeklyHoursByStaff: { [userId: string]: number } = {};
    completedShifts.forEach(shift => {
      if (!weeklyHoursByStaff[shift.userId]) {
        weeklyHoursByStaff[shift.userId] = 0;
      }
      weeklyHoursByStaff[shift.userId] += (shift.durationMinutes || 0) / 60;
    });

    const stats = {
      avgHoursPerDay: Math.round(avgHoursPerDay * 10) / 10,
      dailyClockIns: todayShifts,
      weeklyHoursByStaff,
      totalActiveShifts: activeShiftsCount,
      totalStaff
    };

    return res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ error: 'Failed to get dashboard statistics' });
  }
});

export { router as dashboardRoutes };