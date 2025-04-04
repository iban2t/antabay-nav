import React, { useState, useEffect } from 'react';
import ReactMapGL, { Marker, Source, Layer, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import config from '../config';
import markerIcon from '../assets/marker.png';
import axios from 'axios';

const POLICE_STATIONS = [
  {
    id: 'ps1',
    name: 'Naga City Police Station 1 (Central Police Station)',
    latitude: 13.6196,
    longitude: 123.1944
  },
  {
    id: 'ps2',
    name: 'Naga City Police Station 2 (Tinago)',
    latitude: 13.6252,
    longitude: 123.1965
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
    latitude: 13.6177,
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
    name: 'Naga City Police Office Headquarters',
    latitude: 13.6198,
    longitude: 123.1947
  }
];

const Legend = ({ showZones }) => (
  <div className="legend-container">
    <h3 className="legend-title">Map Legend</h3>
    <div className="legend-item">
      <img src={markerIcon} alt="location" className="legend-icon" />
      <span className="legend-text">Your Location</span>
    </div>
    <div className="legend-item">
      <div className="legend-icon distress-icon" />
      <span className="legend-text">Distress Signal</span>
    </div>
    <div className="legend-item">
      <div className="legend-icon police-icon" />
      <span className="legend-text">Police Station</span>
    </div>
    {showZones && (
      <>
        <div className="legend-item">
          <div className="legend-icon danger-zone" />
          <span className="legend-text">Danger Zone</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon safe-zone" />
          <span className="legend-text">Safe Zone</span>
        </div>
      </>
    )}
  </div>
);

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
      <Legend showZones={showZones} />
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

        {/* Police Station Markers */}
        {POLICE_STATIONS.map(station => (
          <Marker
            key={station.id}
            latitude={station.latitude}
            longitude={station.longitude}
            anchor="center"
          >
            <div 
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#007BFF',
                border: '2px solid white',
                borderRadius: '50%',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
              onClick={() => {
                setSelectedLocation({
                  latitude: station.latitude,
                  longitude: station.longitude,
                  name: station.name,
                  type: 'police'
                });
              }}
            />
          </Marker>
        ))}

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
              {selectedLocation.type === 'police' ? (
                <p>Police Station</p>
              ) : (
                selectedLocation.address && <p>{selectedLocation.address}</p>
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
        .legend-container {
          position: absolute;
          top: 70px;
          left: 10px;
          background: white;
          padding: 12px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          z-index: 1;
        }
        .legend-title {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: bold;
          color: #333;
        }
        .legend-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        .legend-icon {
          width: 24px;
          height: 24px;
          margin-right: 8px;
        }
        .legend-text {
          font-size: 12px;
          color: #666;
        }
        .police-icon {
          width: 20px;
          height: 20px;
          background-color: #007BFF;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .danger-zone {
          width: 20px;
          height: 20px;
          background-color: rgba(255, 0, 0, 0.3);
          border: 1px solid #666;
          border-radius: 50%;
        }
        .safe-zone {
          width: 20px;
          height: 20px;
          background-color: rgba(0, 255, 0, 0.3);
          border: 1px solid #666;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}

export default MapComponent;
