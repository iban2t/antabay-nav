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
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportInput, setReportInput] = useState(''); // Report description
  const [addressInput, setAddressInput] = useState(''); // Address field
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locations, setLocations] = useState([]);

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

  const handleReportSubmit = async () => {
    if (!reportInput || !addressInput || !selectedLocation) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
  
      const reportPayload = {
        type: 'Suspicious Activity',
        user_report: reportInput,
        address: addressInput,
        loc_id: selectedLocation,
      };
  
      await axios.post(`${config.API_BASE_URL}/nav/report/add`, reportPayload, {
        headers: { Authorization: token },
      });
  
      Alert.alert('Report Submitted', 'Thank you for your report.');
      setReportModalVisible(false);
      setReportInput('');
      setAddressInput('');
      setSelectedLocation('');
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report.');
    }
  };
  

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

      {/* Report Modal */}
      <Modal
        visible={reportModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report Suspicious Activity</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter report description..."
              value={reportInput}
              onChangeText={setReportInput}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter address..."
              value={addressInput}
              onChangeText={setAddressInput}
            />
            <Picker
              selectedValue={selectedLocation}
              onValueChange={(itemValue) => setSelectedLocation(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Location" value="" />
              {locations.map((location) => (
                <Picker.Item key={location.id} label={location.name} value={location.id} />
              ))}
            </Picker>
            <Button title="Submit Report" onPress={handleReportSubmit} color="#F0AD4E" />
            <Button title="Cancel" onPress={() => setReportModalVisible(false)} color="#999" />
          </View>
        </View>
      </Modal>

      <View style={styles.buttonContainer}>
        <Button
          title={distressActive ? 'Cancel' : 'Distress'}
          onPress={() => setDistressActive(!distressActive)}
          color={distressActive ? '#999' : '#D9534F'}
        />
        <Button
          title="Report"
          onPress={() => {
            setReportModalVisible(true);
            fetchLocations();
          }}
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
  picker: { height: 40, marginBottom: 12 },
});

export default MapComponent;
