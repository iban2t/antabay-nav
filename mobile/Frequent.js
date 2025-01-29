import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Button,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from './config';
import Icon from 'react-native-vector-icons/MaterialIcons';

function Frequent() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLocationFormData, setCreateLocationFormData] = useState({
    description: '',
    name: '',
    address: '',
    loc_id: '',
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const [freqRes, locRes] = await Promise.all([
          axios.get(`${config.API_BASE_URL}/users/freq`, {
            headers: { Authorization: token },
          }),
          axios.get(`${config.API_BASE_URL}/nav/loc`, {
            headers: { Authorization: token },
          }),
        ]);
        setData(freqRes.data);
        setFilteredData(freqRes.data);
        setLocations(locRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchLocations();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text) {
      const filtered = data.filter((item) =>
        item.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

  const handleCreateLocation = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${config.API_BASE_URL}/users/freq/add`, createLocationFormData, {
        headers: { Authorization: token },
      });
      const res = await axios.get(`${config.API_BASE_URL}/users/freq`, {
        headers: { Authorization: token },
      });
      setData(res.data);
      setFilteredData(res.data);
      setShowCreateModal(false);
      setCreateLocationFormData({
        description: '',
        name: '',
        address: '',
        loc_id: '',
      });
      Alert.alert('Success', 'Location added successfully!');
    } catch (error) {
      console.error('Error adding location:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.name}</Text>
      </View>
      <Text style={styles.address}>{item.address}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Frequent Locations</Text>
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <Text style={styles.noDataText}>No frequent locations found</Text>
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => Alert.alert('Add Location', 'Add location functionality coming soon')}
      >
        <Icon name="add" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Create Location Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Frequent Location</Text>
            <TextInput
              placeholder="Name"
              value={createLocationFormData.name}
              onChangeText={(text) =>
                setCreateLocationFormData({ ...createLocationFormData, name: text })
              }
              style={styles.input}
            />
            <TextInput
              placeholder="Address"
              value={createLocationFormData.address}
              onChangeText={(text) =>
                setCreateLocationFormData({ ...createLocationFormData, address: text })
              }
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              value={createLocationFormData.description}
              onChangeText={(text) =>
                setCreateLocationFormData({
                  ...createLocationFormData,
                  description: text,
                })
              }
              style={styles.input}
            />
            <Picker
              selectedValue={createLocationFormData.loc_id}
              onValueChange={(itemValue) =>
                setCreateLocationFormData({ ...createLocationFormData, loc_id: itemValue })
              }
              style={styles.picker}
            >
              <Picker.Item label="Select Location" value="" />
              {locations.map((location) => (
                <Picker.Item key={location.id} label={location.name} value={location.id} />
              ))}
            </Picker>
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setShowCreateModal(false)} color="#6c757d" />
              <Button title="Save" onPress={handleCreateLocation} color="#800080" />
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
    backgroundColor: '#f8f8f8',
    padding: 10,
    paddingBottom: 70,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'left',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#6c757d',
  },
  noDataText: {
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 20,
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
