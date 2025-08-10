import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Alert, Space, Typography, Spin, Tag, message } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { getCurrentLocation, isWithinPerimeter } from '../../utils/location';
import { ShiftRecord, LocationPerimeter, Location } from '../../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const ClockInOut: React.FC = () => {
  const { user } = useAuth();
  const [currentShift, setCurrentShift] = useState<ShiftRecord | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [perimeters, setPerimeters] = useState<LocationPerimeter[]>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [isWithinValidPerimeter, setIsWithinValidPerimeter] = useState(false);

  useEffect(() => {
    // Only load data if the user object is available
    if (user) {
      loadInitialData();
    }
    getCurrentLocationData();
  }, [user]); // Add user as a dependency

  useEffect(() => {
    if (location && perimeters.length > 0) {
      checkPerimeterStatus();
    }
  }, [location, perimeters]);

  // --- THIS FUNCTION HAS BEEN CORRECTED ---
  const loadInitialData = async () => {
    if (!user) return; // Add a guard clause for safety

    try {
      // Fetch the current user's shifts and the active perimeters
      const [userShifts, activePerimeters] = await Promise.all([
        // CHANGE 1: Use the correct API endpoint for a care worker's own shifts.
        apiService.getUserShifts(),
        apiService.getActivePerimeters(),
      ]);

      // CHANGE 2: Find the active shift from the user's personal shift history.
      const userActiveShift = userShifts.find(shift => shift.status === 'ACTIVE');
      setCurrentShift(userActiveShift || null);
      setPerimeters(activePerimeters);

    } catch (error) {
      console.error("Failed to load initial data:", error);
      message.error('Failed to load your shift data');
    }
  };

  const getCurrentLocationData = async () => {
    try {
      setLocationLoading(true);
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
    } catch (error) {
      message.error('Unable to get your location. Please enable location services.');
    } finally {
      setLocationLoading(false);
    }
  };

  const checkPerimeterStatus = () => {
    if (!location) return;
    
    const withinAnyPerimeter = perimeters.some(perimeter => 
      isWithinPerimeter(location, perimeter)
    );
    setIsWithinValidPerimeter(withinAnyPerimeter);
  };

  const handleClockIn = async () => {
    if (!user || !location) return;

    if (!isWithinValidPerimeter) {
      message.error('You must be within the designated work area to clock in');
      return;
    }

    setLoading(true);
    try {
      // CHANGE 3: The backend now knows the user from the token, so we don't need to send user details.
      const newShift = await apiService.createShift({
        latitude: location.latitude,
        longitude: location.longitude,
        note: note || undefined,
      });

      setCurrentShift(newShift);
      setNote('');
      message.success('Successfully clocked in!');
    } catch (error) {
      message.error('Failed to clock in');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!currentShift || !location) return;

    setLoading(true);
    try {
      const clockOutTime = new Date();
      // This duration calculation is now handled by the backend, so we don't need to pass it.
      // const duration = Math.floor((clockOutTime.getTime() - new Date(currentShift.clockInTime).getTime()) / (1000 * 60));

      const updatedShift = await apiService.updateShift(currentShift.id, {
        // clockOutTime, // Backend sets this
        latitude: location.latitude,
        longitude: location.longitude,
        note: note || undefined,
        // duration, // Backend calculates this
      });

      setCurrentShift(null);
      setNote('');
      message.success(`Successfully clocked out!`);
    } catch (error) {
      message.error('Failed to clock out');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (startTime: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(startTime).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (locationLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text>Getting your location...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Title level={2}>
        <ClockCircleOutlined /> Clock In/Out
      </Title>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Location Status */}
        <Card>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <EnvironmentOutlined />
              <Text strong>Location Status</Text>
            </div>
            
            {location ? (
              <div>
                <Tag color={isWithinValidPerimeter ? 'green' : 'red'}>
                  {isWithinValidPerimeter ? 'Within Work Area' : 'Outside Work Area'}
                </Tag>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                  Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                </div>
              </div>
            ) : (
              <Alert
                message="Location Required"
                description="Please enable location services to use clock in/out functionality"
                type="warning"
                showIcon
              />
            )}
          </Space>
        </Card>

        {/* Current Shift Status */}
        {currentShift && (
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <Text strong>Currently Clocked In</Text>
              </div>
              
              <div>
                <Text>Started: {new Date(currentShift.clockInTime).toLocaleString()}</Text>
              </div>
              
              <div>
                <Text>Duration: {formatDuration(currentShift.clockInTime)}</Text>
              </div>

              {currentShift.clockInNote && (
                <div>
                  <Text type="secondary">Clock-in note: {currentShift.clockInNote}</Text>
                </div>
              )}
            </Space>
          </Card>
        )}

        {/* Clock In/Out Actions */}
        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <TextArea
              placeholder={currentShift ? "Add a note for clock out (optional)" : "Add a note for clock in (optional)"}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />

            {!currentShift ? (
              <Button
                type="primary"
                size="large"
                icon={<ClockCircleOutlined />}
                onClick={handleClockIn}
                loading={loading}
                disabled={!location || !isWithinValidPerimeter}
                style={{ width: '100%', height: '50px' }}
              >
                Clock In
              </Button>
            ) : (
              <Button
                type="primary"
                danger
                size="large"
                icon={<ClockCircleOutlined />}
                onClick={handleClockOut}
                loading={loading}
                disabled={!location}
                style={{ width: '100%', height: '50px' }}
              >
                Clock Out
              </Button>
            )}

            {!isWithinValidPerimeter && !currentShift && (
              <Alert
                message="Outside Work Area"
                description="You need to be within the designated work perimeter to clock in. Please move closer to your workplace."
                type="error"
                showIcon
              />
            )}
          </Space>
        </Card>
      </Space>
    </div>
  );
};