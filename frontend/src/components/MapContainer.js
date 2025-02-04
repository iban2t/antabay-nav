import React, { useState, useEffect } from 'react';
import ReactMapGL, { Marker, Source, Layer, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import config from '../config';
import markerIcon from '../assets/marker.png';
import axios from 'axios';

function MapComponent() {
  const [userLocation, setUserLocation] = useState(null);
  const [viewport, setViewport] = useState({
    latitude: 13.6218,
    longitude: 123.1948,
    zoom: 15
  });
  const [showZones, setShowZones] = useState(false);
  const [zones, setZones] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [hoveredZone, setHoveredZone] = useState(null);
  const [cursorPosition, setCursorPosition] = useState(null);

  // Fetch zones and locations
  useEffect(() => {
    const fetchZonesAndLocations = async () => {
      try {
        const token = localStorage.getItem('token');
        const [zonesRes, locationsRes] = await Promise.all([
          axios.get(`${config.REACT_APP_API_BASE_URL}/zones/zones`, {
            headers: { Authorization: token }
          }),
          axios.get(`${config.REACT_APP_API_BASE_URL}/nav/loc`, {
            headers: { Authorization: token }
          })
        ]);
        setZones(zonesRes.data.zones);
        setLocations(locationsRes.data);
      } catch (error) {
        console.error('Error fetching zones and locations:', error);
      }
    };

    fetchZonesAndLocations();
  }, []);

  // Add function to get address from coordinates
  const getLocationFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${config.REACT_APP_MAPBOX}`
      );
      if (response.data.features && response.data.features.length > 0) {
        return response.data.features[0].place_name;
      }
      return 'Address not found';
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Error fetching address';
    }
  };

  // Generate heatmap data with circle layer instead of heatmap
  const generateZoneData = () => {
    return {
      type: 'FeatureCollection',
      features: zones.map(zone => {
        const location = locations.find(loc => 
          loc.name.toLowerCase() === zone.location_name.toLowerCase()
        );
        if (location && location.coordinates) {
          // Ensure we have valid numbers for the counts
          const distressCount = parseInt(zone.distress_count) || 0;
          const reportCount = parseInt(zone.report_count) || 0;
          const totalCount = distressCount + reportCount;
          
          // Calculate opacity
          const baseOpacity = 0.1;
          const maxOpacity = 0.5;
          const opacity = Math.min(baseOpacity + (totalCount * 0.05), maxOpacity);

          // Parse coordinates and ensure they're in the correct order (longitude, latitude)
          const longitude = parseFloat(location.coordinates.y);
          const latitude = parseFloat(location.coordinates.x);

          // Only create feature if coordinates are valid numbers
          if (!isNaN(longitude) && !isNaN(latitude)) {
            return {
              type: 'Feature',
              properties: {
                name: zone.location_name,
                distressCount: distressCount,
                reportCount: reportCount,
                totalCount: totalCount,
                opacity: opacity,
                zoneType: zone.type
              },
              geometry: {
                type: 'Point',
                coordinates: [longitude, latitude] // Mapbox expects [longitude, latitude]
              }
            };
          }
        }
        return null;
      }).filter(Boolean)
    };
  };

  // Circle layer style
  const circleLayer = {
    id: 'zones',
    type: 'circle',
    paint: {
      'circle-radius': 50,
      'circle-color': [
        'case',
        ['==', ['get', 'zoneType'], 'Danger Zone'],
        '#ff0000',
        '#00ff00'
      ],
      'circle-opacity': ['get', 'opacity'],
      'circle-stroke-width': 2,
      'circle-stroke-color': [
        'case',
        ['==', ['get', 'zoneType'], 'Danger Zone'],
        'rgba(255, 0, 0, 0.7)',
        'rgba(0, 255, 0, 0.7)'
      ]
    }
  };

  // Update the handleZoneHover function
  const handleZoneHover = (event) => {
    if (event && event.features && event.features.length > 0) {
      const feature = event.features[0];
      if (feature.geometry && feature.geometry.coordinates) {
        const { coordinates } = feature.geometry;
        const { name, distressCount, reportCount } = feature.properties;
        
        // Only set hoveredZone if we have valid coordinates
        if (coordinates && coordinates.length === 2) {
          setHoveredZone({
            longitude: coordinates[0],
            latitude: coordinates[1],
            name,
            distressCount,
            reportCount
          });
        }
      }
    } else {
      setHoveredZone(null);
    }
  };

  // Fix user location tracking
  useEffect(() => {
    const watchUserLocation = () => {
      if (navigator.geolocation) {
        const id = navigator.geolocation.watchPosition(
          async position => {
            const { latitude, longitude } = position.coords;
            const newLocation = { latitude, longitude };
            setUserLocation(newLocation);
            setViewport(prev => ({
              ...prev,
              ...newLocation
            }));
            const address = await getLocationFromCoordinates(latitude, longitude);
            setUserAddress(address);
          },
          error => {
            console.error('Error getting user location:', error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
          }
        );
        return id;
      }
      return null;
    };

    const watchId = watchUserLocation();
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Add this after the state declarations
  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.REACT_APP_API_BASE_URL}/nav/loc`, {
        headers: { Authorization: token }
      });
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  // Add this useEffect to fetch locations when component mounts
  useEffect(() => {
    fetchLocations();
  }, []);

  // Function to fetch zones
  const fetchZones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.REACT_APP_API_BASE_URL}/zones/zones`, {
        headers: { Authorization: token }
      });
      
      // Use Set to get unique location names for debugging
      const uniqueZones = [...new Set(response.data.zones.map(zone => zone.location_name))];
      console.log('Danger Zones:', uniqueZones);
      
      setZones(response.data.zones || []);
      
      // Fetch locations if we don't have them yet
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

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <div className="toggle-container">
        <label className="toggle-label">
          Show Zones
          <input
            type="checkbox"
            checked={showZones}
            onChange={(e) => setShowZones(e.target.checked)}
          />
        </label>
      </div>

      <ReactMapGL
        {...viewport}
        width="100%"
        height="100%"
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={config.REACT_APP_MAPBOX}
        onMove={evt => setViewport(evt.viewState)}
        onMouseMove={showZones ? handleZoneHover : undefined}
        onMouseLeave={() => setHoveredZone(null)}
        interactiveLayerIds={showZones ? ['zones'] : []}
        cursor={hoveredZone ? 'pointer' : 'grab'}
      >
        {userLocation && (
          <Marker 
            latitude={userLocation.latitude}
            longitude={userLocation.longitude}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedLocation({
                ...userLocation,
                name: 'Current Location',
                address: userAddress
              });
            }}
          >
            <img src={markerIcon} alt="marker" style={{ width: '38px', height: '38px', cursor: 'pointer' }} />
          </Marker>
        )}

        {showZones && (
          <Source type="geojson" data={generateZoneData()}>
            <Layer {...circleLayer} />
          </Source>
        )}

        {selectedLocation && (
          <Popup
            latitude={selectedLocation.latitude}
            longitude={selectedLocation.longitude}
            closeButton={true}
            closeOnClick={false}
            onClose={() => setSelectedLocation(null)}
            anchor="bottom"
          >
            <div className="popup-content">
              <h3>{selectedLocation.name}</h3>
              {selectedLocation.address && (
                <p>{selectedLocation.address}</p>
              )}
            </div>
          </Popup>
        )}

        {hoveredZone && (
          <Popup
            latitude={hoveredZone.latitude}
            longitude={hoveredZone.longitude}
            closeButton={false}
            closeOnClick={false}
          >
            <div className="popup-content">
              <h3>{hoveredZone.name}</h3>
              <p>Distress Signals: {hoveredZone.distressCount}</p>
              <p>Reports: {hoveredZone.reportCount}</p>
            </div>
          </Popup>
        )}
      </ReactMapGL>

      <style jsx>{`
        .toggle-container {
          position: absolute;
          top: 70px;
          right: 10px;
          z-index: 1;
          background: white;
          padding: 8px;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .toggle-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #333;
          cursor: pointer;
        }
        input[type="checkbox"] {
          cursor: pointer;
        }
        .popup-content {
          padding: 8px;
          max-width: 200px;
        }
        .popup-content h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: bold;
        }
        .popup-content p {
          margin: 4px 0;
          font-size: 14px;
        }
        .hover-popup {
          background: white;
          padding: 8px 12px;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          pointer-events: none;
          z-index: 1000;
        }
        .hover-popup h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: bold;
        }
        .hover-popup p {
          margin: 2px 0;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}

export default MapComponent;
