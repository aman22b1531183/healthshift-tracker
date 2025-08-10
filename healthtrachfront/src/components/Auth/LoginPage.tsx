import React from 'react';
import { Card, Button, Typography, Space, Divider } from 'antd';
import { GoogleOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
            HealthShift Tracker
          </Title>
          <Text type="secondary">
            Healthcare workforce management made simple
          </Text>
        </div>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4} style={{ textAlign: 'center', marginBottom: '16px' }}>
              Sign in to your account
            </Title>
            <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
              Choose your preferred sign-in method
            </Text>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<GoogleOutlined />}
            onClick={login}
            style={{ width: '100%', height: '48px' }}
          >
            Continue with Google
          </Button>

          <Divider>or</Divider>

          <Button
            size="large"
            icon={<MailOutlined />}
            onClick={login}
            style={{ width: '100%', height: '48px' }}
          >
            Continue with Email
          </Button>

          <Button
            size="large"
            icon={<UserOutlined />}
            onClick={login}
            style={{ width: '100%', height: '48px' }}
          >
            Continue with Username
          </Button>
        </Space>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </div>
      </Card>
    </div>
  );
};