import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get dashboard statistics (managers only)
router.get('/stats', async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id: req.user.sub }
    });

    if (!user || user.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get completed shifts from last week
    const completedShifts = await prisma.shiftRecord.findMany({
      where: {
        status: 'COMPLETED',
        clockInTime: {
          gte: oneWeekAgo
        }
      },
      include: { user: true }
    });

    // Calculate average hours per day
    const totalHours = completedShifts.reduce((sum, shift) => 
      sum + (shift.durationMinutes || 0), 0) / 60;
    const avgHoursPerDay = completedShifts.length > 0 ? totalHours / 7 : 0;

    // Count today's clock-ins
    const todayShifts = await prisma.shiftRecord.count({
      where: {
        clockInTime: {
          gte: today
        }
      }
    });

    // Get active shifts count
    const activeShiftsCount = await prisma.shiftRecord.count({
      where: { status: 'ACTIVE' }
    });

    // Get total staff count
    const totalStaff = await prisma.user.count({
      where: { role: 'CAREWORKER' }
    });

    // Weekly hours by staff
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

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard statistics' });
  }
});

export { router as dashboardRoutes };