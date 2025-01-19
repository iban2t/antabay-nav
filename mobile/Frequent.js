import React, { useEffect, useState } from 'react';
import { View, Text, Button, Modal, TextInput, FlatList, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from './config';

function Frequent() {
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
    
    const navigation = useNavigation();

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const [freqRes, locRes] = await Promise.all([
                    axios.get(`${config.API_BASE_URL}/users/freq`, { headers: { Authorization: token } }),
                    axios.get(`${config.API_BASE_URL}/nav/loc`, { headers: { Authorization: token } })
                ]);
                setData(freqRes.data);
                setLocations(locRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        
        fetchLocations();
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

    const handleCloseDeleteModal = () => setShowDeleteModal(false);

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

    const handleCreateLocationFormChange = (name, value) => {
        setCreateLocationFormData({
            ...createLocationFormData,
            [name]: value
        });
    };

    const handleEditLocationFormChange = (name, value) => {
        setEditLocationFormData({
            ...editLocationFormData,
            [name]: value
        });
    };

    const handleSaveLocation = async (editMode) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const formData = editMode ? editLocationFormData : createLocationFormData;
            if (editMode) {
                await axios.put(`${config.API_BASE_URL}/users/freq/${editLocationId}`, formData, {
                    headers: { 
                        Authorization: token 
                    }
                });
            } else {
                await axios.post(`${config.API_BASE_URL}/users/freq/add`, formData, {
                    headers: { 
                        Authorization: token 
                    }
                });
            }
            const res = await axios.get(`${config.API_BASE_URL}/users/freq`, {
                headers: { 
                    Authorization: token 
                }
            });
            setData(res.data);
            Alert.alert('Success', editMode ? 'Location updated successfully!' : 'Location added successfully!');
            if (editMode) {
                handleCloseEditModal();
            } else {
                handleCloseCreateModal();
            }
            navigation.navigate("Frequent");
        } catch (error) {
            console.error('Error saving location:', error);
        }
    };

    const handleDeleteLocation = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            await axios.delete(`${config.API_BASE_URL}/users/freq/${locationToDelete}`, {
                headers: { 
                    Authorization: token 
                }
            });
            const res = await axios.get(`${config.API_BASE_URL}/users/freq`, {
                headers: { Authorization: token }
            });
            setData(res.data);
            handleCloseDeleteModal();
        } catch (error) {
            console.error('Error deleting location:', error);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={data}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text>ID: {item.id}</Text>
                        <Text>Name: {item.name}</Text>
                        <Text>Address: {item.address}</Text>
                        <Text>Description: {item.description}</Text>
                        <View style={styles.actions}>
                            <Button title="Edit" onPress={() => handleShowEditModal(item)} color="#2196F3" />
                            <Button title="Delete" onPress={() => handleShowDeleteModal(item.id)} color="#F44336" />
                        </View>
                    </View>
                )}
                ListHeaderComponent={() => (
                    <View style={styles.header}>
                        <Text style={styles.title}>Frequent Locations</Text>
                        <Button title="Add" onPress={handleShowCreateModal} color="#4CAF50" />
                    </View>
                )}
                ListFooterComponent={<View style={{ height: 50 }} />}
            />

            {/* Create Frequent Location Modal */}
            <Modal visible={showCreateModal} onRequestClose={handleCloseCreateModal} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New Frequent Location</Text>
                        <TextInput
                            placeholder="Name"
                            value={createLocationFormData.name}
                            onChangeText={(text) => handleCreateLocationFormChange('name', text)}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Address"
                            value={createLocationFormData.address}
                            onChangeText={(text) => handleCreateLocationFormChange('address', text)}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Description"
                            value={createLocationFormData.description}
                            onChangeText={(text) => handleCreateLocationFormChange('description', text)}
                            style={styles.input}
                        />
                        <Picker
                            selectedValue={createLocationFormData.loc_id}
                            onValueChange={(itemValue) => handleCreateLocationFormChange('loc_id', itemValue)}
                            style={styles.picker}
                        >
                        <Picker.Item label="Select Location" value="" />
                            {locations.map(location => (
                                <Picker.Item key={location.id} label={location.name} value={location.id} />
                            ))}
                        </Picker>
                        <View style={styles.modalButtons}>
                            <Button title="Close" onPress={handleCloseCreateModal} color="#6c757d" />
                            <Button title="Save Location" onPress={() => handleSaveLocation(false)} color="#800080" />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit Location Modal */}
            <Modal visible={showEditModal} onRequestClose={handleCloseEditModal} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Frequent Location</Text>
                        <TextInput
                            placeholder="Name"
                            value={editLocationFormData.name}
                            onChangeText={(text) => handleEditLocationFormChange('name', text)}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Address"
                            value={editLocationFormData.address}
                            onChangeText={(text) => handleEditLocationFormChange('address', text)}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Description"
                            value={editLocationFormData.description}
                            onChangeText={(text) => handleEditLocationFormChange('description', text)}
                            style={styles.input}
                        />
                        <Picker
                            selectedValue={editLocationFormData.loc_id}
                            onValueChange={(itemValue) => handleEditLocationFormChange('loc_id', itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select Location" value="" />
                            {locations.map(location => (
                                <Picker.Item key={location.id} label={location.name} value={location.id} />
                            ))}
                        </Picker>
                        <View style={styles.modalButtons}>
                          <Button title="Close" onPress={handleCloseEditModal} color="#6c757d" />
                            <Button title="Update Location" onPress={() => handleSaveLocation(true)} color="#800080" />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Location Modal */}
            <Modal visible={showDeleteModal} onRequestClose={handleCloseDeleteModal} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Delete Frequent Location</Text>
                        <Text>Are you sure you want to delete this frequent location?</Text>
                        <View style={styles.modalButtons}>
                            <Button title="Cancel" onPress={handleCloseDeleteModal} color="#6c757d" />
                            <Button title="Delete" onPress={handleDeleteLocation} color="#F44336" />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    item: {
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#ffffff',
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    button: {
        marginLeft: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginBottom: 15,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    picker: {
        marginBottom: 15,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default Frequent;

