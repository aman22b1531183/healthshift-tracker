import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Space, Tag } from 'antd';
import { UserOutlined, ClockCircleOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiService } from '../../services/api';
import { DashboardStats, ShiftRecord } from '../../types';
import { format } from 'date-fns';

const { Title } = Typography;

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeShifts, setActiveShifts] = useState<ShiftRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, currentActiveShifts] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getActiveShifts(),
      ]);

      setStats(dashboardStats);
      setActiveShifts(currentActiveShifts);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeShiftsColumns = [
    {
      title: 'Staff Name',
      dataIndex: 'userName',
      key: 'userName',
      render: (name: string) => (
        <Space>
          <UserOutlined />
          {name}
        </Space>
      ),
    },
    {
      title: 'Clock In Time',
      dataIndex: 'clockInTime',
      key: 'clockInTime',
      render: (time: Date) => format(new Date(time), 'MMM dd, HH:mm'),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (record: ShiftRecord) => {
        const now = new Date();
        const diff = now.getTime() - new Date(record.clockInTime).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return (
          <Tag color="green">
            {hours}h {minutes}m
          </Tag>
        );
      },
    },
    {
      title: 'Location',
      key: 'location',
      // --- THIS PART HAS BEEN CORRECTED ---
      // It now reads the flat properties: record.clockInLatitude and record.clockInLongitude
      render: (record: ShiftRecord) => (
        <span style={{ fontSize: '12px', color: '#666' }}>
          {record.clockInLatitude?.toFixed(4)}, {record.clockInLongitude?.toFixed(4)}
        </span>
      ),
    },
  ];

  const chartData = stats ? Object.entries(stats.weeklyHoursByStaff).map(([userId, hours]) => ({
    staff: `Staff ${userId.slice(-4)}`,
    hours: Math.round(hours * 10) / 10,
  })) : [];

  return (
    <div>
      <Title level={2}>
        <TeamOutlined /> Manager Dashboard
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Avg Hours/Day"
              value={stats?.avgHoursPerDay || 0}
              precision={1}
              prefix={<ClockCircleOutlined />}
              suffix="hrs"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Today's Clock-ins"
              value={stats?.dailyClockIns || 0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Currently Active"
              value={activeShifts.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Staff"
              value={Object.keys(stats?.weeklyHoursByStaff || {}).length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Weekly Hours by Staff" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="staff" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Currently Clocked In" style={{ height: '400px' }}>
            <Table
              columns={activeShiftsColumns}
              dataSource={activeShifts}
              rowKey="id"
              pagination={false}
              loading={loading}
              size="small"
              scroll={{ y: 300 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};