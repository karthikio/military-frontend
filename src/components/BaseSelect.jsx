import React, { useState, useEffect } from 'react';
import { baseAPI } from '../services/api';

const BaseSelect = ({ value, onChange, placeholder = "Select Base", className = "", disabled = false, asOptions = false, ...props }) => {
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBases();
  }, []);

  const fetchBases = async () => {
    try {
      setLoading(true);
      const response = await baseAPI.list();
      if (response.ok) {
        setBases(response.items || []);
      }
    } catch (error) {
      console.error('Error fetching bases:', error);
    } finally {
      setLoading(false);
    }
  };

  if (asOptions) {
    return (
      <>
        {loading ? (
          <option disabled>Loading bases...</option>
        ) : (
          bases.map(base => (
            <option key={base._id} value={base.baseCode}>
              {base.baseCode}
            </option>
          ))
        )}
      </>
    );
  }

  return (
    <select
      value={value}
      onChange={onChange}
      className={className}
      disabled={disabled || loading}
      {...props}
    >
      <option value="">{loading ? 'Loading...' : placeholder}</option>
      {bases.map(base => (
        <option key={base._id} value={base.baseCode}>
          {base.baseCode}
        </option>
      ))}
    </select>
  );
};

export default BaseSelect;
