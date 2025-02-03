import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Button, Alert, Modal, Text, TextInput, Switch } from 'react-native';
import MapView, { Marker, Circle, Callout } from 'react-native-maps';
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
  const [zones, setZones] = useState([]);
  const [showZones, setShowZones] = useState(false);
  const [userAddress, setUserAddress] = useState(null);

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

      // Fetch locations
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

      // Create the real location
      await axios.post(
        `${config.API_BASE_URL}/nav/realloc/add`,
        createRealLocPayload,
        { headers: { Authorization: token } }
      );

      // Fetch the latest real location to get its ID
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

      // Fetch user's contacts
      const contactsResponse = await axios.get(
        `${config.API_BASE_URL}/users/contacts`,
        { headers: { Authorization: token } }
      );

      // Get all contact IDs
      const contactIds = contactsResponse.data.map(contact => contact.id);

      // Create the distress entry
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
        user_id: Number(userId)
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
        loc_id: selectedLocation,
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
      console.log('All locations:', response.data.map(loc => ({
        id: loc.id,
        name: loc.name,
        coordinates: loc.coordinates
      })));
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
  

  // Get address from coordinates and find matching location
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

  // Fetch address when modal opens
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

  // Function to fetch zones
  const fetchZones = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${config.API_BASE_URL}/zones/zones`, {
        headers: { Authorization: token }
      });
      
      // Use Set to get unique location names
      const uniqueZones = [...new Set(response.data.zones.map(zone => zone.location_name))];
      console.log('Danger Zones:', uniqueZones);
      
      setZones(response.data.zones || []);
      
      if (locations.length === 0) {
        fetchLocations();
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  // Add useEffect to fetch zones when toggle is on
  useEffect(() => {
    if (showZones) {
      fetchZones();
    }
  }, [showZones]);

  // Add useEffect to update address when location changes
  useEffect(() => {
    const updateUserAddress = async () => {
      if (userLocation) {
        const details = await getLocationFromCoordinates(
          userLocation.latitude,
          userLocation.longitude
        );
        setUserAddress(details?.address);
      }
    };
    updateUserAddress();
  }, [userLocation]);

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
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>Current Location</Text>
                <Text style={styles.calloutText}>
                  {userAddress || 'Fetching address...'}
                </Text>
              </View>
            </Callout>
          </Marker>
        )}

        {showZones && zones.map(zone => {
          const location = locations.find(loc => 
            loc.name.toLowerCase() === zone.location_name.toLowerCase()
          );
          if (location && location.coordinates) {
            const totalCount = zone.distress_count + zone.report_count;
            const baseOpacity = 0.1;
            const maxOpacity = 0.5;
            const opacity = Math.min(baseOpacity + (totalCount * 0.05), maxOpacity);

            return (
              <React.Fragment key={zone.id}>
                <Circle
                  center={{
                    latitude: parseFloat(location.coordinates.x),
                    longitude: parseFloat(location.coordinates.y)
                  }}
                  radius={100}
                  fillColor={
                    zone.type === 'Danger Zone' 
                      ? `rgba(255, 0, 0, ${opacity})`
                      : `rgba(0, 255, 0, ${opacity})`
                  }
                  strokeColor={
                    zone.type === 'Danger Zone'
                      ? `rgba(255, 0, 0, ${opacity + 0.2})`
                      : `rgba(0, 255, 0, ${opacity + 0.2})`
                  }
                  strokeWidth={2}
                />
                <Marker
                  coordinate={{
                    latitude: parseFloat(location.coordinates.x),
                    longitude: parseFloat(location.coordinates.y)
                  }}
                  opacity={0}
                >
                  <Callout>
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutTitle}>{zone.location_name}</Text>
                      <Text style={styles.calloutText}>
                        Distress Signals: {zone.distress_count}
                      </Text>
                      <Text style={styles.calloutText}>
                        Reports: {zone.report_count}
                      </Text>
                    </View>
                  </Callout>
                </Marker>
              </React.Fragment>
            );
          }
          return null;
        })}
      </MapView>

      {/* Distress Log Modal */}
      <Modal
        visible={distressModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeDistressModal}
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
                title="Submit" 
                onPress={closeDistressModal} 
                color="#800080" 
              />
              <Button 
                title="Cancel" 
                onPress={() => {
                  setDistressModalVisible(false);
                  setDistressInput('');
                }} 
                color="#999" 
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

      {/* Zones Toggle switch */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Show Zones</Text>
        <Switch
          value={showZones}
          onValueChange={setShowZones}
          trackColor={{ false: "#767577", true: "#800080" }}
          thumbColor={showZones ? "#fff" : "#f4f3f4"}
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
  toggleContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    padding: 3,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toggleLabel: {
    marginRight: 8,
    fontSize: 14,
    color: '#333',
  },
  calloutContainer: {
    width: 150,
    padding: 8,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  calloutText: {
    fontSize: 12,
    color: '#666',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10
  },
});

export default MapComponent;