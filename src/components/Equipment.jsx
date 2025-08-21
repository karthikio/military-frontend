import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { equipmentAPI } from '../services/api';
import './Equipment.css';

const Equipment = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    unit: '',
    status: 'all'
  });
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    unit: 'unit',
    active: true
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadEquipment();
  }, [searchTerm]);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      setError('');
      const params = searchTerm ? { q: searchTerm } : {};
      const response = await equipmentAPI.list(params);
      if (response.ok) {
        setEquipment(response.items || []);
      } else {
        setError('Failed to load equipment');
      }
    } catch (error) {
      console.error('Error loading equipment:', error);
      setError('Error loading equipment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const equipmentData = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category.trim(),
        unit: formData.unit.trim() || 'unit',
        active: formData.active
      };

      const response = await equipmentAPI.create(equipmentData);
      if (response.ok) {
        setShowAddForm(false);
        resetForm();
        loadEquipment();
      } else {
        setError(response.error || 'Failed to create equipment');
      }
    } catch (error) {
      console.error('Error creating equipment:', error);
      setError('Failed to create equipment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      category: item.category || '',
      unit: item.unit || 'unit',
      active: item.active
    });
    setShowEditForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const updateData = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        unit: formData.unit.trim() || 'unit',
        active: formData.active
      };

      const response = await equipmentAPI.update(editingItem.code, updateData);
      if (response.ok) {
        setShowEditForm(false);
        setEditingItem(null);
        resetForm();
        loadEquipment();
      } else {
        setError(response.error || 'Failed to update equipment');
      }
    } catch (error) {
      console.error('Error updating equipment:', error);
      setError('Failed to update equipment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm(`Are you sure you want to delete equipment ${code}?`)) return;
    
    try {
      setLoading(true);
      const response = await equipmentAPI.delete(code);
      if (response.ok) {
        loadEquipment();
      } else {
        setError(response.error || 'Failed to delete equipment');
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
      setError('Failed to delete / equipment in use. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      category: '',
      unit: 'unit',
      active: true
    });
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      unit: '',
      status: 'all'
    });
    setSearchTerm('');
  };

  const getFilteredEquipment = () => {
    return equipment.filter(item => {
      if (filters.category && item.category !== filters.category) return false;
      if (filters.unit && item.unit !== filters.unit) return false;
      if (filters.status === 'active' && !item.active) return false;
      if (filters.status === 'inactive' && item.active) return false;
      return true;
    });
  };

  const getUniqueCategories = () => {
    return [...new Set(equipment.map(item => item.category).filter(Boolean))];
  };

  const getUniqueUnits = () => {
    return [...new Set(equipment.map(item => item.unit))];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="equipment-container">
        <div className="access-denied">
          <i className="material-icons access-denied-icon">block</i>
          <h2>Access Denied</h2>
          <p>Only administrators can manage equipment catalog.</p>
        </div>
      </div>
    );
  }

  const filteredEquipment = getFilteredEquipment();

  return (
    <div className="equipment-container">
      <div className="equipment-header">
        <div className="header-content">
          <h1>Equipment Catalog</h1>
          <p>Manage military equipment types and specifications</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="add-button"
          disabled={loading}
        >
          <i className="material-icons">add</i>
          <span>Add Equipment</span>
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <i className="material-icons error-icon">error</i>
          <span>{error}</span>
          <button 
            onClick={() => setError('')}
            className="error-close"
          >
            <i className="material-icons">close</i>
          </button>
        </div>
      )}

      <div className="controls-section">
        <div className="search-wrapper">
          <div className="search-input-wrapper">
            <i className="material-icons search-icon">search</i>
            <input
              type="text"
              placeholder="Search equipment by code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="clear-search"
              >
                <i className="material-icons">clear</i>
              </button>
            )}
          </div>
        </div>

        <div className="filters-wrapper">
          <div className="filter-group">
            <i className="material-icons filter-icon">category</i>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {getUniqueCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <i className="material-icons filter-icon">straighten</i>
            <select
              value={filters.unit}
              onChange={(e) => handleFilterChange('unit', e.target.value)}
              className="filter-select"
            >
              <option value="">All Units</option>
              {getUniqueUnits().map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <i className="material-icons filter-icon">visibility</i>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          <button 
            onClick={clearFilters}
            className="clear-filters-btn"
            title="Clear all filters"
          >
            <i className="material-icons">clear_all</i>
          </button>
        </div>
      </div>

      <div className="equipment-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="material-icons">inventory</i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{filteredEquipment.length}</div>
            <div className="stat-label">Total Equipment</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <i className="material-icons">check_circle</i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{filteredEquipment.filter(item => item.active).length}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon inactive">
            <i className="material-icons">cancel</i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{filteredEquipment.filter(item => !item.active).length}</div>
            <div className="stat-label">Inactive</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="material-icons">category</i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{new Set(filteredEquipment.map(item => item.category).filter(Boolean)).size}</div>
            <div className="stat-label">Categories</div>
          </div>
        </div>
      </div>

      <div className="equipment-list">
        {loading && equipment.length === 0 ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <span>Loading equipment...</span>
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="no-data">
            <i className="material-icons no-data-icon">inventory_2</i>
            <h3>No Equipment Found</h3>
            <p>
              {equipment.length === 0 
                ? "Create your first equipment type to get started"
                : "No equipment matches your current filters"
              }
            </p>
            {equipment.length === 0 ? (
              <button 
                onClick={() => setShowAddForm(true)}
                className="add-button-secondary"
              >
                <i className="material-icons">add</i>
                Add First Equipment
              </button>
            ) : (
              <button 
                onClick={clearFilters}
                className="add-button-secondary"
              >
                <i className="material-icons">clear_all</i>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="equipment-table desktop-only">
              <div className="table-header">
                <div className="table-cell">Code</div>
                <div className="table-cell">Name</div>
                <div className="table-cell">Category</div>
                <div className="table-cell">Unit</div>
                <div className="table-cell">Status</div>
                <div className="table-cell">Created</div>
                <div className="table-cell">Actions</div>
              </div>
              
              {filteredEquipment.map(item => (
                <div key={item.code} className="table-row">
                  <div className="table-cell">
                    <span className="equipment-code">{item.code}</span>
                  </div>
                  <div className="table-cell">
                    <div className="equipment-name">{item.name}</div>
                  </div>
                  <div className="table-cell">
                    <div className="equipment-category">
                      {item.category || 'Uncategorized'}
                    </div>
                  </div>
                  <div className="table-cell">
                    <span className="equipment-unit">{item.unit}</span>
                  </div>
                  <div className="table-cell">
                    <span className={`status-badge ${item.active ? 'status-active' : 'status-inactive'}`}>
                      <i className="material-icons">{item.active ? 'check_circle' : 'cancel'}</i>
                      {item.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="table-cell">
                    <div className="date-info">{formatDate(item.createdAt)}</div>
                  </div>
                  <div className="table-cell">
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(item)}
                        className="edit-button"
                        disabled={loading}
                        title="Edit equipment"
                      >
                        <i className="material-icons">edit</i>
                      </button>
                      <button
                        onClick={() => handleDelete(item.code)}
                        className="delete-button"
                        disabled={loading}
                        title="Delete equipment"
                      >
                        <i className="material-icons">delete</i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="equipment-cards mobile-only">
              {filteredEquipment.map(item => (
                <div key={item.code} className="equipment-card">
                  <div className="card-header">
                    <span className="equipment-code">{item.code}</span>
                    <span className={`status-badge ${item.active ? 'status-active' : 'status-inactive'}`}>
                      <i className="material-icons">{item.active ? 'check_circle' : 'cancel'}</i>
                    </span>
                  </div>
                  <div className="card-content">
                    <h4 className="equipment-name">{item.name}</h4>
                    <div className="card-details">
                      <div className="detail-item">
                        <i className="material-icons">category</i>
                        <span>{item.category || 'Uncategorized'}</span>
                      </div>
                      <div className="detail-item">
                        <i className="material-icons">straighten</i>
                        <span>{item.unit}</span>
                      </div>
                      <div className="detail-item">
                        <i className="material-icons">schedule</i>
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button
                      onClick={() => handleEdit(item)}
                      className="edit-button"
                      disabled={loading}
                    >
                      <i className="material-icons">edit</i>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.code)}
                      className="delete-button"
                      disabled={loading}
                    >
                      <i className="material-icons">delete</i>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Equipment</h3>
              <button 
                onClick={() => {setShowAddForm(false); resetForm();}}
                className="close-button"
              >
                <i className="material-icons">close</i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="equipment-form">
              <div className="form-group">
                <label>Equipment Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  required
                  placeholder="e.g., RIFLE_556, FIRST_AID_KIT"
                  pattern="[A-Z0-9_]+"
                  title="Use only A-Z, 0-9, and underscore"
                  maxLength="30"
                />
                <small>Format: A-Z, 0-9, and underscore only</small>
              </div>

              <div className="form-group">
                <label>Equipment Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g., Rifle 5.56mm, First Aid Kit"
                  maxLength="100"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="e.g., Weapons, Medical, Communication"
                  maxLength="50"
                />
              </div>

              <div className="form-group">
                <label>Unit of Measurement</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                >
                  <option value="unit">Unit</option>
                  <option value="piece">Piece</option>
                  <option value="set">Set</option>
                  <option value="box">Box</option>
                  <option value="kg">Kilogram</option>
                  <option value="meter">Meter</option>
                  <option value="liter">Liter</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  />
                  <span>Active (available for use)</span>
                </label>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => {setShowAddForm(false); resetForm();}}
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
                  {loading ? 'Creating...' : 'Create Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditForm && editingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Equipment: {editingItem.code}</h3>
              <button 
                onClick={() => {setShowEditForm(false); setEditingItem(null); resetForm();}}
                className="close-button"
              >
                <i className="material-icons">close</i>
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="equipment-form">
              <div className="form-group">
                <label>Equipment Code</label>
                <input
                  type="text"
                  value={formData.code}
                  disabled
                  className="disabled-input"
                />
                <small>Equipment code cannot be changed</small>
              </div>

              <div className="form-group">
                <label>Equipment Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g., Rifle 5.56mm, First Aid Kit"
                  maxLength="100"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="e.g., Weapons, Medical, Communication"
                  maxLength="50"
                />
              </div>

              <div className="form-group">
                <label>Unit of Measurement</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                >
                  <option value="unit">Unit</option>
                  <option value="piece">Piece</option>
                  <option value="set">Set</option>
                  <option value="box">Box</option>
                  <option value="kg">Kilogram</option>
                  <option value="meter">Meter</option>
                  <option value="liter">Liter</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  />
                  <span>Active (available for use)</span>
                </label>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => {setShowEditForm(false); setEditingItem(null); resetForm();}}
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
                  {loading ? 'Updating...' : 'Update Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipment;
