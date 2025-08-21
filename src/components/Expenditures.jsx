import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { expenditureAPI } from '../services/api';
import BaseSelect from './BaseSelect';
import EquipmentSelect from './EquipmentSelect';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';
import './Expenditures.css';

const Expenditures = () => {
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [expenditures, setExpenditures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    baseCode: user?.role === 'admin' ? '' : user?.baseCode || '',
    equipmentCode: '',
    quantity: '',
    kind: 'assignment',
    notes: ''
  });
  const [filters, setFilters] = useState({
    base: user?.role === 'admin' ? '' : user?.baseCode || '',
    equipmentCode: '',
    kind: '',
    from: '',
    to: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadExpenditures();
  }, [filters]);

  const loadExpenditures = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filters.base && user?.role === 'admin') params.base = filters.base;
      if (filters.equipmentCode) params.equipmentCode = filters.equipmentCode;
      if (filters.kind) params.kind = filters.kind;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const response = await expenditureAPI.list(params);
      if (response.ok) {
        setExpenditures(response.items || []);
      } else {
        setError('Failed to load expenditures');
      }
    } catch (error) {
      console.error('Error loading expenditures:', error);
      setError('Error loading expenditures. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const expenditureData = {
        ...formData,
        quantity: parseInt(formData.quantity, 10)
      };

      const response = await expenditureAPI.create(expenditureData);
      if (response.ok) {
        setShowAddForm(false);
        resetForm();
        loadExpenditures();
        showToast('Expenditure recorded successfully');
      } else {
        setError(response.error || 'Failed to create expenditure');
        showToast(response.error || 'Failed to create expenditure', 'error');
      }
    } catch (error) {
      console.error('Error creating expenditure:', error);
      setError('Failed to create expenditure. Please try again.');
      showToast('Failed to create expenditure', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (expenditureId) => {
    if (!window.confirm('Are you sure you want to delete this expenditure? This will restore the stock.')) return;
    
    try {
      setLoading(true);
      const response = await expenditureAPI.delete(expenditureId);
      if (response.ok) {
        loadExpenditures();
        showToast('Expenditure deleted and stock restored');
      } else {
        showToast(response.error || 'Failed to delete expenditure', 'error');
      }
    } catch (error) {
      console.error('Error deleting expenditure:', error);
      showToast('Failed to delete expenditure', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      baseCode: user?.role === 'admin' ? '' : user?.baseCode || '',
      equipmentCode: '',
      quantity: '',
      kind: 'assignment',
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
      base: user?.role === 'admin' ? '' : user?.baseCode || '',
      equipmentCode: '',
      kind: '',
      from: '',
      to: ''
    });
    setSearchTerm('');
  };

  const getFilteredExpenditures = () => {
    return expenditures.filter(expenditure => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          expenditure.equipmentCode.toLowerCase().includes(term) ||
          expenditure.baseCode.toLowerCase().includes(term) ||
          expenditure.createdByName.toLowerCase().includes(term) ||
          expenditure.kind.toLowerCase().includes(term) ||
          (expenditure.notes && expenditure.notes.toLowerCase().includes(term))
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

  const getKindBadge = (kind) => {
    const kindConfig = {
      assignment: { class: 'kind-assignment', label: 'Assignment', icon: 'assignment_ind' },
      consumption: { class: 'kind-consumption', label: 'Consumption', icon: 'assignment_turned_in' }
    };
    const config = kindConfig[kind] || { class: 'kind-default', label: kind, icon: 'help' };
    return (
      <span className={`kind-badge ${config.class}`}>
        <i className="material-icons">{config.icon}</i>
        {config.label}
      </span>
    );
  };

  const showNoteModal = (note) => {
    setSelectedNote(note);
  };

  const getTotalQuantity = () => {
    return getFilteredExpenditures().reduce((sum, exp) => sum + exp.quantity, 0);
  };

  const getAssignmentCount = () => {
    return getFilteredExpenditures().filter(exp => exp.kind === 'assignment').length;
  };

  const getConsumptionCount = () => {
    return getFilteredExpenditures().filter(exp => exp.kind === 'consumption').length;
  };

  const filteredExpenditures = getFilteredExpenditures();

  return (
    <div className="expenditures-container">
      <Toast toast={toast} onClose={hideToast} />
      
      <div className="expenditures-header">
        <div className="header-content">
          <h1>Equipment Expenditures</h1>
          <p>Track equipment assignments and consumption records</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="add-button"
          disabled={loading}
        >
          <i className="material-icons">add</i>
          <span>Record Expenditure</span>
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
              placeholder="Search by equipment, base, creator, or notes..."
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
            <i className="material-icons filter-icon">category</i>
            <select
              name="kind"
              value={filters.kind}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="assignment">Assignment</option>
              <option value="consumption">Consumption</option>
            </select>
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

      <div className="expenditures-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="material-icons">receipt_long</i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{filteredExpenditures.length}</div>
            <div className="stat-label">Total Records</div>
          </div>
        </div>

        <div className="stat-card assignment">
          <div className="stat-icon">
            <i className="material-icons">assignment_ind</i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{getAssignmentCount()}</div>
            <div className="stat-label">Assignments</div>
          </div>
        </div>
        <div className="stat-card consumption">
          <div className="stat-icon">
            <i className="material-icons">assignment_turned_in</i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{getConsumptionCount()}</div>
            <div className="stat-label">Consumptions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="material-icons">inventory_2</i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{getTotalQuantity()}</div>
            <div className="stat-label">Total Quantity</div>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Record Equipment Expenditure</h3>
              <button 
                onClick={() => {setShowAddForm(false); resetForm();}}
                className="close-button"
              >
                <i className="material-icons">close</i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="expenditure-form">
              {user?.role === 'admin' && (
                <div className="form-group">
                  <label>Base Code *</label>
                  <BaseSelect
                    value={formData.baseCode}
                    onChange={(e) => setFormData({...formData, baseCode: e.target.value})}
                    required
                    placeholder="Select Base"
                  />
                </div>
              )}
              
              <div className="form-group">
                <label>Equipment *</label>
                <EquipmentSelect
                  value={formData.equipmentCode}
                  onChange={(e) => setFormData({...formData, equipmentCode: e.target.value})}
                  required
                  placeholder="Select Equipment"
                />
              </div>

              <div className="form-group">
                <label>Quantity *</label>
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
                <label>Type *</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="assignment"
                      checked={formData.kind === 'assignment'}
                      onChange={(e) => setFormData({...formData, kind: e.target.value})}
                      required
                    />
                    <span className="radio-custom"></span>
                    <div className="radio-content">
                      <i className="material-icons">assignment_ind</i>
                      <div>
                        <strong>Assignment</strong>
                        <small>Equipment assigned to personnel</small>
                      </div>
                    </div>
                  </label>
                  
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="consumption"
                      checked={formData.kind === 'consumption'}
                      onChange={(e) => setFormData({...formData, kind: e.target.value})}
                      required
                    />
                    <span className="radio-custom"></span>
                    <div className="radio-content">
                      <i className="material-icons">local_dining</i>
                      <div>
                        <strong>Consumption</strong>
                        <small>Equipment consumed or used up</small>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                  placeholder="Additional notes or details (optional)"
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
                  {loading ? 'Recording...' : 'Record Expenditure'}
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
              <h3>Expenditure Notes</h3>
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

      <div className="expenditures-list">
        {loading && expenditures.length === 0 ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <span>Loading expenditures...</span>
          </div>
        ) : filteredExpenditures.length === 0 ? (
          <div className="no-data">
            <i className="material-icons no-data-icon">receipt_long</i>
            <h3>No Expenditure Records</h3>
            <p>
              {expenditures.length === 0 
                ? "No equipment expenditures have been recorded yet"
                : "No expenditures match your current search or filters"
              }
            </p>
            {expenditures.length === 0 ? (
              <button 
                onClick={() => setShowAddForm(true)}
                className="add-button-secondary"
              >
                <i className="material-icons">add</i>
                Record First Expenditure
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
            <div className="desktop-table">
              <div className="expenditures-table">
                <div className="table-header">
                  <div className="table-cell">Date</div>
                  <div className="table-cell">Base</div>
                  <div className="table-cell">Equipment</div>
                  <div className="table-cell">Quantity</div>
                  <div className="table-cell">Type</div>
                  <div className="table-cell">Created By</div>
                  {user?.role === 'admin' && <div className="table-cell">Actions</div>}
                </div>
                
                {filteredExpenditures.map(expenditure => (
                  <div key={expenditure._id} className="table-row">
                    <div className="table-cell">
                      <div className="date-info">{formatDate(expenditure.createdAt)}</div>
                    </div>
                    <div className="table-cell">
                      <span className="base-code">{expenditure.baseCode}</span>
                    </div>
                    <div className="table-cell">
                      <div className="equipment-info">
                        <span className="equipment-name">{expenditure.equipmentCode}</span>
                        {expenditure.notes && (
                          <button 
                            className="note-button"
                            onClick={() => showNoteModal(expenditure.notes)}
                            title="View notes"
                          >
                            <i className="material-icons">info</i>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="table-cell">
                      <span className="quantity">{expenditure.quantity}</span>
                    </div>
                    <div className="table-cell">
                      {getKindBadge(expenditure.kind)}
                    </div>
                    <div className="table-cell">
                      <div className="creator-info">{expenditure.createdByName}</div>
                    </div>
                    {user?.role === 'admin' && (
                      <div className="table-cell">
                        <button
                          onClick={() => handleDelete(expenditure._id)}
                          className="delete-button"
                          disabled={loading}
                          title="Delete expenditure (restores stock)"
                        >
                          <i className="material-icons">delete</i>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mobile-cards">
              {filteredExpenditures.map(expenditure => (
                <div key={expenditure._id} className="expenditure-card">
                  <div className="card-header">
                    <div className="card-header-left">
                      <span className="base-code">{expenditure.baseCode}</span>
                      <span className="date-info">{formatDate(expenditure.createdAt)}</span>
                    </div>
                    {getKindBadge(expenditure.kind)}
                  </div>
                  <div className="card-content">
                    <div className="equipment-row">
                      <h4 className="equipment-name">{expenditure.equipmentCode}</h4>
                      {expenditure.notes && (
                        <button 
                          className="note-button"
                          onClick={() => showNoteModal(expenditure.notes)}
                          title="View notes"
                        >
                          <i className="material-icons">info</i>
                        </button>
                      )}
                    </div>
                    <div className="card-details">
                      <div className="detail-item">
                        <i className="material-icons">inventory_2</i>
                        <span>Quantity: {expenditure.quantity}</span>
                      </div>
                      <div className="detail-item">
                        <i className="material-icons">person</i>
                        <span>By: {expenditure.createdByName}</span>
                      </div>
                    </div>
                  </div>
                  {user?.role === 'admin' && (
                    <div className="card-actions">
                      <button
                        onClick={() => handleDelete(expenditure._id)}
                        className="delete-button"
                        disabled={loading}
                      >
                        <i className="material-icons">delete</i>
                        Delete & Restore Stock
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Expenditures;
