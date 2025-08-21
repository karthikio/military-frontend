import React from 'react';
import { useEquipmentList } from '../hooks/useEquipmentList';
import './EquipmentSelect.css';

const EquipmentSelect = ({ 
  value, 
  onChange, 
  placeholder = "Select Equipment", 
  disabled = false, 
  required = false,
  className = "",
  name = "equipmentCode"
}) => {
  const { equipment, loading, error } = useEquipmentList();

  if (error) {
    return (
      <select className={`equipment-select error ${className}`} disabled>
        <option>Error loading equipment</option>
      </select>
    );
  }

  return (
    <select
      name={name}
      value={value || ''}
      onChange={onChange}
      disabled={disabled || loading}
      required={required}
      className={`equipment-select ${className}`}
    >
      <option value="">
        {loading ? 'Loading equipment...' : placeholder}
      </option>
      {equipment
        .filter(item => item.active)
        .map(item => (
          <option key={item.code} value={item.code}>
            {item.name} ({item.code}) - {item.category}
          </option>
        ))}
    </select>
  );
};

export default EquipmentSelect;
