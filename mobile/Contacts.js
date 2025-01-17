import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Modal, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '@env';

const Contacts = () => {
    const [data, setData] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [contactFormData, setContactFormData] = useState({
        name: '',
        num: '',
        type: '',
        username: ''
    });
    const [editContactId, setEditContactId] = useState(null);
    const [contactToDelete, setContactToDelete] = useState(null);
    const [selectedContact, setSelectedContact] = useState(null);

    const navigation = useNavigation();

    useEffect(() => {
        const fetchData = async () => {
            const token = await AsyncStorage.getItem('token');
            try {
                const res = await axios.get(`${API_BASE_URL}/users/contacts`, {
                    headers: { Authorization: token }
                });
                // Sort contacts alphabetically by name
                const sortedData = res.data.sort((a, b) => a.name.localeCompare(b.name));
                setData(sortedData);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        resetForm();
    };

    const handleShowCreateModal = () => setShowCreateModal(true);

    const handleShowEditModal = (contact) => {
        setEditContactId(contact.id);
        setContactFormData(contact);
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

    const handleShowDetailsModal = (contact) => {
        setSelectedContact(contact);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedContact(null);
    };

    const resetForm = () => {
        setContactFormData({
            name: '',
            num: '',
            type: '',
            username: ''
        });
        setEditContactId(null);
    };

    const handleContactFormChange = (name, value) => {
        setContactFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveContact = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
    
            // Ensure empty strings in the username field are set to null
            const processedContactData = {
                ...contactFormData,
                username: contactFormData.username === '' ? null : contactFormData.username,
            };
    
            if (editContactId) {
                // Update existing contact
                await axios.put(`${API_BASE_URL}/users/contacts/${editContactId}`, processedContactData, {
                    headers: { Authorization: token }
                });
            } else {
                // Add new contact
                await axios.post(`${API_BASE_URL}/users/contacts/add`, processedContactData, {
                    headers: { Authorization: token }
                });
            }
    
            // Fetch updated contacts
            const res = await axios.get(`${API_BASE_URL}/users/contacts`, {
                headers: { Authorization: token }
            });
            const sortedData = res.data.sort((a, b) => a.name.localeCompare(b.name));
            setData(sortedData);
    
            // Show success alert
            Alert.alert('Success', editContactId ? 'Contact updated successfully!' : 'Contact registered successfully!');
            
            // Close modals
            handleCloseCreateModal();
            handleCloseEditModal();
        } catch (error) {
            console.error('Error saving contact:', error);
        }
    };
    

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
    };

    const handleDeleteContact = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/users/contacts/${contactToDelete}`, {
                headers: { Authorization: token }
            });
            const res = await axios.get(`${API_BASE_URL}/users/contacts`, {
                headers: { Authorization: token }
            });
            const sortedData = res.data.sort((a, b) => a.name.localeCompare(b.name));
            setData(sortedData);
            setShowSuccessModal(true);
            handleCloseDeleteModal();
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Contacts</Text>
                <Button title="Add New Contact" onPress={handleShowCreateModal} color="#800080" />
            </View>

            <FlatList
                data={data}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleShowDetailsModal(item)} style={styles.contactRow}>
                        <View style={styles.contactInfo}>
                            <Text>{item.name}</Text>
                            <Text>{item.num}</Text>
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity onPress={() => handleShowEditModal(item)}>
                                <Text style={styles.actionText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleShowDeleteModal(item.id)}>
                                <Text style={[styles.actionText, { color: 'red' }]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}
            />

            {/* Create, Edit, Delete, and Success Modals here (same as before) */}
            {/* Create Contact Modal */}
            <Modal
                transparent={true}
                visible={showCreateModal}
                onRequestClose={handleCloseCreateModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New Contact</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Name"
                            value={contactFormData.name}
                            onChangeText={(text) => handleContactFormChange('name', text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Number"
                            value={contactFormData.num}
                            onChangeText={(text) => handleContactFormChange('num', text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Type"
                            value={contactFormData.type}
                            onChangeText={(text) => handleContactFormChange('type', text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            value={contactFormData.username}
                            onChangeText={(text) => handleContactFormChange('username', text)}
                        />
                        <Button title="Save Contact" onPress={handleSaveContact} color="#800080" />
                        <Button title="Close" onPress={handleCloseCreateModal} color="grey" />
                    </View>
                </View>
            </Modal>

            {/* Edit Contact Modal */}
            <Modal
                transparent={true}
                visible={showEditModal}
                onRequestClose={handleCloseEditModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Contact</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Name"
                            value={contactFormData.name}
                            onChangeText={(text) => handleContactFormChange('name', text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Number"
                            value={contactFormData.num}
                            onChangeText={(text) => handleContactFormChange('num', text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Type"
                            value={contactFormData.type}
                            onChangeText={(text) => handleContactFormChange('type', text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            value={contactFormData.username}
                            onChangeText={(text) => handleContactFormChange('username', text)}
                        />
                        <Button title="Update Contact" onPress={handleSaveContact} color="#800080" />
                        <Button title="Close" onPress={handleCloseEditModal} color="grey" />
                    </View>
                </View>
            </Modal>

            {/* Delete Contact Modal */}
            <Modal
                transparent={true}
                visible={showDeleteModal}
                onRequestClose={handleCloseDeleteModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Delete Contact</Text>
                        <Text>Are you sure you want to delete this contact?</Text>
                        <Button title="Delete" onPress={handleDeleteContact} color="red" />
                        <Button title="Cancel" onPress={handleCloseDeleteModal} color="grey" />
                    </View>
                </View>
            </Modal>

             {/* Success Modal */}
             <Modal
                transparent={true}
                visible={showSuccessModal}
                onRequestClose={handleCloseSuccessModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Success</Text>
                        <Text>Contact successfully deleted!</Text>
                        <Button title="OK" onPress={handleCloseSuccessModal} color="#800080" />
                    </View>
                </View>
            </Modal>

            {/* Details Modal */}
            <Modal
                transparent={true}
                visible={showDetailsModal}
                onRequestClose={handleCloseDetailsModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Contact Details</Text>
                        {selectedContact && (
                            <>
                                <Text>Name: {selectedContact.name}</Text>
                                <Text>Number: {selectedContact.num}</Text>
                                <Text>Type: {selectedContact.type}</Text>
                                <Text>Username: {selectedContact.username}</Text>
                            </>
                        )}
                        <Button title="Close" onPress={handleCloseDetailsModal} color="grey" />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f8f8f8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    contactInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    actions: {
        flexDirection: 'row',
    },
    actionText: {
        color: '#007bff',
        marginHorizontal: 8,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    input: {
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 8,
        marginBottom: 12,
    },
});

export default Contacts;
