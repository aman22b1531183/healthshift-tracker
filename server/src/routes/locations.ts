// File: backend/src/routes/locations.ts
// FINAL ROBUST VERSION

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';

const router = Router();
const prisma = new PrismaClient();

router.get('/perimeters', async (req: Request, res: Response) => {
  try {
    const perimeters = await prisma.locationPerimeter.findMany({
      where: { isActive: true },
      include: { creator: { select: { name: true } } }
    });
    return res.json(perimeters);
  } catch (error) {
    console.error('Get perimeters error:', error);
    return res.status(500).json({ error: 'Failed to get location perimeters' });
  }
});

router.get('/perimeters/all', async (req: Request, res: Response) => {
  try {
    if (!req.user?.sub) { return res.status(401).json({ error: 'Authentication failed.' }); }
    const user = await prisma.user.findUnique({ where: { auth0Id: req.user.sub } });
    if (!user || user.role !== 'MANAGER') { return res.status(403).json({ error: 'Access denied' }); }

    const perimeters = await prisma.locationPerimeter.findMany({
      include: { creator: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(perimeters);
  } catch (error) {
    console.error('Get all perimeters error:', error);
    return res.status(500).json({ error: 'Failed to get perimeters' });
  }
});

router.post('/perimeters', [
  body('name').isString().trim().isLength({ min: 1 }),
  body('centerLatitude').isFloat({ min: -90, max: 90 }),
  body('centerLongitude').isFloat({ min: -180, max: 180 }),
  body('radiusKm').isFloat({ min: 0.1, max: 50 }),
  body('isActive').optional().isBoolean()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }
    if (!req.user?.sub) { return res.status(401).json({ error: 'Authentication failed.' }); }

    const user = await prisma.user.findUnique({ where: { auth0Id: req.user.sub } });
    if (!user || user.role !== 'MANAGER') { return res.status(403).json({ error: 'Access denied' }); }

    const { name, centerLatitude, centerLongitude, radiusKm, isActive = true } = req.body;
    const perimeter = await prisma.locationPerimeter.create({
      data: { name, centerLatitude, centerLongitude, radiusKm, isActive, createdBy: user.id },
      include: { creator: { select: { name: true } } }
    });
    return res.status(201).json(perimeter);
  } catch (error) {
    console.error('Create perimeter error:', error);
    return res.status(500).json({ error: 'Failed to create perimeter' });
  }
});

router.patch('/perimeters/:id', [
  body('name').optional().isString().trim().isLength({ min: 1 }),
  body('centerLatitude').optional().isFloat({ min: -90, max: 90 }),
  body('centerLongitude').optional().isFloat({ min: -180, max: 180 }),
  body('radiusKm').optional().isFloat({ min: 0.1, max: 50 }),
  body('isActive').optional().isBoolean()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }
    if (!req.user?.sub) { return res.status(401).json({ error: 'Authentication failed.' }); }

    const user = await prisma.user.findUnique({ where: { auth0Id: req.user.sub } });
    if (!user || user.role !== 'MANAGER') { return res.status(403).json({ error: 'Access denied' }); }

    const { id } = req.params;
    if (!id) { return res.status(400).json({ error: 'Perimeter ID is required.' }); }

    const updateData = req.body;
    const perimeter = await prisma.locationPerimeter.update({
      where: { id },
      data: updateData,
      include: { creator: { select: { name: true } } }
    });
    return res.json(perimeter);
  } catch (error) {
    console.error('Update perimeter error:', error);
    return res.status(500).json({ error: 'Failed to update perimeter' });
  }
});

export { router as locationRoutes };