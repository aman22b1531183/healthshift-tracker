// File: frontend/src/components/Layout/AppLayout.tsx
// FINAL CORRECTED VERSION

import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, DashboardOutlined, ClockCircleOutlined, SettingOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // --- THIS LINE HAS BEEN CORRECTED ---
  // We add .toLowerCase() to make the role check case-insensitive.
  const isManager = user?.role.toLowerCase() === 'manager';

  const menuItems = isManager 
    ? [
        {
          key: '/dashboard',
          icon: <DashboardOutlined />,
          label: 'Dashboard',
          onClick: () => navigate('/dashboard'),
        },
        {
          key: '/staff',
          icon: <UserSwitchOutlined />,
          label: 'Staff Management',
          onClick: () => navigate('/staff'),
        },
        {
          key: '/settings',
          icon: <SettingOutlined />,
          label: 'Settings',
          onClick: () => navigate('/settings'),
        },
      ]
    : [
        {
          key: '/clock',
          icon: <ClockCircleOutlined />,
          label: 'Clock In/Out',
          onClick: () => navigate('/clock'),
        },
        {
          key: '/history',
          icon: <UserOutlined />,
          label: 'My History',
          onClick: () => navigate('/history'),
        },
      ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: '#001529',
        padding: '0 24px'
      }}>
        <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
          HealthShift Tracker
        </div>
        
        <Space>
          <Text style={{ color: 'white' }}>
            {user?.name} ({user?.role})
          </Text>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" style={{ color: 'white' }}>
              <Avatar size="small" icon={<UserOutlined />} />
            </Button>
          </Dropdown>
        </Space>
      </Header>

      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>
        
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              background: '#fff',
              padding: 24,
              margin: 0,
              minHeight: 280,
              borderRadius: '8px',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};