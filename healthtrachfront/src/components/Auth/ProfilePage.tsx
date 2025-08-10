// File: frontend/src/components/Auth/ProfilePage.tsx
// NEW FILE

import React from 'react';
import { Card, Descriptions, Avatar, Typography, Tag } from 'antd';
import { UserOutlined, MailOutlined, CrownOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title } = Typography;

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card>
        <p>User not found. Please log in again.</p>
      </Card>
    );
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: '24px' }}>
        <UserOutlined /> My Profile
      </Title>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Avatar size={80} icon={<UserOutlined />} />
          <Descriptions title={user.name} column={1}>
            <Descriptions.Item label={<><MailOutlined /> Email</>}>
              {user.email}
            </Descriptions.Item>
            <Descriptions.Item label={<><CrownOutlined /> Role</>}>
              <Tag color={user.role === 'MANAGER' ? 'gold' : 'blue'}>
                {user.role}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </div>
      </Card>
    </div>
  );
};