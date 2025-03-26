import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Modal, TouchableOpacity, StyleSheet, Alert, ScrollView, Picker } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import config from './config';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
    const [searchQuery, setSearchQuery] = useState('');

    const navigation = useNavigation();

    useEffect(() => {
        const fetchData = async () => {
            const token = await AsyncStorage.getItem('token');
            try {
                const res = await axios.get(`${config.API_BASE_URL}/users/contacts`, {
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

    // Add phone number formatting function
    const formatPhilippineNumber = (number) => {
        // Remove all non-numeric characters
        let cleaned = number.replace(/\D/g, '');
        
        // Remove leading 0 if present
        if (cleaned.startsWith('0')) {
            cleaned = cleaned.substring(1);
        }
        
        // Remove +63 if present at the start
        if (cleaned.startsWith('63')) {
            cleaned = cleaned.substring(2);
        }
        
        // Add +63 prefix
        return cleaned ? `+63${cleaned}` : '';
    };

    // Update handleContactFormChange for phone number
    const handleContactFormChange = (name, value) => {
        if (name === 'num') {
            // Format phone number as user types
            const formattedNumber = formatPhilippineNumber(value);
            setContactFormData(prev => ({
                ...prev,
                [name]: formattedNumber
            }));
        } else {
            setContactFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Update handleSaveContact validation
    const handleSaveContact = async () => {
        try {
            const token = await AsyncStorage.getItem('token');

            // Validate required fields
            if (!contactFormData.name || !contactFormData.type) {
                Alert.alert('Error', 'Please fill in all required fields');
                return;
            }

            // Validate phone number
            const phoneNumber = contactFormData.num.replace(/\D/g, '');
            if (!phoneNumber.match(/^63\d{10}$/)) {
                Alert.alert(
                    'Invalid Phone Number', 
                    'Please enter a valid Philippine mobile number\n(e.g., +63 999 999 9999)'
                );
                return;
            }

            const processedContactData = {
                ...contactFormData,
                num: contactFormData.num, // Already formatted
                username: contactFormData.username || null
            };

            let response;
            if (editContactId) {
                response = await axios.put(
                    `${config.API_BASE_URL}/users/contacts/${editContactId}`, 
                    processedContactData,
                    { headers: { Authorization: token } }
                );
                Alert.alert('Success', 'Contact updated successfully!');
            } else {
                response = await axios.post(
                    `${config.API_BASE_URL}/users/contacts/add`, 
                    processedContactData,
                    { headers: { Authorization: token } }
                );
                Alert.alert('Success', 'Contact added successfully!');
            }

            // Refresh contacts list
            const res = await axios.get(`${config.API_BASE_URL}/users/contacts`, {
                headers: { Authorization: token }
            });
            const sortedData = res.data.sort((a, b) => a.name.localeCompare(b.name));
            setData(sortedData);

            // Close modals and reset form
            handleCloseCreateModal();
            handleCloseEditModal();
        } catch (error) {
            console.error('Error saving contact:', error.response?.data || error);
            Alert.alert(
                'Error',
                error.response?.data?.error || 'Failed to save contact. Please try again.'
            );
        }
    };
    

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
    };

    const handleDeleteContact = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            await axios.delete(`${config.API_BASE_URL}/users/contacts/${contactToDelete}`, {
                headers: { Authorization: token }
            });
            const res = await axios.get(`${config.API_BASE_URL}/users/contacts`, {
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

    // Update the groupContactsByLetter function
    const groupContactsByLetter = (contacts) => {
        const filtered = contacts
            .filter(contact => 
                contact.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .sort((a, b) => a.name.localeCompare(b.name)); // Sort filtered results
        
        return filtered.reduce((groups, contact) => {
            const firstLetter = contact.name.charAt(0).toUpperCase();
            if (!groups[firstLetter]) {
                groups[firstLetter] = [];
            }
            groups[firstLetter].push(contact);
            return groups;
        }, {});
    };

    // Get avatar background color
    const getAvatarColor = (name) => {
        const colors = ['#DC3545', '#800080', '#FFC107', '#0D6EFD', '#28A745', '#FF8C00'];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    // Add contact type options
    const contactTypes = ['Family', 'Friend', 'Authority', 'Others'];

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="search" size={24} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search contact"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Contacts List */}
            <ScrollView style={styles.contactsList}>
                {Object.entries(groupContactsByLetter(data)).map(([letter, contacts]) => (
                    <View key={letter}>
                        <Text style={styles.sectionHeader}>{letter}</Text>
                        {contacts.map(contact => (
                            <TouchableOpacity
                                key={contact.id}
                                onPress={() => handleShowDetailsModal(contact)}
                                style={styles.contactRow}
                            >
                                <View style={[styles.avatar, { backgroundColor: getAvatarColor(contact.name) }]}>
                                    <Text style={styles.avatarText}>
                                        {contact.name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.contactInfo}>
                                    <Text style={styles.contactName}>{contact.name}</Text>
                                    <Text style={styles.contactType}>{contact.num}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={handleShowCreateModal}
            >
                <Icon name="add" size={24} color="#FFF" />
            </TouchableOpacity>

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
                            placeholder="+63 999 999 9999"
                            value={contactFormData.num}
                            onChangeText={(text) => handleContactFormChange('num', text)}
                            keyboardType="phone-pad"
                            maxLength={13}
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
                            placeholder="+63 999 999 9999"
                            value={contactFormData.num}
                            onChangeText={(text) => handleContactFormChange('num', text)}
                            keyboardType="phone-pad"
                            maxLength={13}
                        />
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={contactFormData.type}
                                style={styles.picker}
                                onValueChange={(value) => handleContactFormChange('type', value)}
                            >
                                <Picker.Item label="Select Type" value="" />
                                {contactTypes.map((type) => (
                                    <Picker.Item key={type} label={type} value={type} />
                                ))}
                            </Picker>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Username (optional)"
                            value={contactFormData.username || ''}
                            onChangeText={(text) => handleContactFormChange('username', text)}
                        />
                        <View style={styles.buttonGroup}>
                            <TouchableOpacity 
                                style={[styles.button, styles.saveButton]} 
                                onPress={handleSaveContact}
                            >
                                <Text style={styles.buttonText}>Save Changes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.button, styles.cancelButton]} 
                                onPress={handleCloseEditModal}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
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
        backgroundColor: '#fff',
        paddingBottom: 70,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
    },
    contactsList: {
        flex: 1,
    },
    sectionHeader: {
        backgroundColor: '#f8f8f8',
        padding: 8,
        paddingLeft: 16,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingLeft: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: 16,
        fontWeight: '500',
    },
    contactType: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 80,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#28A745',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
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
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        marginBottom: 12,
    },
    picker: {
        height: 40,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginHorizontal: 5,
    },
    saveButton: {
        backgroundColor: '#800080',
    },
    cancelButton: {
        backgroundColor: 'grey',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default Contacts;
