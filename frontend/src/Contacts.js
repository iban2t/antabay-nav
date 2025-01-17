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

function Contacts() {
    const [data, setData] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [contactToDelete, setContactToDelete] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [contactFormData, setContactFormData] = useState({
        name: '',
        num: '',
        type: '',
        username: ''
    });
    const [editContactId, setEditContactId] = useState(null); // State to hold the ID of the contact being edited

    const navigate = useNavigate();

    useEffect(()=> {
        const token = localStorage.getItem('token');
        axios.get('http://localhost:5000/users/contacts', {
            headers: {
                Authorization: token
            }
        })
        .then(res => setData(res.data))
        .catch(err => console.log(err));
    }, []);

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        resetForm();
    };

    const handleShowCreateModal = () => setShowCreateModal(true);

    const handleShowEditModal = (contact) => {
        setEditContactId(contact.id); // Set the ID of the contact being edited
        setContactFormData(contact); // Pre-fill the form fields with contact data
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        resetForm();
    };

    const handleShowDeleteModal = (contactId) => {
        setContactToDelete(contactId);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
    };

    const resetForm = () => {
        setContactFormData({
            name: '',
            num: '',
            type: '',
            username: ''
        });
        setEditContactId(null); // Clear edit contact ID
    };

    const handleContactFormChange = (e) => {
        const { name, value } = e.target;
        setContactFormData({
            ...contactFormData,
            [name]: value
        });
    };

    const handleSaveContact = async () => {
        try {
            const token = localStorage.getItem('token');
            if (editContactId) {
                // If editContactId is set, it means we're editing an existing contact
                await axios.put(`http://localhost:5000/users/contacts/${editContactId}`, contactFormData, {
                    headers: {
                        Authorization: token
                    }
                });
            } else {
                // Otherwise, it's a new contact being added
                await axios.post('http://localhost:5000/users/contacts/add', contactFormData, {
                    headers: {
                        Authorization: token
                    }
                });
            }
            // Refresh the data after saving/updating the contact
            const res = await axios.get('http://localhost:5000/users/contacts', {
                headers: {
                    Authorization: token
                }
            });
            setData(res.data);
            // Show alert and navigate to contacts page
            if (editContactId) {
                alert('Contact updated successfully!');
            } else {
                alert('Contact registered successfully!');
            }
            navigate("/contacts");
            handleCloseCreateModal();
            handleCloseEditModal();
        } catch (error) {
            console.error('Error saving contact:', error);
        }
    };

    const handleDeleteContact = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/users/contacts/${contactToDelete}`, {
                headers: {
                    Authorization: token
                }
            });
            const res = await axios.get('http://localhost:5000/users/contacts', {
                headers: {
                    Authorization: token
                }
            });
            setData(res.data);
            setShowSuccessModal(true);
            handleCloseDeleteModal();
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
    };

    return (
        <>
            <div>
                <TopNavigation/>
                <Sidebar/>

                <br />
                <div className='pageHeader'>
                    <h3 style={{ marginLeft: "6rem" }}>Contacts</h3>
                    <div className='addContact' style={{ marginLeft: '6rem', marginRight: '7.5rem' }}>
                        <Button variant="success" onClick={handleShowCreateModal}>Add New Contact</Button>{' '}
                    </div>
                </div>

                <br />
                <Container className='table'>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Number</th>
                                <th>Type</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data.map((contact, index) => {
                                    return <tr key={index}>
                                        <td>{contact.id}</td>
                                        <td>{contact.name}</td>
                                        <td>{contact.num}</td>
                                        <td>{contact.type}</td>
                                        <td>
                                            <Button variant="primary" onClick={() => handleShowEditModal(contact)}>Edit</Button>{' '}
                                            <Button variant="danger" onClick={() => handleShowDeleteModal(contact.id)}>Delete</Button>{' '}
                                        </td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </Table>
                </Container>

                {/* Create Contact Modal */}
                <Modal show={showCreateModal} onHide={handleCloseCreateModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Contact</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="name">
                                <Form.Label>Name</Form.Label>
                                <Form.Control type="text" name="name" value={contactFormData.name} onChange={handleContactFormChange} />
                            </Form.Group>
                            <Form.Group controlId="num">
                                <Form.Label>Number</Form.Label>
                                <Form.Control type="text" name="num" value={contactFormData.num} onChange={handleContactFormChange} />
                            </Form.Group>
                            <Form.Group controlId="type">
                                <Form.Label>Type</Form.Label>
                                <Form.Select name="type" value={contactFormData.type} onChange={handleContactFormChange}>
                                    <option value="">Select Type</option>
                                    <option value="Family">Family</option>
                                    <option value="Friend">Friend</option>
                                    <option value="Local Authority">Local Authority</option>
                                    <option value="Others">Others</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group controlId="username">
                                <Form.Label>Username</Form.Label>
                                <Form.Control type="text" name="username" value={contactFormData.username} onChange={handleContactFormChange} />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseCreateModal}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={handleSaveContact} style={{ backgroundColor: '#800080' }}>
                            Save Contact
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Edit Contact Modal */}
                <Modal show={showEditModal} onHide={handleCloseEditModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Contact</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="name">
                                <Form.Label>Name</Form.Label>
                                <Form.Control type="text" name="name" value={contactFormData.name} onChange={handleContactFormChange} />
                            </Form.Group>
                            <Form.Group controlId="num">
                                <Form.Label>Number</Form.Label>
                                <Form.Control type="text" name="num" value={contactFormData.num} onChange={handleContactFormChange} />
                            </Form.Group>
                            <Form.Group controlId="type">
                                <Form.Label>Type</Form.Label>
                                <Form.Select name="type" value={contactFormData.type} onChange={handleContactFormChange}>
                                    <option value="">Select Type</option>
                                    <option value="Family">Family</option>
                                    <option value="Friend">Friend</option>
                                    <option value="Local Authority">Local Authority</option>
                                    <option value="Others">Others</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group controlId="username">
                                <Form.Label>Username</Form.Label>
                                <Form.Control type="text" name="username" value={contactFormData.username} onChange={handleContactFormChange} />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseEditModal}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={handleSaveContact} style={{ backgroundColor: '#800080' }}>
                            Update Contact
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Delete Contact Modal */}
                <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete Contact</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete this contact?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseDeleteModal}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDeleteContact}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Success Modal */}
                <Modal show={showSuccessModal} onHide={handleCloseSuccessModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Success</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Contact successfully deleted!
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={handleCloseSuccessModal}>
                            OK
                        </Button>
                    </Modal.Footer>
                </Modal>

            </div>
        </>
    ); 
}

export default Contacts;
