import React, { useState, useEffect } from 'react';
import { Card, Form, Input, InputNumber, Button, Table, Space, Typography, message, Modal, Switch } from 'antd';
import { EnvironmentOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { apiService } from '../../services/api';
import { LocationPerimeter } from '../../types';

const { Title } = Typography;

export const LocationSettings: React.FC = () => {
  const [perimeters, setPerimeters] = useState<LocationPerimeter[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPerimeter, setEditingPerimeter] = useState<LocationPerimeter | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadPerimeters();
  }, []);

  const loadPerimeters = async () => {
    try {
      setLoading(true);
      const allPerimeters = await apiService.getAllPerimeters();
      setPerimeters(allPerimeters);
    } catch (error) {
      message.error('Failed to load location perimeters');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const perimeterData = {
        name: values.name,
        centerLatitude: values.latitude,
        centerLongitude: values.longitude,
        radiusKm: values.radiusKm,
        isActive: values.isActive ?? true,
      };

      if (editingPerimeter) {
        await apiService.updatePerimeter(editingPerimeter.id, perimeterData);
        message.success('Location perimeter updated successfully');
      } else {
        await apiService.createPerimeter(perimeterData);
        message.success('Location perimeter created successfully');
      }

      setModalVisible(false);
      setEditingPerimeter(null);
      form.resetFields();
      loadPerimeters();
    } catch (error) {
      console.error("Failed to save perimeter:", error);
      message.error('Failed to save location perimeter');
    }
  };

  const handleEdit = (perimeter: LocationPerimeter) => {
    setEditingPerimeter(perimeter);
    // --- THIS PART HAS BEEN CORRECTED ---
    // It now reads the flat properties from the API data.
    form.setFieldsValue({
      name: perimeter.name,
      latitude: perimeter.centerLatitude,
      longitude: perimeter.centerLongitude,
      radiusKm: perimeter.radiusKm,
      isActive: perimeter.isActive,
    });
    setModalVisible(true);
  };

  const handleToggleActive = async (perimeter: LocationPerimeter) => {
    try {
      await apiService.updatePerimeter(perimeter.id, {
        isActive: !perimeter.isActive,
      });
      message.success(`Perimeter ${perimeter.isActive ? 'deactivated' : 'activated'}`);
      loadPerimeters();
    } catch (error) {
      message.error('Failed to update perimeter status');
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setFieldsValue({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          message.success('Current location set');
        },
        (error) => {
          message.error('Unable to get current location');
        }
      );
    } else {
      message.error('Geolocation is not supported by this browser');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Center Location',
      key: 'location',
      // --- THIS PART HAS BEEN CORRECTED ---
      // It now displays the flat data received from the server.
      render: (record: LocationPerimeter) => (
        <div style={{ fontSize: '12px' }}>
          <div>Lat: {record.centerLatitude?.toFixed(6)}</div>
          <div>Lng: {record.centerLongitude?.toFixed(6)}</div>
        </div>
      ),
    },
    {
      title: 'Radius (km)',
      dataIndex: 'radiusKm',
      key: 'radiusKm',
      render: (radius: number) => `${radius} km`,
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: LocationPerimeter) => (
        <Switch
          checked={record.isActive}
          onChange={() => handleToggleActive(record)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: LocationPerimeter) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>
        <EnvironmentOutlined /> Location Settings
      </Title>

      <Card
        title="Work Location Perimeters"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingPerimeter(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Add Perimeter
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={perimeters}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingPerimeter ? 'Edit Location Perimeter' : 'Add Location Perimeter'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingPerimeter(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ isActive: true, radiusKm: 2 }}
        >
          <Form.Item
            name="name"
            label="Perimeter Name"
            rules={[{ required: true, message: 'Please enter a name for this perimeter' }]}
          >
            <Input placeholder="e.g., Main Hospital Campus" />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'end' }}>
            <Form.Item
              name="latitude"
              label="Latitude"
              rules={[{ required: true, message: 'Please enter latitude' }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="e.g., 40.7128"
                precision={6}
                step={0.000001}
              />
            </Form.Item>

            <Form.Item
              name="longitude"
              label="Longitude"
              rules={[{ required: true, message: 'Please enter longitude' }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="e.g., -74.0060"
                precision={6}
                step={0.000001}
              />
            </Form.Item>

            {/* Minor fix for Ant Design warning: removed unnecessary Form.Item wrapper */}
            <Button
              type="dashed"
              icon={<EnvironmentOutlined />}
              onClick={getCurrentLocation}
              style={{ marginBottom: '24px' }} // Align button with form fields
            >
              Use Current Location
            </Button>
          </div>

          <Form.Item
            name="radiusKm"
            label="Radius (kilometers)"
            rules={[{ required: true, message: 'Please enter radius' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0.1}
              max={50}
              step={0.1}
              placeholder="e.g., 2.0"
            />
          </Form.Item>

          <Form.Item name="isActive" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            <span style={{ marginLeft: '8px' }}>Perimeter is active</span>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingPerimeter ? 'Update' : 'Create'} Perimeter
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};