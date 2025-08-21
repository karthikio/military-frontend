import { useState, useEffect } from 'react';
import { equipmentAPI } from '../services/api';

export const useEquipmentList = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await equipmentAPI.list();
      if (response.ok) {
        setEquipment(response.items || []);
      } else {
        setError('Failed to load equipment');
      }
    } catch (err) {
      setError('Error fetching equipment: ' + err.message);
      console.error('Error loading equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  return { equipment, loading, error, refetch: loadEquipment };
};
