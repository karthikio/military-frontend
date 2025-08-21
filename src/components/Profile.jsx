import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      'admin': 'System Administrator',
      'base_commander': 'Base Commander',
      'logistics_officer': 'Logistics Officer',
    };
    return roleMap[role] || role.replace('_', ' ').charAt(0).toUpperCase() + role.replace('_', ' ').slice(1);
  };

  const getRoleColor = (role) => {
    const colorMap = {
      'admin': 'admin',
      'base_commander': 'commander',
      'logistics_officer': 'logistics',
    };
    return colorMap[role] || 'default';
  };


  const getPermissions = (role) => {
    const permissions = {
  admin: [
    'Manage all bases and inventory',
    'Manage equipment catalog (create, edit, retire)',
    'Approve, claim, send and receive any transfer',
    'Create purchases for any base',
    'Delete purchases, transfers and expenditures',
    'View system-wide analytics and dashboards',
    'Full system access'
  ],
  base_commander: [
    'Approve transfer requests for my base',
    'Claim and send supplies from my base',
    'Receive incoming transfers to my base',
    'Create purchases for my base',
    'Create expenditures (assignment/consumption) for my base',
    'View base stock and analytics'
  ],
  logistics_officer: [
    'Create transfer requests for my base',
    'Receive incoming transfers to my base',
    'Create purchases for my base',
    'Create expenditures (assignment/consumption) for my base',
    'View base stock and requests'
  ]
};

    return permissions[role] || ['Basic system access'];
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="header-content">
          <h1>Profile</h1>
          <p>Personal information and access credentials</p>
        </div>
        <div className="header-actions">
          <button className="logout-button" onClick={handleLogout}>
            <i className="material-icons">logout</i>
            Sign Out
          </button>
        </div>
      </div>

      <div className="profile-main-card">
        <div className="profile-identity">
          <div className="identity-info">
            <h2 className="officer-name">{user.name}</h2>
            <div className="officer-details">
              <span className={`role-badge role-${getRoleColor(user.role)}`}>
                <i className="material-icons">military_tech</i>
                {getRoleDisplay(user.role)}
              </span>
              {user.baseCode && (
                <span className="base-assignment">
                  <i className="material-icons">business</i>
                  {user.baseCode}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="info-card contact-card">
          <div className="card-header">
            <i className="material-icons">contact_mail</i>
            <h3>Contact Information</h3>
          </div>
          <div className="card-content">
            <div className="info-item">
              <i className="material-icons">email</i>
              <div className="info-details">
                <label>Email Address</label>
                <span>{user.email}</span>
              </div>
            </div>
            <div className="info-item">
              <i className="material-icons">person</i>
              <div className="info-details">
                <label>Full Name</label>
                <span>{user.name}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="info-card assignment-card">
          <div className="card-header">
            <i className="material-icons">assignment</i>
            <h3>Assignment Details</h3>
          </div>
          <div className="card-content">
            <div className="info-item">
              <i className="material-icons">military_tech</i>
              <div className="info-details">
                <label>Current Role</label>
                <span>{getRoleDisplay(user.role)}</span>
              </div>
            </div>
            {user.baseCode ? (
              <div className="info-item">
                <i className="material-icons">business</i>
                <div className="info-details">
                  <label>Assigned Base</label>
                  <span className="base-code">{user.baseCode}</span>
                </div>
              </div>
            ) : (
              <div className="info-item">
                <i className="material-icons">business</i>
                <div className="info-details">
                  <label>Assigned Base</label>
                  <span>All_BASES</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="permissions-section">
        <div className="section-header">
          <div className="header-info">
            <i className="material-icons">verified_user</i>
            <div>
              <h3>Access Permissions</h3>
              <p>Your current system privileges and capabilities</p>
            </div>
          </div>
        </div>

        <div className="permissions-list">
          <div className="permissions-grid">
            {getPermissions(user.role).map((permission, index) => (
              <div key={index} className="permission-item">
                <i className="material-icons">check_circle</i>
                <span>{permission}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
