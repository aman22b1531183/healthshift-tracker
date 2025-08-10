export interface User {
  id: string;
  email: string;
  name: string;
  role: 'manager' | 'careworker';
  auth0Id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface ShiftRecord {
  id: string;
  userId: string;
  user?: User;
  clockInTime: Date;
  clockInLatitude: number;
  clockInLongitude: number;
  clockInNote?: string;
  clockOutTime?: Date;
  clockOutLatitude?: number;
  clockOutLongitude?: number;
  clockOutNote?: string;
  durationMinutes?: number;
  status: 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationPerimeter {
  id: string;
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusKm: number;
  createdBy: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  avgHoursPerDay: number;
  dailyClockIns: number;
  weeklyHoursByStaff: { [userId: string]: number };
  totalActiveShifts: number;
  totalStaff: number;
}

// export interface AuthRequest extends Request {
//   user?: {
//     sub: string;
//     email: string;
//     name: string;
//   };
// }