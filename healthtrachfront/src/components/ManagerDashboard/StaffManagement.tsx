// File: frontend/src/components/ManagerDashboard/StaffManagement.tsx
// FINAL VERSION WITH USER ROLE MANAGEMENT

import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Select, message, Tag } from 'antd';
import { UserOutlined, CrownOutlined } from '@ant-design/icons';
import { apiService } from '../../services/api';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const { Title } = Typography;
const { Option } = Select;

export const StaffManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await apiService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      message.error('Failed to load staff list.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole: 'MANAGER' | 'CAREWORKER', targetUser: User) => {
    if (targetUser.id === currentUser?.id) {
        message.warning("You cannot change your own role.");
        return;
    }
    
    try {
        await apiService.updateUserRoleById(targetUser.id, newRole);
        message.success(`${targetUser.name}'s role updated to ${newRole}`);
        // Refresh the user list to show the change
        loadUsers();
    } catch (error) {
        message.error("Failed to update user's role.");
    }
  };

  const columns = [
    {
      title: 'Staff Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'MANAGER' ? 'gold' : 'blue'} icon={role === 'MANAGER' ? <CrownOutlined /> : <UserOutlined />}>
            {role}
        </Tag>
      )
    },
    {
        title: 'Change Role',
        key: 'actions',
        render: (_: any, record: User) => (
            <Select
                defaultValue={record.role}
                style={{ width: 140 }}
                // Disable the dropdown for the currently logged-in manager
                disabled={record.id === currentUser?.id}
                onChange={(value) => handleRoleChange(value, record)}
            >
                <Option value="CAREWORKER">Care Worker</Option>
                <Option value="MANAGER">Manager</Option>
            </Select>
        )
    }
  ];

  return (
    <div>
      <Title level={2}>
        <UserOutlined /> Staff Management
      </Title>

      <Card title={`All Staff Members (${users.length} users)`}>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};