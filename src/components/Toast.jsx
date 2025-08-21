import React from 'react';
import './Toast.css';

const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-content">
        <i className="material-icons toast-icon">
          {toast.type === 'success' ? 'check_circle' : 'error'}
        </i>
        <span className="toast-message">{toast.message}</span>
        <button onClick={onClose} className="toast-close">
          <i className="material-icons">close</i>
        </button>
      </div>
    </div>
  );
};

export default Toast;
