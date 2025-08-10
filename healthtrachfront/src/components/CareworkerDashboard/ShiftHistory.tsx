import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Tag, DatePicker, Space, Button } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { ShiftRecord } from '../../types';
import { format } from 'date-fns';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export const ShiftHistory: React.FC = () => {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [filteredShifts, setFilteredShifts] = useState<ShiftRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadShifts();
    }
  }, [user]);

  useEffect(() => {
    setFilteredShifts(shifts);
  }, [shifts]);

  const loadShifts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userShifts = await apiService.getUserShifts();
      const sortedShifts = userShifts.sort((a, b) => 
        new Date(b.clockInTime).getTime() - new Date(a.clockInTime).getTime()
      );
      setShifts(sortedShifts);
    } catch (error) {
      console.error('Failed to load shift history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = (dates: any) => {
    if (!dates || dates.length !== 2) {
      setFilteredShifts(shifts);
      return;
    }

    const [start, end] = dates;
    const filtered = shifts.filter(shift => {
      const shiftDate = new Date(shift.clockInTime);
      return shiftDate >= start.toDate() && shiftDate <= end.toDate();
    });
    setFilteredShifts(filtered);
  };

  const calculateTotalHours = () => {
    return filteredShifts
      .filter(shift => shift.durationMinutes)
      .reduce((total, shift) => total + (shift.durationMinutes || 0), 0) / 60;
  };

  const columns = [
    {
      title: 'Date',
      key: 'date',
      render: (record: ShiftRecord) => (
        <div>
          <div>{format(new Date(record.clockInTime), 'MMM dd, yyyy')}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {format(new Date(record.clockInTime), 'EEEE')}
          </div>
        </div>
      ),
    },
    {
      title: 'Clock In',
      key: 'clockIn',
      render: (record: ShiftRecord) => (
        <div>
          <div>
            <ClockCircleOutlined /> {format(new Date(record.clockInTime), 'HH:mm')}
          </div>
          {/* --- THIS PART HAS BEEN CORRECTED --- */}
          {/* It now reads the flat properties: record.clockInLatitude and record.clockInLongitude */}
          <div style={{ fontSize: '12px', color: '#666' }}>
            <EnvironmentOutlined /> {record.clockInLatitude.toFixed(4)}, {record.clockInLongitude.toFixed(4)}
          </div>
          {record.clockInNote && (
            <div style={{ fontSize: '12px', color: '#888', fontStyle: 'italic', marginTop: '4px' }}>
              "{record.clockInNote}"
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Clock Out',
      key: 'clockOut',
      render: (record: ShiftRecord) => (
        <div>
          {record.clockOutTime ? (
            <>
              <div>
                <ClockCircleOutlined /> {format(new Date(record.clockOutTime), 'HH:mm')}
              </div>
              {/* --- THIS PART HAS BEEN CORRECTED --- */}
              {/* It now reads the flat properties: record.clockOutLatitude and record.clockOutLongitude */}
              <div style={{ fontSize: '12px', color: '#666' }}>
                <EnvironmentOutlined /> {record.clockOutLatitude?.toFixed(4)}, {record.clockOutLongitude?.toFixed(4)}
              </div>
              {record.clockOutNote && (
                <div style={{ fontSize: '12px', color: '#888', fontStyle: 'italic', marginTop: '4px' }}>
                  "{record.clockOutNote}"
                </div>
              )}
            </>
          ) : (
            <Tag color="green">Currently Active</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (record: ShiftRecord) => {
        if (!record.clockOutTime) {
          const now = new Date();
          const diff = now.getTime() - new Date(record.clockInTime).getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          return <Tag color="processing">{hours}h {minutes}m</Tag>;
        }

        const hours = Math.floor((record.durationMinutes || 0) / 60);
        const minutes = (record.durationMinutes || 0) % 60;
        return <Tag color="blue">{hours}h {minutes}m</Tag>;
      },
    },
  ];

  return (
    <div>
      <Title level={2}>
        <CalendarOutlined /> My Shift History
      </Title>

      <Card style={{ marginBottom: '16px' }}>
        <Space wrap>
          <RangePicker
            placeholder={['Start Date', 'End Date']}
            onChange={handleDateFilter}
          />
          <Button onClick={loadShifts}>Refresh</Button>
          <div style={{ marginLeft: '16px' }}>
            <strong>Total Hours (filtered): {calculateTotalHours().toFixed(1)}h</strong>
          </div>
        </Space>
      </Card>

      <Card title={`Your Shifts (${filteredShifts.length} records)`}>
        <Table
          columns={columns}
          dataSource={filteredShifts}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} shifts`,
          }}
          scroll={{ x: 600 }}
        />
      </Card>
    </div>
  );
};