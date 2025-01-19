import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Button, Alert, Modal, Text, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import markerIcon from '../assets/marker.png';
import distressIcon from '../assets/distress.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from '../config';

const MapComponent = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [distressActive, setDistressActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalInput, setModalInput] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locations, setLocations] = useState([]);
  const [realLocationId, setRealLocationId] = useState(null);
  const [reallocationId, setReallocationId] = useState(null);

  useEffect(() => {
    const fetchRealLocation = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`${config.API_BASE_URL}/nav/realloc/latest`, {
          headers: { Authorization: token },
        });

        if (response.data) {
          setRealLocationId(response.data);
          setReallocationId(response.data.id);
        } else {
          console.log('No real location found.');
        }
      } catch (error) {
        console.error('Error fetching real location:', error);
      }
    };

    if (distressActive) {
      fetchRealLocation();
    }
  }, [distressActive]);

  useEffect(() => {
    const getLocationAsync = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required for this feature.');
        return;
      }

      const locationSubscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 10 },
        ({ coords: { latitude, longitude } }) => {
          setUserLocation({ latitude, longitude });
        }
      );

      return () => locationSubscription.remove();
    };

    getLocationAsync();
  }, []);

  const mapCenter = userLocation || { latitude: 13.6218, longitude: 123.1948 };

  const handleDistressPress = async () => {
    const newDistressState = !distressActive;
    setDistressActive(newDistressState);

    if (newDistressState) {
      try {
        Alert.alert('Distress Activated', 'Distress sent to contacts.');

        if (userLocation && realLocationId) {
          const token = await AsyncStorage.getItem('token');
          const userId = await AsyncStorage.getItem('userId');

          const distressPayload = {
            description: modalInput,
            user_id: userId,
            distress_at: new Date().toISOString(),
            real_id: realLocationId,
          };

          await axios.post(`${config.API_BASE_URL}/nav/distress/add`, distressPayload, {
            headers: { Authorization: token },
          });

          console.log('Distress data sent to the server.');
        } else {
          Alert.alert('Error', 'Unable to fetch location or real location ID.');
        }
      } catch (error) {
        console.error('Error while sending distress signal:', error);
        Alert.alert('Error', 'Failed to send distress signal.');
      }
    } else {
      setModalVisible(true);
    }
  };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`${config.API_BASE_URL}/nav/loc`, {
          headers: { Authorization: token },
        });
        setLocations(response.data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    if (modalVisible) fetchLocations();
  }, [modalVisible]);

  const handleLocationSelect = async (locationId) => {
    setSelectedLocation(locationId);

    if (reallocationId) {
      try {
        const token = await AsyncStorage.getItem('token');

        const reallocationPayload = {
          loc_id: locationId,
        };

        await axios.put(`${config.API_BASE_URL}/nav/realloc/${reallocationId}`, reallocationPayload, {
          headers: { Authorization: token },
        });

        console.log(`Reallocation record updated with loc_id: ${locationId}`);
      } catch (error) {
        console.error('Error updating reallocation record:', error);
      }
    } else {
      console.log('No reallocation record found to update');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalInput('');
    setSelectedLocation('');
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: mapCenter.latitude,
          longitude: mapCenter.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {userLocation && (
          <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.8 }}>
            <Image
              source={distressActive ? distressIcon : markerIcon}
              style={styles.marker}
            />
          </Marker>
        )}
      </MapView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Distress Log</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter distress description..."
              value={modalInput}
              onChangeText={setModalInput}
            />
            <Picker
              selectedValue={selectedLocation}
              onValueChange={handleLocationSelect}
              style={styles.picker}
            >
              <Picker.Item label="Select Location" value="" />
              {locations.map((location) => (
                <Picker.Item key={location.id} label={location.name} value={location.id} />
              ))}
            </Picker>
            <Button title="Submit" onPress={closeModal} color="#800080" />
          </View>
        </View>
      </Modal>

      <View style={styles.buttonContainer}>
        <Button
          title={distressActive ? 'Cancel' : 'Distress'}
          onPress={handleDistressPress}
          color={distressActive ? '#999' : '#D9534F'}
        />
        <Button
          title="Report"
          onPress={() => Alert.alert('Report Suspicious Activity')}
          color="#F0AD4E"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  marker: { width: 38, height: 38, resizeMode: 'contain' },
  buttonContainer: {
    position: 'absolute',
    bottom: 70,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 65,
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

export default MapComponent;
