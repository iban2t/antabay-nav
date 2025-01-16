import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from '../assets/marker.png';

function MapComponent() {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const watchUserLocation = () => {
      if (navigator.geolocation) {
        const id = navigator.geolocation.watchPosition(
          position => {
            const { latitude, longitude } = position.coords;
            setUserLocation([latitude, longitude]);
          },
          error => {
            console.error('Error getting user location:', error);
            // Handle specific errors (e.g., permission denied)
          }
        );
        return id; // Return the watch ID
      } else {
        console.error('Geolocation is not supported by this browser.');
        return null;
      }
    };
  
    const watchId = watchUserLocation(); // Start watching user location
  
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId); // Clear the watch when component unmounts
      }
    };
  }, []);// Empty dependency array to run useEffect once on component mount

  const customIcon = L.icon({
    iconUrl: markerIcon,
    iconSize: [38, 38],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });

  // Determine map center based on userLocation
  let mapCenter = userLocation; // Default center

  if (!userLocation) {
    // Use the default center if location is not available
    mapCenter = [13.6218, 123.1948];
  }

  return (
    <MapContainer center={mapCenter} zoom={15} style={{ height: "100vh", width: "100vw" }}>
      <TileLayer
        attribution='<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />

      {userLocation && (
        <Marker position={userLocation} icon={customIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

export default MapComponent;
