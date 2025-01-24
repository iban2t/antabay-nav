import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavigation from "./components/TopNavigation.js";
import Sidebar from "./components/Sidebar.js";
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/esm/Container.js';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import config from './config.js';

function FreqLoc() {
    const baseURL = config.REACT_APP_API_BASE_URL
    const [data, setData] = useState([]);
    const [locations, setLocations] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [locationToDelete, setLocationToDelete] = useState(null);
    const [createLocationFormData, setCreateLocationFormData] = useState({
        description: '',
        name: '',
        address: '',
        loc_id: ''
    });
    const [editLocationFormData, setEditLocationFormData] = useState({
        description: '',
        name: '',
        address: '',
        loc_id: ''
    });
    const [editLocationId, setEditLocationId] = useState(null); 

    const navigate = useNavigate();

    useEffect(()=> {
        const token = localStorage.getItem('token');
        // Fetch frequent locations
        axios.get(`${baseURL}/users/freq`, {
            headers: {
                Authorization: token
            }
        })
        .then(res => setData(res.data))
        .catch(err => console.log(err));

        // Fetch available locations for dropdown
        axios.get(`${baseURL}/nav/loc`, {
            headers: {
                Authorization: token
            }
        })
        .then(res => setLocations(res.data))
        .catch(err => console.log(err));
    }, []);

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        resetCreateForm();
    };

    const handleShowCreateModal = () => setShowCreateModal(true);

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        resetEditForm();
    };

    const handleShowEditModal = (location) => {
        setEditLocationId(location.id); 
        setEditLocationFormData(location); 
        setShowEditModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
    };

    const handleShowDeleteModal = (locationId) => {
        setLocationToDelete(locationId);
        setShowDeleteModal(true);
    };

    const resetCreateForm = () => {
        setCreateLocationFormData({
            description: '',
            name: '',
            address: '',
            loc_id: ''
        });
    };

    const resetEditForm = () => {
        setEditLocationFormData({
            description: '',
            name: '',
            address: '',
            loc_id: ''
        });
        setEditLocationId(null);
    };

    const handleCreateLocationFormChange = (e) => {
        const { name, value } = e.target;
        setCreateLocationFormData({
            ...createLocationFormData,
            [name]: value
        });
    };

    const handleEditLocationFormChange = (e) => {
        const { name, value } = e.target;
        setEditLocationFormData({
            ...editLocationFormData,
            [name]: value
        });
    };

    const handleSaveLocation = async (editMode) => {
        try {
            const token = localStorage.getItem('token');
            const formData = editMode ? editLocationFormData : createLocationFormData;
            if (editMode) {
                await axios.put(`${baseURL}/users/freq/${editLocationId}`, formData, {
                    headers: {
                        Authorization: token
                    }
                });
            } else {
                await axios.post(`${baseURL}/users/freq/add`, formData, {
                    headers: {
                        Authorization: token
                    }
                });
            }
            const res = await axios.get(`${baseURL}/users/freq`, {
                headers: {
                    Authorization: token
                }
            });
            setData(res.data);
            if (editMode) {
                alert('Location updated successfully!');
                handleCloseEditModal();
            } else {
                alert('Location added successfully!');
                handleCloseCreateModal();
            }
            navigate("/freqloc");
        } catch (error) {
            console.error('Error saving location:', error);
        }
    };

    const handleDeleteLocation = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${baseURL}/users/freq/${locationToDelete}`, {
                headers: {
                    Authorization: token
                }
            });
            const res = await axios.get(`${baseURL}/users/freq`, {
                headers: {
                    Authorization: token
                }
            });
            setData(res.data);
            handleCloseDeleteModal();
        } catch (error) {
            console.error('Error deleting location:', error);
        }
    };

    return (
        <>
            <div>
                <TopNavigation/>
                <Sidebar/>

                <br />
                <div className='pageHeader'>
                    <h3 style={{ marginLeft: "6rem" }}>Frequent Locations</h3>
                    <div className='addContact' style={{ marginLeft: '6rem', marginRight: '7.5rem' }}>
                        <Button variant="success" onClick={handleShowCreateModal}>Add New Frequent Location</Button>{' '}
                    </div>
                </div>

                <br />
                <Container className='table'>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Address</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data.map((location, index) => {
                                    return <tr key={index}>
                                        <td>{location.id}</td>
                                        <td>{location.name}</td>
                                        <td>{location.address}</td>
                                        <td>{location.description}</td>
                                        <td>
                                            <Button variant="primary" onClick={() => handleShowEditModal(location)}>Edit</Button>{' '}
                                            <Button variant="danger" onClick={() => handleShowDeleteModal(location.id)}>Delete</Button>{' '}
                                        </td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </Table>
                </Container>

                {/* Create Location Modal */}
                <Modal show={showCreateModal} onHide={handleCloseCreateModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Frequent Location</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="name">
                                <Form.Label>Name</Form.Label>
                                <Form.Control type="text" name="name" value={createLocationFormData.name} onChange={handleCreateLocationFormChange} />
                            </Form.Group>
                            <Form.Group controlId="address">
                                <Form.Label>Address</Form.Label>
                                <Form.Control type="text" name="address" value={createLocationFormData.address} onChange={handleCreateLocationFormChange} />
                            </Form.Group>
                            <Form.Group controlId="description">
                                <Form.Label>Description</Form.Label>
                                <Form.Control type="text" name="description" value={createLocationFormData.description} onChange={handleCreateLocationFormChange} />
                            </Form.Group>
                            <Form.Group controlId="loc_id">
                                <Form.Label>Location</Form.Label>
                                <Form.Select name="loc_id" value={createLocationFormData.loc_id} onChange={handleCreateLocationFormChange}>
                                    <option value="">Select Location</option>
                                    {locations.map(location => (
                                        <option key={location.id} value={location.id}>{location.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseCreateModal}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={() => handleSaveLocation(false)} style={{ backgroundColor: '#800080' }}>
                            Save Location
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Edit Location Modal */}
                <Modal show={showEditModal} onHide={handleCloseEditModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Frequent Location</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="name">
                                <Form.Label>Name</Form.Label>
                                <Form.Control type="text" name="name" value={editLocationFormData.name} onChange={handleEditLocationFormChange} />
                            </Form.Group>
                            <Form.Group controlId="address">
                                <Form.Label>Address</Form.Label>
                                <Form.Control type="text" name="address" value={editLocationFormData.address} onChange={handleEditLocationFormChange} />
                            </Form.Group>
                            <Form.Group controlId="description">
                                <Form.Label>Description</Form.Label>
                                <Form.Control type="text" name="description" value={editLocationFormData.description} onChange={handleEditLocationFormChange} />
                            </Form.Group>
                            <Form.Group controlId="loc_id">
                                <Form.Label>Location</Form.Label>
                                <Form.Select name="loc_id" value={editLocationFormData.loc_id} onChange={handleEditLocationFormChange}>
                                    <option value="">Select Location</option>
                                    {locations.map(location => (
                                        <option key={location.id} value={location.id}>{location.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseEditModal}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={() => handleSaveLocation(true)} style={{ backgroundColor: '#800080' }}>
                            Update Location
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Delete Location Modal */}
                <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete Frequent Location</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete this frequent location?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseDeleteModal}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDeleteLocation}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </>
    );
}

export default FreqLoc;
