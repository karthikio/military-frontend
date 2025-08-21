import { useState, useEffect } from 'react';
import { baseAPI } from '../services/api';

export const useBaseList = () => {
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBases();
  }, []);

  const loadBases = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await baseAPI.list();
      if (response.ok) {
        setBases(response.items || []);
      } else {
        setError('Failed to load bases');
      }
    } catch (err) {
      setError('Error fetching bases: ' + err.message);
      console.error('Error loading bases:', err);
    } finally {
      setLoading(false);
    }
  };

  return { bases, loading, error, refetch: loadBases };
};
