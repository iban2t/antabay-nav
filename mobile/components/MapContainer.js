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
  const [distressModalVisible, setDistressModalVisible] = useState(false);
  const [distressInput, setDistressInput] = useState('');
  const [realLocationId, setRealLocationId] = useState(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportInput, setReportInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locations, setLocations] = useState([]);
  const [locationDetails, setLocationDetails] = useState(null);

  //Fetch logged in user credentials
  const fetchAuthDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      return { token };
    } catch (error) {
      console.error('Error fetching auth details:', error);
      Alert.alert('Error', 'Authentication failed. Please login again.');
      throw error;
    }
  };

  //Start tracking user
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

  //Distress Functionality
  const handleDistressPress = async () => {
    if (distressActive) {
      setDistressModalVisible(true);
      return;
    }
  
    if (!userLocation) {
      Alert.alert('Error', 'Unable to fetch location.');
      return;
    }
  
    try {
      const { token } = await fetchAuthDetails();

      // First, fetch locations
      const locResponse = await axios.get(`${config.API_BASE_URL}/nav/loc`, {
        headers: { Authorization: token }
      });
      setLocations(locResponse.data);

      // Get location details and find matching location
      const details = await getLocationFromCoordinates(
        userLocation.latitude,
        userLocation.longitude
      );

      // Create real-time location entry with matched location id
      const createRealLocPayload = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        loc_id: details?.locationId || null
      };

      // First create the real location
      await axios.post(
        `${config.API_BASE_URL}/nav/realloc/add`,
        createRealLocPayload,
        { headers: { Authorization: token } }
      );

      // Then fetch the latest real location to get its ID
      const latestResponse = await axios.get(
        `${config.API_BASE_URL}/nav/realloc-latest`,
        { headers: { Authorization: token } }
      );

      if (latestResponse.data && latestResponse.data.data) {
        setRealLocationId(latestResponse.data.data.id);
        setLocationDetails(details);
        setDistressActive(true);
        Alert.alert('Distress Activated', 'Distress sent to contacts.');
      } else {
        throw new Error('Failed to get real location ID');
      }
    } catch (error) {
      console.error('Error creating real location:', error.response?.data || error);
      Alert.alert('Error', 'Failed to activate distress.');
    }
  };

  const closeDistressModal = async () => {
    if (!distressInput) {
      Alert.alert('Error', 'Please enter a description.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      if (!userId) {
        console.error('No userId found in storage');
        Alert.alert('Error', 'User ID not found. Please login again.');
        return;
      }

      // First fetch user's contacts
      const contactsResponse = await axios.get(
        `${config.API_BASE_URL}/users/contacts`,
        { headers: { Authorization: token } }
      );

      // Get all contact IDs
      const contactIds = contactsResponse.data.map(contact => contact.id);

      // Create the distress entry (no need to send user_id as it's in the token)
      const distressPayload = {
        description: distressInput,
        real_id: realLocationId,
        contact_ids: contactIds
      };

      // Log distress details in the required format
      console.log(JSON.stringify({
        description: distressPayload.description,
        real_id: distressPayload.real_id,
        contact_ids: distressPayload.contact_ids,
        user_id: Number(userId) // Just for logging purposes
      }, null, 2));

      const response = await axios.post(
        `${config.API_BASE_URL}/nav/distress/add`,
        distressPayload,
        { headers: { Authorization: token } }
      );

      console.log('Distress response:', response.data);
      setDistressModalVisible(false);
      setDistressInput('');
      setDistressActive(false);
    } catch (error) {
      console.error('Error creating distress entry:', {
        error: error.response?.data || error,
        payload: {
          description: distressInput,
          real_id: realLocationId,
          contactIds: contactIds
        }
      });
      Alert.alert('Error', 'Failed to create distress log.');
    }
  };
  

  //Fetch latest real location for distress log
  useEffect(() => {
    const fetchRealLocation = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`${config.API_BASE_URL}/nav/realloc-latest`, {
          headers: { Authorization: token },
        });

        if (response.data && response.data.data) {
          setRealLocationId(response.data.data.id);
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

  //Report Functionality
  const handleReportSubmit = async () => {
    if (!reportInput || !addressInput || !selectedLocation) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
  
      const reportPayload = {
        user_id: userId,
        user_report: reportInput,
        address: addressInput,
        loc_id: selectedLocation,  // This will be the selected location ID
        report_at: new Date().toISOString(),
      };
  
      // Submit the report with the selected location ID
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
  

  const closeReportModal = () => {
    setReportModalVisible(false);
    setReportInput('');
    setAddressInput('');
    setSelectedLocation('');
  };
  
  //List of locations for dropdown
  const fetchLocations = async () => {
    try {
      const { token } = await fetchAuthDetails();
      const response = await axios.get(`${config.API_BASE_URL}/nav/loc`, {
        headers: { Authorization: token },
      });
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  //Mount fetchLocations when a modal is active
  useEffect(() => {
    if (distressModalVisible || reportModalVisible) {
      fetchLocations();
    }
  }, [distressModalVisible, reportModalVisible]);
  

  // Add this function to get address from coordinates and find matching location
  const getLocationFromCoordinates = async (latitude, longitude) => {
    try {
      // Get address from coordinates using Expo Location
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (result.length > 0) {
        const address = result[0];
        
        // Create a standardized address string
        const addressString = [
          address.street,
          address.district,
          address.city,
          address.region
        ].filter(Boolean).join(', ');

        console.log('Fetched address:', addressString);
        console.log('Available locations:', locations);

        // Find if this address matches any of our listed locations
        const matchingLocation = locations.find(loc => 
          addressString.toLowerCase().includes(loc.name.toLowerCase()) ||
          loc.name.toLowerCase().includes(address.street?.toLowerCase() || '') ||
          loc.name.toLowerCase().includes(address.district?.toLowerCase() || '')
        );

        console.log('Matching location:', matchingLocation);

        if (matchingLocation) {
          return {
            address: addressString,
            locationId: matchingLocation.id,
            locationName: matchingLocation.name
          };
        }

        return {
          address: addressString,
          locationId: null,
          locationName: null
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting location from coordinates:', error);
      return null;
    }
  };

  // Add this effect to fetch address when modal opens
  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (distressModalVisible && userLocation) {
        const details = await getLocationFromCoordinates(
          userLocation.latitude,
          userLocation.longitude
        );
        setLocationDetails(details);
        if (details?.locationId) {
          setSelectedLocation(details.locationId);
        }
      }
    };

    fetchLocationDetails();
  }, [distressModalVisible]);

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

      
      {/* Distress Log Modal */}
      <Modal
        visible={distressModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDistressModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Distress Log</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter distress description..."
              value={distressInput}
              onChangeText={setDistressInput}
            />
            
            <View style={styles.locationDisplay}>
              <Text style={styles.locationLabel}>Current Location:</Text>
              <Text style={styles.locationText}>
                {locationDetails?.address || 'Fetching location...'}
              </Text>
              {locationDetails?.locationName && (
                <>
                  <Text style={styles.locationLabel}>Matched Location:</Text>
                  <Text style={styles.locationText}>
                    {locationDetails.locationName}
                  </Text>
                </>
              )}
            </View>

            <View style={styles.buttonGroup}>
              <Button 
                title="Cancel" 
                onPress={() => {
                  setDistressModalVisible(false);
                  setDistressInput('');
                }} 
                color="#999" 
              />
              <Button 
                title="Submit" 
                onPress={closeDistressModal} 
                color="#800080" 
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Report Modal */}
      <Modal
        visible={reportModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeReportModal}
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
              onValueChange={(itemValue) => setSelectedLocation(itemValue)}  // Ensure state is updated
              style={styles.picker}
            >
              <Picker.Item label="Select Location" value="" />
              {locations.map((location) => (
                <Picker.Item key={location.id} label={location.name} value={location.id} />
              ))}
            </Picker>

            <Button title="Submit Report" onPress={handleReportSubmit} color="#800080" />
            <Button title="Cancel" onPress={() => setReportModalVisible(false)} color="#999" />
          </View>
        </View>
      </Modal>

      <View style={styles.buttonContainer}>
        {/*Distress Button*/}
        <Button 
          title={distressActive ? 'Cancel' : 'Distress'}
          onPress={handleDistressPress}
          color={distressActive ? '#999' : '#D9534F'}
        />
        {/*Report Button*/}
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
    gap: 12
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
  locationDisplay: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
  },
  locationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    marginTop: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10
  },
});

export default MapComponent;