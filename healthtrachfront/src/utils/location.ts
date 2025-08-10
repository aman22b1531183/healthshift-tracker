// In frontend/src/utils/location.ts
// FINAL CORRECTED VERSION

import { Location, LocationPerimeter } from '../types';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
  point1: Location,
  point2: Location
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
      Math.cos(toRadians(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Check if a location is within the specified perimeter
 */
export const isWithinPerimeter = (
  currentLocation: Location,
  perimeter: LocationPerimeter
): boolean => {
  // --- THIS PART HAS BEEN CORRECTED ---
  // Create a location object from the flat properties of the perimeter
  const centerPoint: Location = {
    latitude: perimeter.centerLatitude,
    longitude: perimeter.centerLongitude,
  };

  const distance = calculateDistance(currentLocation, centerPoint);
  return distance <= perimeter.radiusKm;
};

/**
 * Get current user location using browser geolocation API
 */
export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};