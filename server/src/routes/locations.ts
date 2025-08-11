import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';

const router = Router();
const prisma = new PrismaClient();

// Get all active perimeters
router.get('/perimeters', async (req, res) => {
  try {
    const perimeters = await prisma.locationPerimeter.findMany({
      where: { isActive: true },
      include: { creator: { select: { name: true } } }
    });

    res.json(perimeters);
  } catch (error) {
    console.error('Get perimeters error:', error);
    res.status(500).json({ error: 'Failed to get location perimeters' });
  }
});

// Get all perimeters (managers only)
router.get('/perimeters/all', async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id: req.user.sub }
    });

    if (!user || user.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const perimeters = await prisma.locationPerimeter.findMany({
      include: { creator: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json(perimeters);
  } catch (error) {
    console.error('Get all perimeters error:', error);
    res.status(500).json({ error: 'Failed to get perimeters' });
  }
});

// Create perimeter (managers only)
router.post('/perimeters', [
  body('name').isString().trim().isLength({ min: 1 }),
  body('centerLatitude').isFloat({ min: -90, max: 90 }),
  body('centerLongitude').isFloat({ min: -180, max: 180 }),
  body('radiusKm').isFloat({ min: 0.1, max: 50 }),
  body('isActive').optional().isBoolean()
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await prisma.user.findUnique({
      where: { auth0Id: req.user.sub }
    });

    if (!user || user.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, centerLatitude, centerLongitude, radiusKm, isActive = true } = req.body;

    const perimeter = await prisma.locationPerimeter.create({
      data: {
        name,
        centerLatitude,
        centerLongitude,
        radiusKm,
        isActive,
        createdBy: user.id
      },
      include: { creator: { select: { name: true } } }
    });

    res.status(201).json(perimeter);
  } catch (error) {
    console.error('Create perimeter error:', error);
    res.status(500).json({ error: 'Failed to create perimeter' });
  }
});

// Update perimeter (managers only)
router.patch('/perimeters/:id', [
  body('name').optional().isString().trim().isLength({ min: 1 }),
  body('centerLatitude').optional().isFloat({ min: -90, max: 90 }),
  body('centerLongitude').optional().isFloat({ min: -180, max: 180 }),
  body('radiusKm').optional().isFloat({ min: 0.1, max: 50 }),
  body('isActive').optional().isBoolean()
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await prisma.user.findUnique({
      where: { auth0Id: req.user.sub }
    });

    if (!user || user.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const updateData = req.body;

    const perimeter = await prisma.locationPerimeter.update({
      where: { id },
      data: updateData,
      include: { creator: { select: { name: true } } }
    });

    res.json(perimeter);
  } catch (error) {
    console.error('Update perimeter error:', error);
    res.status(500).json({ error: 'Failed to update perimeter' });
  }
});

export { router as locationRoutes };