import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Button, Alert, Modal, Text, TextInput, Switch, Platform } from 'react-native';
import MapView, { Marker, Circle, Callout } from 'react-native-maps';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import markerIcon from '../assets/marker.png';
import distressIcon from '../assets/distress.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from '../config';
import SendSMS from 'react-native-sms';
import { decode } from 'base-64';

const POLICE_STATIONS = [
  {
    id: 'ps1',
    name: 'Naga City Police Station 1 (Central)',
    latitude: 13.6196,
    longitude: 123.1944
  },
  {
    id: 'ps2',
    name: 'Naga City Police Station 2 (Tinago)',
    latitude: 13.6278,
    longitude: 123.1946
  },
  {
    id: 'ps3',
    name: 'Naga City Police Station 3 (Concepcion Pequeña)',
    latitude: 13.6334,
    longitude: 123.1927
  },
  {
    id: 'ps4',
    name: 'Naga City Police Station 4 (San Felipe)',
    latitude: 13.6178,
    longitude: 123.1833
  },
  {
    id: 'ps5',
    name: 'Naga City Police Station 5 (Pacol)',
    latitude: 13.6486,
    longitude: 123.2144
  },
  {
    id: 'ps6',
    name: 'Naga City Police Station 6 (Concepcion Grande)',
    latitude: 13.6269,
    longitude: 123.2016
  },
  {
    id: 'ps7',
    name: 'Naga City Police Station 7 (Tabuco)',
    latitude: 13.6205,
    longitude: 123.2001
  },
  {
    id: 'ps8',
    name: 'Naga City Police Office (Main Headquarters)',
    latitude: 13.6198,
    longitude: 123.1947
  }
];

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
  const [contacts, setContacts] = useState([]);

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

  // Add this function to decode JWT token
  const decodeToken = (token) => {
    try {
      return JSON.parse(decode(token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Add the Philippine number formatting function
  const formatPhilippineNumber = (number) => {
    if (!number) return null;
    
    // Convert to string and remove all non-numeric characters
    let cleaned = number.toString().replace(/\D/g, '');
    
    // Remove leading 0 if present
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // Remove 63 if it's at the start
    if (cleaned.startsWith('63')) {
      cleaned = cleaned.substring(2);
    }
    
    // Check if we have a valid 10-digit number
    if (cleaned.length !== 10) {
      console.log('Invalid number length:', cleaned.length);
      return null;
    }
    
    // Add +63 prefix
    return `+63${cleaned}`;
  };

  //Update the sendDistressSMS function
  const sendDistressSMS = async (location, address) => {
    try {
      console.log('Starting SMS process...');
      
      const { token } = await fetchAuthDetails();
      const decodedToken = decodeToken(token);
      console.log('Decoded token:', decodedToken);

      // Fetch user details using the userId from token
      const userResponse = await axios.get(
        `${config.API_BASE_URL}/users/users/${decodedToken.userId}`,
        { headers: { Authorization: token } }
      );
      const userName = userResponse.data?.name || decodedToken?.username || 'Unknown User';
      console.log('User name:', userName);

      console.log('Fetching contacts...');
      const contactsResponse = await axios.get(
        `${config.API_BASE_URL}/users/contacts`,
        { headers: { Authorization: token } }
      );
      console.log('Contacts fetched:', contactsResponse.data);

      // Format phone numbers with Philippine format
      const contactNumbers = contactsResponse.data
        .map(contact => formatPhilippineNumber(contact.num))
        .filter(num => num);
      
      console.log('Formatted contact numbers:', contactNumbers);

      if (contactNumbers.length === 0) {
        console.log('No valid contact numbers found');
        Alert.alert('Error', 'No valid contact numbers found. Please check contact phone numbers.');
        return false;
      }

      const message = `DISTRESS ALERT!\n\n` +
        `From: ${userName}\n` +
        `Location: ${address || 'Unknown'}\n` +
        `Coordinates: ${location.latitude}, ${location.longitude}\n` +
        `Google Maps: https://www.google.com/maps?q=${location.latitude},${location.longitude}\n\n` +
        `This is an automated distress signal. Please contact emergency services if needed.`;
      
      console.log('Message prepared:', message);
      console.log('Starting to send SMS to contacts...');

      for (const phoneNumber of contactNumbers) {
        try {
          console.log('Sending SMS to:', phoneNumber);
          await new Promise((resolve, reject) => {
            SendSMS.send({
              body: message,
              recipients: [phoneNumber],
              successTypes: ['sent', 'queued'],
              allowAndroidSendWithoutReadPermission: true
            }, (completed, cancelled, error) => {
              console.log('SMS callback:', { completed, cancelled, error });
              if (completed) {
                resolve('sent');
              } else if (cancelled) {
                reject(new Error('SMS cancelled'));
              } else if (error) {
                reject(new Error(error));
              }
            });
          });
          console.log('SMS sent successfully to:', phoneNumber);
        } catch (err) {
          console.error(`Failed to send SMS to ${phoneNumber}:`, err);
        }
      }

      Alert.alert('Success', 'Distress signal sent to all contacts');
      return true;

    } catch (error) {
      console.error('Error in SMS process:', error);
      Alert.alert('Error', 'Failed to send distress SMS');
      return false;
    }
  };

  //Modify handleDistressPress to include SMS
  const handleDistressPress = async () => {
    console.log('Distress button pressed');
    
    if (!userLocation) {
      console.log('No user location available');
      Alert.alert('Error', 'Location not available');
      return;
    }

    if (distressActive) {
      console.log('Deactivating distress');
      // Show distress log modal when deactivating
      setDistressModalVisible(true);
      return;
    }

    try {
      // Set distress active first
      console.log('Activating distress state');
      setDistressActive(true);

      console.log('Getting location details...');
      const locationDetails = await getLocationFromCoordinates(
        userLocation.latitude,
        userLocation.longitude
      );
      console.log('Location details:', locationDetails);

      // Send SMS after distress is activated
      console.log('Attempting to send SMS...');
      const smsSent = await sendDistressSMS(userLocation, locationDetails?.address);
      console.log('SMS send result:', smsSent);

      if (smsSent) {
        console.log('SMS sent successfully, creating real-time location entry');
        const { token } = await fetchAuthDetails();
        
        const createRealLocPayload = {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          loc_id: locationDetails?.locationId || null
        };
        console.log('Real location payload:', createRealLocPayload);

        // Create the real location
        const realLocResponse = await axios.post(
          `${config.API_BASE_URL}/nav/realloc/add`,
          createRealLocPayload,
          { headers: { Authorization: token } }
        );
        console.log('Real location created:', realLocResponse.data);

        // Fetch the latest real location to get its ID
        const latestResponse = await axios.get(
          `${config.API_BASE_URL}/nav/realloc-latest`,
          { headers: { Authorization: token } }
        );
        console.log('Latest real location:', latestResponse.data);

        if (latestResponse.data && latestResponse.data.data) {
          setRealLocationId(latestResponse.data.data.id);
          setLocationDetails(locationDetails);
          console.log('Distress process completed successfully');
        }
      } else {
        console.log('SMS sending failed, deactivating distress');
        setDistressActive(false);
        Alert.alert('Error', 'Failed to send distress signals. The distress state has been deactivated.');
      }
    } catch (error) {
      console.error('Error in distress process:', error);
      setDistressActive(false);
      Alert.alert('Error', 'Failed to process distress signal. The distress state has been deactivated.');
    }
  };

  const closeDistressModal = async () => {
    if (!distressInput) {
      Alert.alert('Error', 'Please enter a description.');
      return;
    }

    try {
      const { token } = await fetchAuthDetails();

      // Fetch user's contacts
      const contactsResponse = await axios.get(
        `${config.API_BASE_URL}/users/contacts`,
        { headers: { Authorization: token } }
      );

      const contactIds = contactsResponse.data.map(contact => contact.id);

      const distressPayload = {
        description: distressInput,
        real_id: realLocationId,
        contact_ids: contactIds
      };

      await axios.post(
        `${config.API_BASE_URL}/nav/distress/add`,
        distressPayload,
        { headers: { Authorization: token } }
      );

      setDistressModalVisible(false);
      setDistressInput('');
      setDistressActive(false); // Turn off distress after saving log
    } catch (error) {
      console.error('Error creating distress entry:', error.response?.data || error);
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
      const { token } = await fetchAuthDetails();
  
      const reportPayload = {
        user_report: reportInput,
        address: addressInput,
        loc_id: selectedLocation,
        report_at: new Date().toISOString(),
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
      console.error('Error fetching locations:', error.response?.data || error.message);
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
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (result.length > 0) {
        const address = result[0];
        
        const addressString = [
          address.street,
          address.district,
          address.city,
          address.region
        ].filter(Boolean).join(', ');

        const matchingLocation = locations.find(loc => 
          addressString.toLowerCase().includes(loc.name.toLowerCase()) ||
          loc.name.toLowerCase().includes(address.street?.toLowerCase() || '') ||
          loc.name.toLowerCase().includes(address.district?.toLowerCase() || '')
        );

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
      setZones(response.data.zones || []);
      
      if (locations.length === 0) {
        fetchLocations();
      }
    } catch (error) {
      console.error('Error fetching zones:', error.response?.data || error.message);
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

  // Add generateZoneData function back
  const generateZoneData = () => {
    return zones.map(zone => {
      if (zone.latitude && zone.longitude) {
        const distressCount = parseInt(zone.distress_count) || 0;
        const reportCount = parseInt(zone.report_count) || 0;
        const totalCount = distressCount + reportCount;
        
        const baseOpacity = 0.1;
        const maxOpacity = 0.5;
        const opacity = Math.min(baseOpacity + (totalCount * 0.05), maxOpacity);

        return {
          id: zone.id,
          name: zone.location_name,
          coordinate: {
            latitude: parseFloat(zone.latitude),
            longitude: parseFloat(zone.longitude)
          },
          type: zone.type,
          distressCount,
          reportCount,
          opacity
        };
      }
      return null;
    }).filter(Boolean);
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

        {showZones && generateZoneData().map(zoneData => (
          <React.Fragment key={zoneData.id}>
            <Circle
              center={zoneData.coordinate}
              radius={100}
              fillColor={
                zoneData.type === 'Danger Zone'
                  ? `rgba(255, 0, 0, ${zoneData.opacity})`
                  : `rgba(0, 255, 0, ${zoneData.opacity})`
              }
              strokeColor={
                zoneData.type === 'Danger Zone'
                  ? `rgba(255, 0, 0, ${zoneData.opacity + 0.2})`
                  : `rgba(0, 255, 0, ${zoneData.opacity + 0.2})`
              }
              strokeWidth={2}
            />
            <Marker
              coordinate={zoneData.coordinate}
              opacity={0}
            >
              <Callout>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{zoneData.name}</Text>
                  <Text style={styles.calloutText}>
                    Distress Signals: {zoneData.distressCount}
                  </Text>
                  <Text style={styles.calloutText}>
                    Reports: {zoneData.reportCount}
                  </Text>
                </View>
              </Callout>
            </Marker>
          </React.Fragment>
        ))}

        {/* Police Station Markers */}
        {POLICE_STATIONS.map(station => (
          <Marker
            key={station.id}
            coordinate={{
              latitude: station.latitude,
              longitude: station.longitude
            }}
            onPress={() => {
              Alert.alert(
                station.name,
                'Police Station',
                [{ text: 'OK', onPress: () => {} }]
              );
            }}
          >
            <View style={styles.policeMarker}>
              <View style={styles.policeMarkerInner} />
            </View>
          </Marker>
        ))}
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
  policeMarker: {
    width: 20,
    height: 20,
    backgroundColor: '#007BFF',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  policeMarkerInner: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#007BFF',
  }
});

export default MapComponent;