// File: frontend/src/services/api.ts
// FINAL CORRECTED VERSION

import axios from 'axios';
import { ShiftRecord, LocationPerimeter, DashboardStats, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create a new axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// This function allows our AuthContext to set the bearer token for all requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

class ApiService {
  // Auth endpoints
  async createOrGetUserProfile(): Promise<User> {
    const response = await apiClient.post('/auth/profile');
    return response.data;
  }

  // --- NEW METHOD 1: GET ALL USERS ---
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get('/auth/users');
    return response.data;
  }

  // --- NEW METHOD 2: UPDATE USER ROLE BY ID ---
  async updateUserRoleById(userId: string, role: 'MANAGER' | 'CAREWORKER'): Promise<User> {
    const response = await apiClient.patch(`/auth/users/${userId}/role`, { role });
    return response.data;
  }

  // Shift Management
  async createShift(shiftData: {
    latitude: number;
    longitude: number;
    note?: string;
  }): Promise<ShiftRecord> {
    const response = await apiClient.post('/shifts/clock-in', shiftData);
    return response.data;
  }

  async updateShift(shiftId: string, updates: {
    latitude: number;
    longitude: number;
    note?: string;
  }): Promise<ShiftRecord> {
    const response = await apiClient.patch(`/shifts/clock-out/${shiftId}`, updates);
    return response.data;
  }

  async getActiveShifts(): Promise<ShiftRecord[]> {
    const response = await apiClient.get('/shifts/active');
    return response.data;
  }

  async getUserShifts(): Promise<ShiftRecord[]> {
    const response = await apiClient.get('/shifts/my-shifts');
    return response.data;
  }

  async getAllShifts(): Promise<ShiftRecord[]> {
    const response = await apiClient.get('/shifts/all');
    return response.data;
  }

  // Location Perimeter Management
  async createPerimeter(perimeter: {
    name: string;
    centerLatitude: number;
    centerLongitude: number;
    radiusKm: number;
    isActive?: boolean;
  }): Promise<LocationPerimeter> {
    const response = await apiClient.post('/locations/perimeters', perimeter);
    return response.data;
  }

  async getActivePerimeters(): Promise<LocationPerimeter[]> {
    const response = await apiClient.get('/locations/perimeters');
    return response.data;
  }

  async getAllPerimeters(): Promise<LocationPerimeter[]> {
    const response = await apiClient.get('/locations/perimeters/all');
    return response.data;
  }

  async updatePerimeter(id: string, updates: Partial<LocationPerimeter>): Promise<LocationPerimeter> {
    const response = await apiClient.patch(`/locations/perimeters/${id}`, updates);
    return response.data;
  }

  // Dashboard Analytics
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  }
}

export const apiService = new ApiService();