import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { transferAPI } from '../services/api';
import EquipmentSelect from './EquipmentSelect';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';
import './Transfers.css';

const Transfers = () => {
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [activeTab, setActiveTab] = useState('my-transfers');
  const [myTransfers, setMyTransfers] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [formData, setFormData] = useState({
    requestBase: user?.role === 'admin' ? '' : user?.baseCode || '',
    equipmentCode: '',
    quantity: '',
    notes: ''
  });
  const [filters, setFilters] = useState({
    status: '',
    equipmentCode: ''
  });

  useEffect(() => {
    if (activeTab === 'my-transfers') {
      loadMyTransfers();
    } else if (activeTab === 'approved-requests') {
      loadApprovedRequests();
    }
  }, [activeTab, filters]);

  const loadMyTransfers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.equipmentCode) params.equipmentCode = filters.equipmentCode;

      const response = await transferAPI.list(params);
      if (response.ok) {
        setMyTransfers(response.items || []);
      }
    } catch (error) {
      console.error('Error loading transfers:', error);
      showToast('Failed to load transfers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadApprovedRequests = async () => {
    try {
      setLoading(true);
      const response = await transferAPI.listOpen();
      if (response.ok) {
        setApprovedRequests(response.items || []);
      }
    } catch (error) {
      console.error('Error loading approved requests:', error);
      showToast('Failed to load approved requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const requestData = {
        ...formData,
        quantity: parseInt(formData.quantity, 10)
      };

      const response = await transferAPI.createRequest(requestData);
      if (response.ok) {
        setShowRequestForm(false);
        resetForm();
        loadMyTransfers();
        showToast('Transfer request created successfully', 'success');
      } else {
        showToast(response.error || 'Failed to create request', 'error');
      }
    } catch (error) {
      console.error('Error creating request:', error);
      showToast('Failed to create request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transferId) => {
    try {
      setLoading(true);
      const response = await transferAPI.approve(transferId);
      if (response.ok) {
        loadMyTransfers();
        showToast('Request approved successfully', 'success');
      } else {
        showToast(response.error || 'Failed to approve request', 'error');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      showToast('Failed to approve request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (transferId) => {
    try {
      setLoading(true);
      const acceptData = user?.role === 'admin' ? { supplierBase: user?.baseCode } : {};
      const response = await transferAPI.claim(transferId, acceptData);
      if (response.ok) {
        loadApprovedRequests();
        loadMyTransfers();
        showToast('Request accepted successfully', 'success');
      } else {
        showToast(response.error || 'Failed to accept request', 'error');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      showToast('Failed to accept request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (transferId) => {
    try {
      setLoading(true);
      const response = await transferAPI.send(transferId);
      if (response.ok) {
        loadMyTransfers();
        showToast('Equipment sent successfully', 'success');
      } else {
        showToast(response.error || 'Failed to send equipment', 'error');
      }
    } catch (error) {
      console.error('Error sending equipment:', error);
      showToast('Failed to send equipment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReceive = async (transferId) => {
    try {
      setLoading(true);
      const response = await transferAPI.receive(transferId);
      if (response.ok) {
        loadMyTransfers();
        showToast('Equipment received successfully', 'success');
      } else {
        showToast(response.error || 'Failed to receive equipment', 'error');
      }
    } catch (error) {
      console.error('Error receiving equipment:', error);
      showToast('Failed to receive equipment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      requestBase: user?.role === 'admin' ? '' : user?.baseCode || '',
      equipmentCode: '',
      quantity: '',
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
      status: '',
      equipmentCode: ''
    });
  };

  const showNoteModal = (note) => {
    setSelectedNote(note);
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) : '-';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-pending', label: 'Pending', icon: 'schedule' },
      open: { class: 'status-approved', label: 'Approved', icon: 'check_circle' },
      claimed: { class: 'status-accepted', label: 'Accepted', icon: 'handshake' },
      sent: { class: 'status-sent', label: 'Sent', icon: 'local_shipping' },
      received: { class: 'status-received', label: 'Received', icon: 'check_circle' }
    };
    const config = statusConfig[status] || { class: 'status-default', label: status, icon: 'help' };
    return (
      <span className={`status-badge ${config.class}`}>
        <i className="material-icons">{config.icon}</i>
        {config.label}
      </span>
    );
  };

  const canApprove = (transfer) => {
    return transfer.status === 'pending' && 
           (user?.role === 'admin' || 
            (user?.role === 'base_commander' && user?.baseCode === transfer.requestBase));
  };

  const canSend = (transfer) => {
    return transfer.status === 'claimed' && 
           (user?.role === 'admin' || 
            (user?.role === 'base_commander' && user?.baseCode === transfer.supplierBase));
  };

  const canReceive = (transfer) => {
    return transfer.status === 'sent' && 
           (user?.role === 'admin' || 
            (['base_commander', 'logistics_officer'].includes(user?.role) && user?.baseCode === transfer.requestBase));
  };

  return (
    <div className="transfers-container">
      <Toast toast={toast} onClose={hideToast} />
      
      <div className="transfers-header">
        <div className="header-content">
          <h1>Equipment Transfers</h1>
          <p>Manage equipment requests and supplies between bases</p>
        </div>
        <button 
          onClick={() => setShowRequestForm(true)}
          className="add-button"
          disabled={loading}
        >
          <i className="material-icons">add</i>
          <span>New Request</span>
        </button>
      </div>

      <div className="tabs-section">
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 'my-transfers' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-transfers')}
          >
            <i className="material-icons">swap_horiz</i>
            My Requests & Supplies
          </button>
          <button 
            className={`tab-button ${activeTab === 'approved-requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved-requests')}
          >
            <i className="material-icons">check_circle</i>
            Approved Requests
          </button>
        </div>
      </div>

      {activeTab === 'my-transfers' && (
        <div className="controls-section">
          <div className="filters-wrapper">
            <div className="filter-group">
              <i className="material-icons filter-icon">filter_list</i>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="open">Approved</option>
                <option value="claimed">Accepted</option>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
              </select>
            </div>

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

            <button 
              onClick={clearFilters}
              className="clear-filters-btn"
              title="Clear all filters"
            >
              <i className="material-icons">clear_all</i>
            </button>
          </div>
        </div>
      )}

      {showRequestForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Equipment Request</h3>
              <button 
                onClick={() => {setShowRequestForm(false); resetForm();}}
                className="close-button"
              >
                <i className="material-icons">close</i>
              </button>
            </div>
            
            <form onSubmit={handleCreateRequest} className="request-form">
              {user?.role === 'admin' && (
                <div className="form-group">
                  <label>Request Base</label>
                  <input
                    type="text"
                    value={formData.requestBase}
                    onChange={(e) => setFormData({...formData, requestBase: e.target.value})}
                    required
                    placeholder="Enter base code"
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
                  placeholder="Enter quantity needed"
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                  placeholder="Additional notes or justification (optional)"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => {setShowRequestForm(false); resetForm();}}
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
                  {loading ? 'Creating...' : 'Create Request'}
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
              <h3>Transfer Notes</h3>
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

      <div className="transfers-content">
        {activeTab === 'my-transfers' && (
          <div className="transfers-list">
            {loading && myTransfers.length === 0 ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <span>Loading transfers...</span>
              </div>
            ) : myTransfers.length === 0 ? (
              <div className="no-data">
                <i className="material-icons no-data-icon">swap_horiz</i>
                <h3>No Transfer Records</h3>
                <p>No equipment transfers found matching your criteria</p>
                <button 
                  onClick={() => setShowRequestForm(true)}
                  className="add-button-secondary"
                >
                  <i className="material-icons">add</i>
                  Create First Request
                </button>
              </div>
            ) : (
              <>
                <div className="transfers-table desktop-only">
                  <div className="table-header">
                    <div className="table-cell">Date</div>
                    <div className="table-cell">Equipment</div>
                    <div className="table-cell">Quantity</div>
                    <div className="table-cell">From Base</div>
                    <div className="table-cell">To Base</div>
                    <div className="table-cell">Status</div>
                    <div className="table-cell">Actions</div>
                  </div>
                  
                  {myTransfers.map(transfer => (
                    <div key={transfer._id} className="table-row">
                      <div className="table-cell">
                        <div className="date-info">{formatDate(transfer.requestedAt)}</div>
                      </div>
                      <div className="table-cell">
                        <div className="equipment-info">
                          <span className="equipment-name">{transfer.equipmentCode}</span>
                          {transfer.notes && (
                            <button 
                              className="note-button"
                              onClick={() => showNoteModal(transfer.notes)}
                              title="View notes"
                            >
                              <i className="material-icons">info</i>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="table-cell">
                        <span className="quantity">{transfer.quantity}</span>
                      </div>
                      <div className="table-cell">
                        <span className="base-code">
                          {transfer.supplierBase || '-'}
                        </span>
                      </div>
                      <div className="table-cell">
                        <span className="base-code">{transfer.requestBase}</span>
                      </div>
                      <div className="table-cell">
                        {getStatusBadge(transfer.status)}
                      </div>
                      <div className="table-cell">
                        <div className="action-buttons">
                          {canApprove(transfer) && (
                            <button
                              onClick={() => handleApprove(transfer._id)}
                              className="action-button approve-button"
                              disabled={loading}
                              title="Approve request"
                            >
                              <i className="material-icons">check</i>
                            </button>
                          )}
                          {canSend(transfer) && (
                            <button
                              onClick={() => handleSend(transfer._id)}
                              className="action-button send-button"
                              disabled={loading}
                              title="Mark as sent"
                            >
                              <i className="material-icons">local_shipping</i>
                            </button>
                          )}
                          {canReceive(transfer) && (
                            <button
                              onClick={() => handleReceive(transfer._id)}
                              className="action-button receive-button"
                              disabled={loading}
                              title="Mark as received"
                            >
                              <i className="material-icons">check_circle</i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="transfers-cards mobile-only">
                  {myTransfers.map(transfer => (
                    <div key={transfer._id} className="transfer-card">
                      <div className="card-header">
                        <div className="transfer-id">
                          <span className="base-code">
                            {transfer.supplierBase || 'Pending'}
                          </span>
                          <i className="material-icons">arrow_forward</i>
                          <span className="base-code">{transfer.requestBase}</span>
                        </div>
                        {getStatusBadge(transfer.status)}
                      </div>
                      <div className="card-content">
                        <div className="equipment-row">
                          <h4 className="equipment-name">{transfer.equipmentCode}</h4>
                          {transfer.notes && (
                            <button 
                              className="note-button"
                              onClick={() => showNoteModal(transfer.notes)}
                              title="View notes"
                            >
                              <i className="material-icons">info</i>
                            </button>
                          )}
                        </div>
                        <div className="card-details">
                          <div className="detail-item">
                            <i className="material-icons">inventory_2</i>
                            <span>Quantity: {transfer.quantity}</span>
                          </div>
                          <div className="detail-item">
                            <i className="material-icons">schedule</i>
                            <span>Requested: {formatDate(transfer.requestedAt)}</span>
                          </div>
                        </div>
                      </div>
                      {(canApprove(transfer) || canSend(transfer) || canReceive(transfer)) && (
                        <div className="card-actions">
                          {canApprove(transfer) && (
                            <button
                              onClick={() => handleApprove(transfer._id)}
                              className="action-button approve-button"
                              disabled={loading}
                            >
                              <i className="material-icons">check</i>
                              Approve
                            </button>
                          )}
                          {canSend(transfer) && (
                            <button
                              onClick={() => handleSend(transfer._id)}
                              className="action-button send-button"
                              disabled={loading}
                            >
                              <i className="material-icons">local_shipping</i>
                              Send
                            </button>
                          )}
                          {canReceive(transfer) && (
                            <button
                              onClick={() => handleReceive(transfer._id)}
                              className="action-button receive-button"
                              disabled={loading}
                            >
                              <i className="material-icons">check_circle</i>
                              Receive
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'approved-requests' && (
          <div className="approved-requests-list">
            {loading && approvedRequests.length === 0 ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <span>Loading approved requests...</span>
              </div>
            ) : approvedRequests.length === 0 ? (
              <div className="no-data">
                <i className="material-icons no-data-icon">check_circle</i>
                <h3>No Approved Requests</h3>
                <p>No equipment requests available for accepting at this time</p>
              </div>
            ) : (
              <>
                <div className="transfers-table desktop-only">
                  <div className="table-header">
                    <div className="table-cell">Date</div>
                    <div className="table-cell">Equipment</div>
                    <div className="table-cell">Quantity</div>
                    <div className="table-cell">Requesting Base</div>
                    <div className="table-cell">Created By</div>
                    <div className="table-cell">Actions</div>
                  </div>
                  
                  {approvedRequests.map(transfer => (
                    <div key={transfer._id} className="table-row">
                      <div className="table-cell">
                        <div className="date-info">{formatDate(transfer.requestedAt)}</div>
                      </div>
                      <div className="table-cell">
                        <div className="equipment-info">
                          <span className="equipment-name">{transfer.equipmentCode}</span>
                          {transfer.notes && (
                            <button 
                              className="note-button"
                              onClick={() => showNoteModal(transfer.notes)}
                              title="View notes"
                            >
                              <i className="material-icons">info</i>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="table-cell">
                        <span className="quantity">{transfer.quantity}</span>
                      </div>
                      <div className="table-cell">
                        <span className="base-code">{transfer.requestBase}</span>
                      </div>
                      <div className="table-cell">
                        <div className="creator-info">{transfer.createdByName}</div>
                      </div>
                      <div className="table-cell">
                        <button
                          onClick={() => handleAccept(transfer._id)}
                          className="action-button accept-button"
                          disabled={loading}
                          title="Accept this request"
                        >
                          <i className="material-icons">handshake</i>
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="transfers-cards mobile-only">
                  {approvedRequests.map(transfer => (
                    <div key={transfer._id} className="transfer-card">
                      <div className="card-header">
                        <span className="base-code">{transfer.requestBase}</span>
                        <span className="date-info">{formatDate(transfer.requestedAt)}</span>
                      </div>
                      <div className="card-content">
                        <div className="equipment-row">
                          <h4 className="equipment-name">{transfer.equipmentCode}</h4>
                          {transfer.notes && (
                            <button 
                              className="note-button"
                              onClick={() => showNoteModal(transfer.notes)}
                              title="View notes"
                            >
                              <i className="material-icons">info</i>
                            </button>
                          )}
                        </div>
                        <div className="card-details">
                          <div className="detail-item">
                            <i className="material-icons">inventory_2</i>
                            <span>Quantity: {transfer.quantity}</span>
                          </div>
                          <div className="detail-item">
                            <i className="material-icons">person</i>
                            <span>By: {transfer.createdByName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="card-actions">
                        <button
                          onClick={() => handleAccept(transfer._id)}
                          className="action-button accept-button"
                          disabled={loading}
                        >
                          <i className="material-icons">handshake</i>
                          Accept Request
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transfers;
