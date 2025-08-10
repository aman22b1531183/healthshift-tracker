// File: backend/src/types/express/index.d.ts

// This tells TypeScript to add our custom 'user' property to the existing Express Request interface.
declare namespace Express {
  export interface Request {
    user?: {
      sub: string;
      email: string;
      name: string;
    }
  }
}