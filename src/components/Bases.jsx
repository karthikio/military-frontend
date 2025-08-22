import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { baseAPI } from '../services/api';
import './Bases.css';

const Bases = () => {
  const { user } = useAuth();
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    baseCode: '',
    location: { lat: '', lng: '' }
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadBases();
  }, []);

  const loadBases = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await baseAPI.list();
      if (response.ok) {
        setBases(response.items || []);
      } else {
        setError('Failed to load bases');
      }
    } catch (error) {
      console.error('Error loading bases:', error);
      setError('Error loading bases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const baseCodePattern = /^[A-Z0-9_]+$/;
      if (!baseCodePattern.test(formData.baseCode.trim())) {
        setError('Base code must contain only A-Z, 0-9, and underscore');
        return;
      }

      const baseData = {
        baseCode: formData.baseCode.trim().toUpperCase(),
        location: formData.location.lat && formData.location.lng ? {
          lat: parseFloat(formData.location.lat),
          lng: parseFloat(formData.location.lng)
        } : null
      };

      const response = await baseAPI.create(baseData);
      if (response.ok) {
        setShowAddForm(false);
        setFormData({
          baseCode: '',
          location: { lat: '', lng: '' }
        });
        loadBases();
      } else {
        setError(response.error || 'Failed to create base');
      }
    } catch (error) {
      console.error('Error creating base:', error);
      setError('Failed to create base. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (baseCode) => {
    if (!window.confirm(`Are you sure you want to delete base ${baseCode}?`)) return;
    
    try {
      setLoading(true);
      const response = await baseAPI.delete(baseCode);
      if (response.ok) {
        loadBases();
      } else {
        setError(response.error || 'Failed to delete base');
      }
    } catch (error) {
      console.error('Error deleting base:', error);
      setError('Failed to delete / base in use. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatLocation = (location) => {
    if (!location || typeof location !== 'object') {
      return 'Not specified';
    }
    
    const lat = location.lat;
    const lng = location.lng;
    
    if (lat === null || lat === undefined || lng === null || lng === undefined) {
      return 'Not specified';
    }
    
    const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
    const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
    
    if (isNaN(latNum) || isNaN(lngNum)) {
      return 'Invalid coordinates';
    }
    
    return `${latNum.toFixed(4)}, ${lngNum.toFixed(4)}`;
  };

  const hasValidCoordinates = (location) => {
    if (!location || typeof location !== 'object') return false;
    
    const lat = location.lat;
    const lng = location.lng;
    
    if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
    
    const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
    const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
    
    return !isNaN(latNum) && !isNaN(lngNum);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="bases-container">
        <div className="access-denied">
          <i className="material-icons access-denied-icon">block</i>
          <h2>Access Denied</h2>
          <p>Only administrators can manage military bases.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bases-container">
      <div className="bases-header">
        <div className="header-content">
          <h2>Base Management</h2>
          <p>Manage military installation locations and coordinates</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="add-button"
          disabled={loading}
        >
          <i className="material-icons">add</i>
          Add Base
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <i className="material-icons error-icon">warning</i>
          <span>{error}</span>
          <button 
            onClick={() => setError('')}
            className="error-close"
          >
            <i className="material-icons">close</i>
          </button>
        </div>
      )}

      <div className="bases-stats">
        <div className="stat-card">
          <div className="stat-number">{bases.length}</div>
          <div className="stat-label">Total Bases</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {bases.filter(b => hasValidCoordinates(b.location)).length}
          </div>
          <div className="stat-label">With Coordinates</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {bases.filter(b => !hasValidCoordinates(b.location)).length}
          </div>
          <div className="stat-label">No Coordinates</div>
        </div>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Military Base</h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="close-button"
              >
                <i className="material-icons">close</i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="base-form">
              <div className="form-group">
                <label>Base Code *</label>
                <input
                  type="text"
                  value={formData.baseCode}
                  onChange={(e) => setFormData({...formData, baseCode: e.target.value})}
                  required
                  placeholder="e.g., BASE_A, HQ_001, CAMP_BRAVO"
                  pattern="[A-Z0-9_]+"
                  title="Use only A-Z, 0-9, and underscore"
                  maxLength="20"
                />
                <small>Format: A-Z, 0-9, and underscore only</small>
              </div>

              <div className="form-group">
                <label>Geographic Location (Optional)</label>
                <div className="location-inputs">
                  <div className="coordinate-input">
                    <input
                      type="number"
                      step="any"
                      min="-90"
                      max="90"
                      value={formData.location.lat}
                      onChange={(e) => setFormData({
                        ...formData, 
                        location: {...formData.location, lat: e.target.value}
                      })}
                      placeholder="Latitude"
                    />
                    <small>Latitude (-90 to 90)</small>
                  </div>
                  <div className="coordinate-input">
                    <input
                      type="number"
                      step="any"
                      min="-180"
                      max="180"
                      value={formData.location.lng}
                      onChange={(e) => setFormData({
                        ...formData, 
                        location: {...formData.location, lng: e.target.value}
                      })}
                      placeholder="Longitude"
                    />
                    <small>Longitude (-180 to 180)</small>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="cancel-button"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Base'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bases-list">
        {loading && bases.length === 0 ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <span>Loading military bases...</span>
          </div>
        ) : bases.length === 0 ? (
          <div className="no-data">
            <i className="material-icons no-data-icon">business</i>
            <h3>No Bases Found</h3>
            <p>Create your first military base to get started</p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="add-button-secondary"
            >
              <i className="material-icons">add</i>
              Add First Base
            </button>
          </div>
        ) : (
          <>
            <div className="desktop-table">
              <div className="bases-table">
                <div className="table-header">
                  <div className="table-cell">Base Code</div>
                  <div className="table-cell">Coordinates</div>
                  <div className="table-cell">Created</div>
                  <div className="table-cell">Actions</div>
                </div>
                
                {bases.map(base => (
                  <div key={base.baseCode} className="table-row">
                    <div className="table-cell">
                      <div className="base-info">
                        <span className="base-code">{base.baseCode}</span>
                        <div className="base-status">
                          {hasValidCoordinates(base.location) ? (
                            <span className="status-located">Located</span>
                          ) : (
                            <span className="status-pending">No coordinates</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="table-cell">
                      <div className="location-display">
                        {formatLocation(base.location)}
                      </div>
                    </div>
                    <div className="table-cell">
                      <div className="date-info">
                        {formatDate(base.createdAt)}
                      </div>
                    </div>
                    <div className="table-cell">
                      <div className="action-buttons">
                        <button
                          onClick={() => handleDelete(base.baseCode)}
                          className="delete-button"
                          disabled={loading}
                          title="Delete base"
                        >
                          <i className="material-icons">delete</i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mobile-cards">
              {bases.map(base => (
                <div key={base.baseCode} className="base-card">
                  <div className="card-header">
                    <div className="base-info">
                      <span className="base-code">{base.baseCode}</span>
                      <div className="base-status">
                        {hasValidCoordinates(base.location) ? (
                          <span className="status-located">Located</span>
                        ) : (
                          <span className="status-pending">No coordinates</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(base.baseCode)}
                      className="delete-button"
                      disabled={loading}
                      title="Delete base"
                    >
                      <i className="material-icons">delete</i>
                    </button>
                  </div>
                  
                  <div className="card-content">
                    <div className="info-row">
                      <div className="info-label">
                        <i className="material-icons">place</i>
                        Coordinates
                      </div>
                      <div className="location-display">
                        {formatLocation(base.location)}
                      </div>
                    </div>
                    
                    <div className="info-row">
                      <div className="info-label">
                        <i className="material-icons">schedule</i>
                        Created
                      </div>
                      <div className="date-info">
                        {formatDate(base.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Bases;
