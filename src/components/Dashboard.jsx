import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, baseAPI } from '../services/api';
import BaseMap from './BaseMap';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [baseLoading, setBaseLoading] = useState(false);
  const [selectedBase, setSelectedBase] = useState('ALL');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminDashboard();
      fetchBases();
    } else if (user?.baseCode) {
      loadBaseDashboard();
    }
  }, [user]);

  const fetchBases = async () => {
    try {
      const response = await baseAPI.list();
      if (response.ok) {
        setBases(response.items || []);
      }
    } catch (error) {
      console.error('Error fetching bases:', error);
    }
  };

  const loadAdminDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await dashboardAPI.getAdminDashboard();
      if (response.ok) {
        setAdminData(response);
        setDashboardData(null);
      } else {
        setError('Failed to load admin dashboard');
      }
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
      setError('Error loading admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadBaseDashboard = async (baseCode = null) => {
    try {
      setBaseLoading(true);
      setError('');
      
      const response = await dashboardAPI.getBaseDashboard(baseCode);
      if (response.ok) {
        setDashboardData(response);
        setAdminData(null);
      } else {
        setError(response.error || 'Failed to load base dashboard');
      }
    } catch (error) {
      console.error('Error loading base dashboard:', error);
      setError('Error loading base dashboard');
    } finally {
      setBaseLoading(false);
    }
  };

  const handleBaseChange = (baseCode) => {
    setSelectedBase(baseCode);
    
    if (baseCode === 'ALL') {
      if (user?.role === 'admin') {
        loadAdminDashboard();
      }
    } else if (baseCode && baseCode.trim()) {
      loadBaseDashboard(baseCode.trim().toUpperCase());
    } else {
      setDashboardData(null);
      setAdminData(null);
      setError('');
    }
  };

  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not available';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const StatCard = ({ icon, title, value, subtitle, color = 'primary' }) => (
    <div className={`metric-card metric-${color}`}>
      <div className="metric-header">
        <div className="metric-icon">
          <i className="material-icons">{icon}</i>
        </div>
        <div className="metric-value">{formatNumber(value)}</div>
      </div>
      <div className="metric-info">
        <h4>{title}</h4>
        {subtitle && <span className="metric-subtitle">{subtitle}</span>}
      </div>
    </div>
  );

  const renderSystemOverview = () => {
    const global = adminData?.global || {};
    const transfers = global.transfersByStatus || {};
    
    return (
      <div className="dashboard-section">
        <div className="section-header">
          <h2>System Overview</h2>
          <p>Military operations command center - All bases</p>
        </div>
        
        <div className="metrics-container">
          <StatCard
            icon="domain"
            title="Military Bases"
            value={global.baseCount || 0}
            color="primary"
          />
          <StatCard
            icon="inventory_2"
            title="Equipment Types"
            value={global.equipmentActiveCount || 0}
            color="primary"
          />
          <StatCard
            icon="warehouse"
            title="Total Inventory"
            value={global.onHandTotalQty || 0}
            subtitle="Items in stock"
            color="success"
          />
          <StatCard
            icon="swap_horiz"
            title="Active Transfers"
            value={(transfers.pending || 0) + (transfers.open || 0) + (transfers.claimed || 0) + (transfers.sent || 0)}
            subtitle="In progress"
            color="info"
          />
        </div>

        <div className="transfer-status">
          <h3>Transfer Pipeline</h3>
          <div className="status-grid">
            <div className="status-item status-warning">
              <span className="status-value">{transfers.pending || 0}</span>
              <span className="status-label">Pending</span>
            </div>
            <div className="status-item status-info">
              <span className="status-value">{transfers.open || 0}</span>
              <span className="status-label">Open</span>
            </div>
            <div className="status-item status-secondary">
              <span className="status-value">{transfers.claimed || 0}</span>
              <span className="status-label">Claimed</span>
            </div>
            <div className="status-item status-secondary">
              <span className="status-value">{transfers.sent || 0}</span>
              <span className="status-label">In Transit</span>
            </div>
            <div className="status-item status-success">
              <span className="status-value">{transfers.received || 0}</span>
              <span className="status-label">Completed</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBaseDashboard = () => {
    const base = dashboardData?.base || '';
    const kpis = dashboardData?.kpis || {};
    const purchases = kpis.purchases || {};
    const transfersIn = kpis.transfersIn || {};
    const transfersOut = kpis.transfersOut || {};
    const expenditures = kpis.expenditures || {};
    const requests = kpis.requests || {};
    const onHandByEquipment = dashboardData?.onHandByEquipment || [];
    
    return (
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Base Operations - {base}</h2>
          <p>Operational metrics and inventory status</p>
        </div>
        
        <div className="metrics-container">
          <StatCard
            icon="warehouse"
            title="Current Stock"
            value={kpis.onHandTotalQty || 0}
            subtitle="Items on hand"
            color="primary"
          />
          <StatCard
            icon="shopping_cart"
            title="Purchases"
            value={purchases.totalCount || 0}
            subtitle={`${formatNumber(purchases.totalQty || 0)} items`}
            color="success"
          />
          <StatCard
            icon="receipt_long"
            title="Expenditures"
            value={expenditures.totalCount || 0}
            subtitle={`${formatNumber(expenditures.totalQty || 0)} items`}
            color="warning"
          />
          <StatCard
            icon="sync_alt"
            title="Transfers"
            value={(transfersIn.totalCount || 0) + (transfersOut.totalCount || 0)}
            subtitle={`${formatNumber(transfersIn.totalCount || 0)} in, ${formatNumber(transfersOut.totalCount || 0)} out`}
            color="info"
          />
        </div>

        {onHandByEquipment.length > 0 && (
          <div className="inventory-section">
            <div className="inventory-header">
              <h3>Equipment Inventory</h3>
              <span className="inventory-count">{onHandByEquipment.length} items</span>
            </div>
            
            <div className="inventory-list">
              {onHandByEquipment.slice(0, 8).map(item => (
                <div key={item.equipmentCode} className="inventory-item">
                  <div className="item-info">
                    <span className="item-code">{item.equipmentCode}</span>
                    <div className={`stock-indicator ${item.onHand > 10 ? 'high' : item.onHand > 0 ? 'low' : 'empty'}`}>
                      <i className="material-icons">
                        {item.onHand > 10 ? 'check_circle' : item.onHand > 0 ? 'warning' : 'error'}
                      </i>
                    </div>
                  </div>
                  <div className="item-quantity">
                    <span className="quantity-value">{formatNumber(item.onHand)}</span>
                    <span className="quantity-label">on hand</span>
                  </div>
                </div>
              ))}
              
              {onHandByEquipment.length > 8 && (
                <div className="inventory-more">
                  <span>+{onHandByEquipment.length - 8} more items</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Toast toast={toast} onClose={hideToast} />
      
      <div className="dashboard-header">
        <div className="header-background"></div>
        <div className="header-content">
          <h1>{user?.role === 'admin' ? 'Admin Dashboard' : `Base Dashboard`}</h1>
          <p>{user?.role === 'admin' ? 'System-wide operations overview' : `${user?.baseCode} Operations`}</p>
        </div>
        {/* <button onClick={() => window.location.reload()} className="refresh-btn">
          <i className="material-icons">refresh</i>
          Refresh
        </button> */}
      </div>

      {error && (
        <div className="error-alert">
          <i className="material-icons">error_outline</i>
          <span>{error}</span>
          <button onClick={() => setError('')} className="error-close">
            <i className="material-icons">close</i>
          </button>
        </div>
      )}

      {user?.role === 'admin' && (
        <div className="map-and-selection">
          <div className="map-column">
            <BaseMap 
              onBaseSelect={handleBaseChange}
              selectedBase={selectedBase}
            />
          </div>
          
          <div className="selection-column">
            <div className="view-selector">
              <div className="selector-header">
                <h3>
                  <i className="material-icons">tune</i>
                  View Selection
                </h3>
                <p>Choose between system overview or specific base details</p>
              </div>
              
              <div className="selection-options">
                <div 
                  className={`selection-option ${selectedBase === 'ALL' ? 'selected' : ''}`}
                  onClick={() => handleBaseChange('ALL')}
                >
                  <div className="option-icon all-bases">
                    <i className="material-icons">public</i>
                  </div>
                  <div className="option-details">
                    <span className="option-name">All Bases</span>
                    <span className="option-description">System Overview</span>
                  </div>
                  <div className="option-indicator">
                    <i className="material-icons">
                      {selectedBase === 'ALL' ? 'radio_button_checked' : 'radio_button_unchecked'}
                    </i>
                  </div>
                </div>

                <div className="separator">
                  <span>Individual Bases</span>
                </div>

                <div className="base-options">
                  {baseLoading && (
                    <div className="loading-bases">
                      <div className="loading-dot"></div>
                      <span>Loading bases...</span>
                    </div>
                  )}
                  
                  {bases.map((base) => (
                    <div 
                      key={base._id}
                      className={`selection-option ${selectedBase === base.baseCode ? 'selected' : ''}`}
                      onClick={() => handleBaseChange(base.baseCode)}
                    >
                      <div className="option-icon">
                        <i className="material-icons">business</i>
                      </div>
                      <div className="option-details">
                        <span className="option-name">{base.baseCode}</span>
                        <span className="option-meta">
                          Created: {formatDate(base.createdAt)}
                        </span>
                      </div>
                      <div className="option-indicator">
                        <i className="material-icons">
                          {selectedBase === base.baseCode ? 'radio_button_checked' : 'radio_button_unchecked'}
                        </i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        {user?.role === 'admin' ? (
          selectedBase === 'ALL' && adminData ? 
            renderSystemOverview() : 
            selectedBase !== 'ALL' && dashboardData ? 
              renderBaseDashboard() : 
              <div className="empty-state">
                <i className="material-icons">dashboard</i>
                <h3>Select a View</h3>
                <p>Choose "All Bases" for system overview or select a specific base</p>
              </div>
        ) : (
          dashboardData && renderBaseDashboard()
        )}
      </div>
    </div>
  );
};

export default Dashboard;
