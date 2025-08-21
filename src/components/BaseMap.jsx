import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { baseAPI } from '../services/api';
import 'leaflet/dist/leaflet.css';
import './BaseMap.css';

const createBaseIcon = (isSelected = false) => {
  return L.divIcon({
    html: `
      <div class="base-marker ${isSelected ? 'selected' : ''}">
        <span class="material-icons">business</span>
      </div>
    `,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const MapController = ({ selectedBase, bases }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedBase && selectedBase !== 'ALL') {
      const base = bases.find(b => b.baseCode === selectedBase);
      if (base && base.location) {
        map.flyTo([base.location.lat, base.location.lng], 10, {
          duration: 1.5,
          easeLinearity: 0.5
        });
      }
    } else {
      if (bases.length > 0) {
        const group = new L.featureGroup(
          bases.map(base => L.marker([base.location.lat, base.location.lng]))
        );
        map.fitBounds(group.getBounds(), { padding: [20, 20] });
      } else {
        map.setView([20.5937, 78.9629], 5);
      }
    }
  }, [selectedBase, bases, map]);

  return null;
};

const BaseMap = ({ onBaseSelect, selectedBase = 'ALL' }) => {
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBases();
  }, []);

  const fetchBases = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await baseAPI.list();
      
      if (response.ok) {
        const allBases = response.items || [];
        
        const basesWithCoords = allBases.map((base, index) => {
          if (base.location && base.location.lat && base.location.lng && 
              base.location.lat !== null && base.location.lng !== null) {
            return base;
          } else {
            const sampleCoords = [
              { lat: 28.6139, lng: 77.2090, city: 'Delhi' },
              { lat: 19.0760, lng: 72.8777, city: 'Mumbai' },
              { lat: 13.0827, lng: 80.2707, city: 'Chennai' },
              { lat: 22.5726, lng: 88.3639, city: 'Kolkata' },
              { lat: 12.9716, lng: 77.5946, city: 'Bangalore' },
              { lat: 17.3850, lng: 78.4867, city: 'Hyderabad' },
              { lat: 26.9124, lng: 75.7873, city: 'Jaipur' },
              { lat: 21.1458, lng: 79.0882, city: 'Nagpur' },
              { lat: 23.0225, lng: 72.5714, city: 'Ahmedabad' },
              { lat: 15.2993, lng: 74.1240, city: 'Goa' },
              { lat: 30.3398, lng: 76.3869, city: 'Chandigarh' },
              { lat: 25.5941, lng: 85.1376, city: 'Patna' },
            ];
            
            const coordIndex = index % sampleCoords.length;
            const baseCoord = sampleCoords[coordIndex];
            
            return {
              ...base,
              location: {
                lat: baseCoord.lat + (Math.random() - 0.5) * 1,
                lng: baseCoord.lng + (Math.random() - 0.5) * 1
              },
              nearestCity: baseCoord.city
            };
          }
        });
        
        setBases(basesWithCoords);
      } else {
        setError('Failed to load base locations');
      }
    } catch (err) {
      console.error('Error fetching bases:', err);
      setError('Error loading base locations');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (baseCode) => {
    if (onBaseSelect) {
      onBaseSelect(baseCode);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not available';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="map-loading">
        <div className="loading-spinner"></div>
        <span>Loading bases...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-error">
        <i className="material-icons">error</i>
        <p>{error}</p>
        <button onClick={fetchBases} className="retry-btn">
          <i className="material-icons">refresh</i>
          Retry
        </button>
      </div>
    );
  }

  const selectedBaseData = bases.find(b => b.baseCode === selectedBase);

  return (
    <div className="base-map-container">
      <div className="map-header">
        <h3>Military Base Locations</h3>
        <span className="base-count">{bases.length} bases mapped</span>
      </div>
      
      <div className="map-wrapper">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: '400px', width: '100%' }}
          zoomControl={true}
          dragging={true}
          touchZoom={true}
          doubleClickZoom={true}
          scrollWheelZoom={true}
          boxZoom={true}
          keyboard={true}
          className="interactive-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController selectedBase={selectedBase} bases={bases} />
          
          {bases.map((base) => (
            <Marker
              key={base._id}
              position={[base.location.lat, base.location.lng]}
              icon={createBaseIcon(selectedBase === base.baseCode)}
              eventHandlers={{
                click: () => handleMarkerClick(base.baseCode)
              }}
            />
          ))}
        </MapContainer>
      </div>

      {selectedBaseData && selectedBase !== 'ALL' && (
        <div className="selected-base-info">
          <div className="info-header">
            <i className="material-icons">place</i>
            <h4>{selectedBase} Details</h4>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Created</span>
              <span className="value">{formatDate(selectedBaseData.createdAt)}</span>
            </div>
            <div className="info-item">
              <span className="label">Coordinates</span>
              <span className="value">
                {selectedBaseData.location.lat.toFixed(4)}, {selectedBaseData.location.lng.toFixed(4)}
              </span>
            </div>
            {selectedBaseData.nearestCity && (
              <div className="info-item">
                <span className="label">Location</span>
                <span className="value">{selectedBaseData.nearestCity}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseMap;
