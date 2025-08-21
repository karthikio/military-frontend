import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { purchaseAPI } from '../services/api';
import BaseSelect from './BaseSelect';
import EquipmentSelect from './EquipmentSelect';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';
import './Purchases.css';

const Purchases = () => {
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [formData, setFormData] = useState({
    baseCode: user?.role === 'admin' ? '' : user?.baseCode || '',
    equipmentCode: '',
    quantity: '',
    purchasedAt: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [filters, setFilters] = useState({
    equipmentCode: '',
    from: '',
    to: '',
    base: user?.role === 'admin' ? '' : user?.baseCode || ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadPurchases();
  }, [filters]);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filters.equipmentCode) params.equipmentCode = filters.equipmentCode;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.base && user?.role === 'admin') params.base = filters.base;

      const response = await purchaseAPI.list(params);
      if (response.ok) {
        setPurchases(response.items || []);
      } else {
        setError('Failed to load purchases');
      }
    } catch (error) {
      console.error('Error loading purchases:', error);
      setError('Error loading purchases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const purchaseData = {
        ...formData,
        quantity: parseInt(formData.quantity, 10),
        purchasedAt: new Date(formData.purchasedAt).toISOString()
      };

      const response = await purchaseAPI.create(purchaseData);
      if (response.ok) {
        setShowAddForm(false);
        resetForm();
        loadPurchases();
        showToast('Purchase added successfully', 'success');
      } else {
        setError(response.error || 'Failed to create purchase');
      }
    } catch (error) {
      console.error('Error creating purchase:', error);
      setError('Failed to create purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      baseCode: user?.role === 'admin' ? '' : user?.baseCode || '',
      equipmentCode: '',
      quantity: '',
      purchasedAt: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      equipmentCode: '',
      from: '',
      to: '',
      base: user?.role === 'admin' ? '' : user?.baseCode || ''
    });
    setSearchTerm('');
  };

  const showNoteModal = (note) => {
    setSelectedNote(note);
  };

  const getFilteredPurchases = () => {
    return purchases.filter(purchase => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          purchase.equipmentCode.toLowerCase().includes(term) ||
          purchase.baseCode.toLowerCase().includes(term) ||
          purchase.createdByName.toLowerCase().includes(term) ||
          (purchase.notes && purchase.notes.toLowerCase().includes(term))
        );
      }
      return true;
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTotalQuantity = () => {
    return getFilteredPurchases().reduce((sum, purchase) => sum + purchase.quantity, 0);
  };

  const getTotalValue = () => {
    return getFilteredPurchases().length;
  };

  const getThisMonthPurchases = () => {
    const thisMonth = new Date();
    return getFilteredPurchases().filter(purchase => {
      const purchaseDate = new Date(purchase.purchasedAt);
      return purchaseDate.getMonth() === thisMonth.getMonth() && 
             purchaseDate.getFullYear() === thisMonth.getFullYear();
    }).length;
  };

  const filteredPurchases = getFilteredPurchases();

  return (
    <div className="purchases-container">
      <Toast toast={toast} onClose={hideToast} />
      
      <div className="purchases-header">
        <div className="header-content">
          <h1>Equipment Purchases</h1>
          <p>Track and manage equipment procurement records</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="add-button"
          disabled={loading}
        >
          <i className="material-icons">add</i>
          <span>Add Purchase</span>
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
              placeholder="Search purchases..."
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
          {user?.role === 'admin' && (
            <div className="filter-group">
              <i className="material-icons filter-icon">business</i>
              <BaseSelect
                name="base"
                value={filters.base}
                onChange={handleFilterChange}
                placeholder="All Bases"
                className="filter-select"
              />
            </div>
          )}

          <div className="filter-group">
            <i className="material-icons filter-icon">inventory</i>
            <EquipmentSelect
              name="equipmentCode"
              value={filters.equipmentCode}
              onChange={handleFilterChange}
              placeholder="All Equipment"
              className="filter-select"
            />
          </div>

          <div className="filter-group">
            <i className="material-icons filter-icon">date_range</i>
            <input
              type="date"
              name="from"
              value={filters.from}
              onChange={handleFilterChange}
              className="filter-select"
              title="From Date"
            />
          </div>

          <div className="filter-group">
            <i className="material-icons filter-icon">date_range</i>
            <input
              type="date"
              name="to"
              value={filters.to}
              onChange={handleFilterChange}
              className="filter-select"
              title="To Date"
            />
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

      <div className="purchases-stats">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-number">{getTotalValue()}</div>
            <div className="stat-label">Total Purchases</div>
          </div>
          <div className="stat-icon">
            <i className="material-icons">shopping_cart</i>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-number">{getTotalQuantity()}</div>
            <div className="stat-label">Total Quantity</div>
          </div>
          <div className="stat-icon">
            <i className="material-icons">inventory_2</i>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-number">{getThisMonthPurchases()}</div>
            <div className="stat-label">This Month</div>
          </div>
          <div className="stat-icon">
            <i className="material-icons">calendar_today</i>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-number">
              {new Set(filteredPurchases.map(p => p.baseCode)).size}
            </div>
            <div className="stat-label">Active Bases</div>
          </div>
          <div className="stat-icon">
            <i className="material-icons">business</i>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Purchase</h3>
              <button 
                onClick={() => {setShowAddForm(false); resetForm();}}
                className="close-button"
              >
                <i className="material-icons">close</i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="purchase-form">
              {user?.role === 'admin' && (
                <div className="form-group">
                  <label>Base Code</label>
                  <BaseSelect
                    value={formData.baseCode}
                    onChange={(e) => setFormData({...formData, baseCode: e.target.value})}
                    required
                    placeholder="Select Base"
                  />
                </div>
              )}
              
              <div className="form-group">
                <label>Equipment</label>
                <EquipmentSelect
                  value={formData.equipmentCode}
                  onChange={(e) => setFormData({...formData, equipmentCode: e.target.value})}
                  required
                  placeholder="Select Equipment"
                />
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  required
                  min="1"
                  placeholder="Enter quantity"
                />
              </div>

              <div className="form-group">
                <label>Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchasedAt}
                  onChange={(e) => setFormData({...formData, purchasedAt: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                  placeholder="Additional notes (optional)"
                />
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
                  {loading ? 'Creating...' : 'Add Purchase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedNote && (
        <div className="modal-overlay">
          <div className="note-modal">
            <div className="note-header">
              <h3>Purchase Notes</h3>
              <button 
                onClick={() => setSelectedNote(null)}
                className="close-button"
              >
                <i className="material-icons">close</i>
              </button>
            </div>
            <div className="note-content">
              <p>{selectedNote}</p>
            </div>
          </div>
        </div>
      )}

      <div className="purchases-list">
        {loading && purchases.length === 0 ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <span>Loading purchases...</span>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="no-data">
            <i className="material-icons no-data-icon">shopping_cart</i>
            <h3>No Purchases Found</h3>
            <p>
              {purchases.length === 0 
                ? "No equipment purchases have been recorded yet"
                : "No purchases match your current search or filters"
              }
            </p>
            {purchases.length === 0 ? (
              <button 
                onClick={() => setShowAddForm(true)}
                className="add-button-secondary"
              >
                <i className="material-icons">add</i>
                Add First Purchase
              </button>
            ) : (
              <button 
                onClick={clearFilters}
                className="add-button-secondary"
              >
                <i className="material-icons">clear_all</i>
                Clear Search & Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="purchases-table desktop-only">
              <div className="table-header">
                <div className="table-cell">Date</div>
                <div className="table-cell">Base</div>
                <div className="table-cell">Equipment</div>
                <div className="table-cell">Quantity</div>
                <div className="table-cell">Created By</div>
              </div>
              
              {filteredPurchases.map(purchase => (
                <div key={purchase._id} className="table-row">
                  <div className="table-cell">
                    <div className="date-info">{formatDate(purchase.purchasedAt)}</div>
                  </div>
                  <div className="table-cell">
                    <span className="base-code">{purchase.baseCode}</span>
                  </div>
                  <div className="table-cell">
                    <div className="equipment-info">
                      <span className="equipment-name">{purchase.equipmentCode}</span>
                      {purchase.notes && (
                        <button 
                          className="note-button"
                          onClick={() => showNoteModal(purchase.notes)}
                          title="View notes"
                        >
                          <i className="material-icons">info</i>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="table-cell">
                    <span className="quantity">{purchase.quantity}</span>
                  </div>
                  <div className="table-cell">
                    <div className="creator-info">{purchase.createdByName}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="purchases-cards mobile-only">
              {filteredPurchases.map(purchase => (
                <div key={purchase._id} className="purchase-card">
                  <div className="card-header">
                    <span className="base-code">{purchase.baseCode}</span>
                    <span className="date-info">{formatDate(purchase.purchasedAt)}</span>
                  </div>
                  <div className="card-content">
                    <div className="equipment-row">
                      <h4 className="equipment-name">{purchase.equipmentCode}</h4>
                      {purchase.notes && (
                        <button 
                          className="note-button"
                          onClick={() => showNoteModal(purchase.notes)}
                          title="View notes"
                        >
                          <i className="material-icons">info</i>
                        </button>
                      )}
                    </div>
                    <div className="card-details">
                      <div className="detail-item">
                        <i className="material-icons">inventory_2</i>
                        <span>Quantity: {purchase.quantity}</span>
                      </div>
                      <div className="detail-item">
                        <i className="material-icons">person</i>
                        <span>By: {purchase.createdByName}</span>
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

export default Purchases;
