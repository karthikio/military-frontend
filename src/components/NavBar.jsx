import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NavBar.css';

const NavBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
    setIsMobileMenuOpen(false);
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      'admin': 'Admin',
      'base_commander': 'Base Commander',
      'logistics_officer': 'Logistics Officer',
    };
    return roleMap[role] || role.replace('_', ' ').toUpperCase();
  };

  const handleRoleClick = () => {
    navigate('/profile');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    {
      path: '/dashboard',
      icon: 'dashboard',
      label: 'Dashboard',
      roles: ['admin', 'base_commander', 'logistics_officer', 'inventory_manager']
    },
    {
      path: '/purchases',
      icon: 'shopping_cart',
      label: 'Purchases',
      roles: ['admin', 'base_commander', 'logistics_officer', 'inventory_manager']
    },
    {
      path: '/transfers',
      icon: 'swap_horiz',
      label: 'Transfers',
      roles: ['admin', 'base_commander', 'logistics_officer', 'inventory_manager']
    },
    {
      path: '/equipment',
      icon: 'inventory',
      label: 'Equipment',
      roles: ['admin']
    },
    {
      path: '/bases',
      icon: 'business',
      label: 'Bases',
      roles: ['admin']
    },
    {
      path: '/expenditures',
      icon: 'receipt_long',
      label: 'Expenditures',
      roles: ['admin', 'base_commander', 'logistics_officer']
    }
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-logo">
            <i className="material-icons">security</i>
          </div>
          <div className="brand-text">
            <span className="brand-name">MIL-INVENTORY</span>
            <span className="brand-tagline">Military Asset Management</span>
          </div>
        </div>

        <div className="navbar-nav desktop-nav">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <i className="material-icons nav-icon">{item.icon}</i>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="navbar-role desktop-only">
          <div 
            className="role-badge"
            onClick={handleRoleClick}
          >
            <div className="role-icon">
              <i className="material-icons">badge</i>
            </div>
            <span className="role-text">{getRoleDisplay(user.role)}</span>
          </div>
        </div>

        <button 
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <i className="material-icons">
            {isMobileMenuOpen ? 'close' : 'menu'}
          </i>
        </button>
      </div>

      <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <div className="mobile-profile">
            <div className="mobile-avatar">
              <i className="material-icons">account_circle</i>
            </div>
            <div className="mobile-info">
              <span className="mobile-name">{user.name}</span>
              <span className="mobile-role">{getRoleDisplay(user.role)}</span>
              <span className="mobile-base">Base: {user.baseCode}</span>
            </div>
          </div>
        </div>

        <div className="mobile-nav-items">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <i className="material-icons">{item.icon}</i>
              <span>{item.label}</span>
              {isActive(item.path) && (
                <i className="material-icons active-indicator">check_circle</i>
              )}
            </Link>
          ))}
          
          <Link
            to="/profile"
            className={`mobile-nav-link ${isActive('/profile') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <i className="material-icons">person</i>
            <span>Profile</span>
            {isActive('/profile') && (
              <i className="material-icons active-indicator">check_circle</i>
            )}
          </Link>
        </div>

        <div className="mobile-nav-footer">
          <button 
            className="mobile-logout-btn"
            onClick={handleLogout}
          >
            <i className="material-icons">logout</i>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={closeMobileMenu}
        ></div>
      )}
    </nav>
  );
};

export default NavBar;
