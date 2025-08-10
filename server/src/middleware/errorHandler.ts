// File: backend/src/middleware/errorHandler.ts
// FINAL ROBUST VERSION

import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => { // Explicitly state that this function doesn't return a value
  console.error('Error:', error);

  if (error.code === 'P2002') {
    res.status(409).json({
      error: 'Duplicate entry',
      message: 'A record with this information already exists'
    });
    return;
  }

  if (error.code === 'P2025') {
    res.status(404).json({
      error: 'Record not found',
      message: 'The requested record does not exist'
    });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
};