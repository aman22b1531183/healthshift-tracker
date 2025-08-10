// File: backend/src/routes/shifts.ts
// FINAL ROBUST VERSION

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';

const router = Router();
const prisma = new PrismaClient();

router.get('/my-shifts', async (req: Request, res: Response) => {
  try {
    if (!req.user?.sub) { return res.status(401).json({ error: 'Authentication failed.' }); }
    const user = await prisma.user.findUnique({ where: { auth0Id: req.user.sub } });
    if (!user) { return res.status(404).json({ error: 'User not found' }); }

    const shifts = await prisma.shiftRecord.findMany({
      where: { userId: user.id },
      include: { user: true },
      orderBy: { clockInTime: 'desc' }
    });
    return res.json(shifts);
  } catch (error) {
    console.error('Get shifts error:', error);
    return res.status(500).json({ error: 'Failed to get shifts' });
  }
});

router.get('/all', async (req: Request, res: Response) => {
  try {
    if (!req.user?.sub) { return res.status(401).json({ error: 'Authentication failed.' }); }
    const user = await prisma.user.findUnique({ where: { auth0Id: req.user.sub } });
    if (!user || user.role !== 'MANAGER') { return res.status(403).json({ error: 'Access denied' }); }

    const shifts = await prisma.shiftRecord.findMany({
      include: { user: true },
      orderBy: { clockInTime: 'desc' }
    });
    return res.json(shifts);
  } catch (error) {
    console.error('Get all shifts error:', error);
    return res.status(500).json({ error: 'Failed to get shifts' });
  }
});

router.get('/active', async (req: Request, res: Response) => {
  try {
    if (!req.user?.sub) { return res.status(401).json({ error: 'Authentication failed.' }); }
    const user = await prisma.user.findUnique({ where: { auth0Id: req.user.sub } });
    if (!user || user.role !== 'MANAGER') { return res.status(403).json({ error: 'Access denied' }); }

    const activeShifts = await prisma.shiftRecord.findMany({
      where: { status: 'ACTIVE' },
      include: { user: true },
      orderBy: { clockInTime: 'desc' }
    });
    return res.json(activeShifts);
  } catch (error) {
    console.error('Get active shifts error:', error);
    return res.status(500).json({ error: 'Failed to get active shifts' });
  }
});

router.post('/clock-in', [
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 }),
  body('note').optional().isString().trim()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }
    if (!req.user?.sub) { return res.status(401).json({ error: 'Authentication failed.' }); }

    const user = await prisma.user.findUnique({ where: { auth0Id: req.user.sub } });
    if (!user) { return res.status(404).json({ error: 'User not found' }); }

    const activeShift = await prisma.shiftRecord.findFirst({
      where: { userId: user.id, status: 'ACTIVE' }
    });
    if (activeShift) { return res.status(400).json({ error: 'You already have an active shift' }); }

    const { latitude, longitude, note } = req.body;
    const shift = await prisma.shiftRecord.create({
      data: {
        userId: user.id,
        clockInLatitude: latitude,
        clockInLongitude: longitude,
        clockInNote: note,
        status: 'ACTIVE'
      },
      include: { user: true }
    });
    return res.status(201).json(shift);
  } catch (error) {
    console.error('Clock in error:', error);
    return res.status(500).json({ error: 'Failed to clock in' });
  }
});

router.patch('/clock-out/:shiftId', [
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 }),
  body('note').optional().isString().trim()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }
    if (!req.user?.sub) { return res.status(401).json({ error: 'Authentication failed.' }); }

    const { shiftId } = req.params;
    if (!shiftId) { return res.status(400).json({ error: 'Shift ID is required in the URL.' }); }

    const { latitude, longitude, note } = req.body;
    const user = await prisma.user.findUnique({ where: { auth0Id: req.user.sub } });
    if (!user) { return res.status(404).json({ error: 'User not found' }); }

    const shift = await prisma.shiftRecord.findFirst({
      where: { id: shiftId, userId: user.id, status: 'ACTIVE' }
    });
    if (!shift) { return res.status(404).json({ error: 'Active shift not found' }); }

    const clockOutTime = new Date();
    const durationMinutes = Math.floor(
      (clockOutTime.getTime() - shift.clockInTime.getTime()) / (1000 * 60)
    );
    const updatedShift = await prisma.shiftRecord.update({
      where: { id: shiftId },
      data: {
        clockOutTime,
        clockOutLatitude: latitude,
        clockOutLongitude: longitude,
        clockOutNote: note,
        durationMinutes,
        status: 'COMPLETED'
      },
      include: { user: true }
    });
    return res.json(updatedShift);
  } catch (error) {
    console.error('Clock out error:', error);
    return res.status(500).json({ error: 'Failed to clock out' });
  }
});

export { router as shiftRoutes };