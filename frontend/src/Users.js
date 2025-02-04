import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from './config';
import TopNavigation from './components/TopNavigation';
import Sidebar from './components/Sidebar';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role_id: '',
    num: '',
    email: ''
  });

  // Fetch users and roles
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.REACT_APP_API_BASE_URL}/users/users`, {
        headers: { Authorization: token }
      });
      setUsers(response.data);
    } catch (error) {
      showAlert('Error fetching users', 'danger');
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.REACT_APP_API_BASE_URL}/users/roles`, {
        headers: { Authorization: token }
      });
      setRoles(response.data);
    } catch (error) {
      showAlert('Error fetching roles', 'danger');
    }
  };

  const handleAdd = () => {
    setModalMode('add');
    setSelectedUser(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      role_id: '',
      num: '',
      email: ''
    });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      password: '', // Don't show existing password
      role_id: user.role_id,
      num: user.num,
      email: user.email
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${config.REACT_APP_API_BASE_URL}/users/users/${userId}`, {
          headers: { Authorization: token }
        });
        showAlert('User deleted successfully', 'success');
        fetchUsers();
      } catch (error) {
        showAlert('Error deleting user', 'danger');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (modalMode === 'add') {
        await axios.post(`${config.REACT_APP_API_BASE_URL}/auth/register`, formData, {
          headers: { Authorization: token }
        });
        showAlert('User added successfully', 'success');
      } else {
        await axios.put(
          `${config.REACT_APP_API_BASE_URL}/users/users/${selectedUser.id}`,
          formData,
          { headers: { Authorization: token } }
        );
        showAlert('User updated successfully', 'success');
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      showAlert(error.response?.data?.message || 'Error saving user', 'danger');
    }
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <>
      <div>
        <TopNavigation />
        <Sidebar />

        <br />
        <div style={{ 
          marginLeft: "6rem",
          marginRight: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h3>Users Management</h3>
          <Button variant="success" onClick={handleAdd}>Add User</Button>
        </div>
        <br />
        <br />
        <Container className='table'>
          {alert && (
            <Alert variant={alert.type} className="mb-4">
              {alert.message}
            </Alert>
          )}

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.username}</td>
                  <td>{user.role_name}</td>
                  <td>{user.num}</td>
                  <td>{user.email}</td>
                  <td>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Container>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === 'add' ? 'Add User' : 'Edit User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password {modalMode === 'edit' && '(Leave blank to keep current)'}</Form.Label>
              <Form.Control
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required={modalMode === 'add'}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={formData.role_id}
                onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                required
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.role_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="text"
                value={formData.num}
                onChange={(e) => setFormData({...formData, num: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {modalMode === 'add' ? 'Add User' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Users; 